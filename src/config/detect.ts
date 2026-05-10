import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { createDefaultConfig, type AgentFlowConfig } from "./defaults.js";

export interface DetectionResult {
  config: AgentFlowConfig;
  packageManager: "npm" | "pnpm" | "yarn" | "python" | null;
  hasPackageJson: boolean;
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
  config.project.taskPrefix = deriveTaskPrefix(projectName);
  config.project.taskIdPattern = `${config.project.taskPrefix}-[A-Z0-9]+-T[0-9]+`;
  const needsReview: string[] = [];
  const evidence: string[] = [];
  enableDefaultCodeGraph(config, evidence);

  if (!packageJson) {
    if (await hasPythonProject(cwd)) {
      config.checks.default = ["python -m pytest"];
      config.checks.focusedTestCommand = "python -m pytest <test-file>";
      evidence.push("Detected Python project files; defaulted checks to python -m pytest.");
      evidence.push(`Defaulted task prefix to ${config.project.taskPrefix} and integration branch to ${config.git.integrationBranch}.`);
      return finalizeDetection(config, "python", false, needsReview, evidence);
    }

    config.checks.default = ["npm run test"];
    config.checks.focusedTestCommand = "npm run test -- <test-file>";
    evidence.push("No package.json detected; init will create a starter package.json with a passing test script.");
    evidence.push(`Defaulted task prefix to ${config.project.taskPrefix} and integration branch to ${config.git.integrationBranch}.`);
    return finalizeDetection(config, packageManager, false, needsReview, evidence);
  }

  evidence.push("Detected package.json.");
  evidence.push(`Defaulted task prefix to ${config.project.taskPrefix} and integration branch to ${config.git.integrationBranch}.`);
  if (!config.packs.includes("code-review-toolkit")) {
    config.packs.push("code-review-toolkit");
  }
  evidence.push("Enabled the code-review-toolkit pack as recommended manual review tooling for code projects.");

  const scripts = getScripts(packageJson);
  const dependencies = getDependencyNames(packageJson);
  const run = packageManager === "yarn" ? "yarn" : `${packageManager ?? "npm"} run`;

  if (dependencies.has("next")) {
    config.packs.push("nextjs");
    evidence.push("Detected Next.js dependency; enabled the nextjs pack for App Router best-practice guidance.");
  }

  const defaultChecks = collectCommands([
    starterSafeTestCommand(scripts, run),
    scriptCommand(scripts, "type-check", run),
    scriptCommand(scripts, "check-types", run)
  ]);

  if (defaultChecks.length > 0) {
    config.checks.default = defaultChecks;
    if (scripts.test && !isNpmInitPlaceholderTest(scripts.test)) {
      config.checks.focusedTestCommand = packageManager === "yarn"
        ? "yarn test <test-file>"
        : `${run} test -- <test-file>`;
      evidence.push(`Detected focused test command: ${config.checks.focusedTestCommand}.`);
    } else if (isNpmInitPlaceholderTest(scripts.test)) {
      evidence.push("Detected npm init placeholder test script; using a passing starter validation command until real tests are added.");
    }
    evidence.push(`Detected default checks: ${defaultChecks.join(", ")}.`);
  } else {
    config.checks.default = [starterValidationCommand()];
    evidence.push("No test or type-check script detected; using a passing starter validation command until real checks are added.");
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
    config.dev.start.url = inferDevServerUrl(scripts.dev ?? "", dependencies);
    evidence.push(`Detected dev server script; defaulted local URL to ${config.dev.start.url}.`);
  }

  return finalizeDetection(config, packageManager, true, needsReview, evidence);
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

async function hasPythonProject(cwd: string): Promise<boolean> {
  return (await exists(path.join(cwd, "pyproject.toml")))
    || (await exists(path.join(cwd, "requirements.txt")))
    || (await exists(path.join(cwd, "pytest.ini")));
}

function getProjectName(cwd: string, packageJson: PackageJson | null): string {
  if (typeof packageJson?.name === "string" && packageJson.name.trim().length > 0) {
    return packageJson.name;
  }

  return path.basename(cwd);
}

function deriveTaskPrefix(projectName: string): string {
  const words = projectName
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((word) => word.length > 0);

  const raw = words.length > 1
    ? words.map((word) => word[0]).join("")
    : words[0] ?? "APP";

  const prefix = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  return prefix.length > 0 ? prefix : "APP";
}

function enableDefaultCodeGraph(config: AgentFlowConfig, evidence: string[]): void {
  config.discovery.codeGraphProvider = "code-review-graph";
  if (!config.packs.includes("code-review-graph")) {
    config.packs.push("code-review-graph");
  }
  evidence.push("Enabled the code-review-graph pack as the default planning discovery provider. To use another code graph provider later, set discovery.codeGraphProvider to custom and remove or replace the pack.");
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

function starterSafeTestCommand(scripts: ScriptMap, run: string): string | null {
  if (!scripts.test) {
    return null;
  }

  return isNpmInitPlaceholderTest(scripts.test) ? starterValidationCommand() : scriptCommand(scripts, "test", run);
}

function isNpmInitPlaceholderTest(command: string | undefined): boolean {
  return typeof command === "string" && /Error: no test specified/.test(command);
}

function starterValidationCommand(): string {
  return "node -e \"console.log('No project tests configured yet')\"";
}

function collectCommands(commands: Array<string | null>): string[] {
  return unique(commands.filter((command): command is string => command !== null));
}

function inferDevServerUrl(devScript: string, dependencies: Set<string>): string {
  if (dependencies.has("vite") || /\bvite\b/.test(devScript)) {
    return "http://localhost:5173";
  }

  if (dependencies.has("next") || /\bnext\s+dev\b/.test(devScript)) {
    return "http://localhost:3000";
  }

  return "http://localhost:3000";
}

function finalizeDetection(
  config: AgentFlowConfig,
  packageManager: DetectionResult["packageManager"],
  hasPackageJson: boolean,
  needsReview: string[],
  evidence: string[]
): DetectionResult {
  const uniqueNeedsReview = unique(needsReview);
  config.needsReview = uniqueNeedsReview;
  return { config, packageManager, hasPackageJson, needsReview: uniqueNeedsReview, evidence };
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
