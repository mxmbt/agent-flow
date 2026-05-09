import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { createDefaultConfig, type AgentFlowConfig } from "./defaults.js";

export interface DetectionResult {
  config: AgentFlowConfig;
  packageManager: "npm" | "pnpm" | "yarn" | null;
  needsReview: string[];
  evidence: string[];
}

interface PackageJson {
  name?: unknown;
  scripts?: unknown;
  dependencies?: unknown;
  devDependencies?: unknown;
  peerDependencies?: unknown;
}

type ScriptMap = Record<string, string>;

export async function detectProjectConfig(cwd: string): Promise<DetectionResult> {
  const packageJson = await readPackageJson(cwd);
  const packageManager = await detectPackageManager(cwd);
  const projectName = getProjectName(cwd, packageJson);
  const config = createDefaultConfig(projectName);
  const needsReview = ["project.taskPrefix", "git.integrationBranch"];
  const evidence: string[] = [];

  if (!packageJson) {
    needsReview.push("checks.default");
    evidence.push("No package.json detected; default checks require review.");
    return { config, packageManager, needsReview, evidence };
  }

  evidence.push("Detected package.json.");
  config.discovery.codeGraphProvider = "code-review-graph";
  if (!config.packs.includes("code-review-graph")) {
    config.packs.push("code-review-graph");
  }
  if (!config.packs.includes("code-review-toolkit")) {
    config.packs.push("code-review-toolkit");
  }
  needsReview.push("discovery.codeGraphProvider");
  evidence.push("Detected a code project and no existing Agent Flow config; enabled the code-review-graph pack as the default planning discovery provider. If this project uses another code graph provider, set discovery.codeGraphProvider to custom and remove or replace the pack.");
  evidence.push("Enabled the code-review-toolkit pack as recommended manual review tooling for code projects.");

  const scripts = getScripts(packageJson);
  const dependencies = getDependencyNames(packageJson);
  const run = packageManager === "yarn" ? "yarn" : `${packageManager ?? "npm"} run`;

  if (dependencies.has("next")) {
    config.packs.push("nextjs");
    evidence.push("Detected Next.js dependency; enabled the nextjs pack for App Router best-practice guidance.");
  }

  const defaultChecks = collectCommands([
    scriptCommand(scripts, "test", run),
    scriptCommand(scripts, "type-check", run),
    scriptCommand(scripts, "check-types", run)
  ]);

  if (defaultChecks.length > 0) {
    config.checks.default = defaultChecks;
    if (scripts.test) {
      config.checks.focusedTestCommand = packageManager === "yarn"
        ? "yarn test <test-file>"
        : `${run} test -- <test-file>`;
      evidence.push(`Detected focused test command: ${config.checks.focusedTestCommand}.`);
    }
    evidence.push(`Detected default checks: ${defaultChecks.join(", ")}.`);
  } else {
    needsReview.push("checks.default");
    evidence.push("No test or type-check script detected; checks.default requires review.");
  }

  const lint = scriptCommand(scripts, "lint", run);
  if (lint) {
    config.checks.optional.lint = lint;
  }

  const build = scriptCommand(scripts, "build", run);
  if (build) {
    config.checks.optional.build = build;
  }

  const schemaChecks = collectCommands([
    scriptCommand(scripts, "generate", run),
    scriptCommand(scripts, "db:generate", run),
    scriptCommand(scripts, "migrate:local", run),
    scriptCommand(scripts, "db:migrate:local", run)
  ]);

  if (schemaChecks.length > 0) {
    config.checks.changed.schema = schemaChecks;
    evidence.push(`Detected schema checks: ${schemaChecks.join(", ")}.`);
  }

  const devCommand = scriptCommand(scripts, "dev", run);
  if (devCommand) {
    config.dev.start.command = devCommand;
    config.dev.start.url = "http://localhost:3000";
    needsReview.push("dev.start.url");
    evidence.push("Detected dev server script; default URL requires confirmation.");
  }

  return { config, packageManager, needsReview: unique(needsReview), evidence };
}

async function readPackageJson(cwd: string): Promise<PackageJson | null> {
  const packagePath = path.join(cwd, "package.json");

  if (!(await exists(packagePath))) {
    return null;
  }

  const raw = await readFile(packagePath, "utf8");
  return JSON.parse(raw) as PackageJson;
}

async function detectPackageManager(cwd: string): Promise<DetectionResult["packageManager"]> {
  if (await exists(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (await exists(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }

  if (await exists(path.join(cwd, "package-lock.json"))) {
    return "npm";
  }

  return null;
}

function getProjectName(cwd: string, packageJson: PackageJson | null): string {
  if (typeof packageJson?.name === "string" && packageJson.name.trim().length > 0) {
    return packageJson.name;
  }

  return path.basename(cwd);
}

function getScripts(packageJson: PackageJson): ScriptMap {
  if (!packageJson.scripts || typeof packageJson.scripts !== "object" || Array.isArray(packageJson.scripts)) {
    return {};
  }

  const scripts: ScriptMap = {};
  for (const [name, command] of Object.entries(packageJson.scripts)) {
    if (typeof command === "string" && command.trim().length > 0) {
      scripts[name] = command;
    }
  }

  return scripts;
}

function getDependencyNames(packageJson: PackageJson): Set<string> {
  const names = new Set<string>();
  for (const field of [packageJson.dependencies, packageJson.devDependencies, packageJson.peerDependencies]) {
    if (!field || typeof field !== "object" || Array.isArray(field)) {
      continue;
    }

    for (const name of Object.keys(field)) {
      names.add(name);
    }
  }

  return names;
}

function scriptCommand(scripts: ScriptMap, scriptName: string, run: string): string | null {
  if (!scripts[scriptName]) {
    return null;
  }

  return run === "yarn" ? `yarn ${scriptName}` : `${run} ${scriptName}`;
}

function collectCommands(commands: Array<string | null>): string[] {
  return unique(commands.filter((command): command is string => command !== null));
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
