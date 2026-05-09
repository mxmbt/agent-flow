import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentFlowConfig } from "../../config/defaults.js";
import { detectProjectConfig } from "../../config/detect.js";
import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import {
  planManagedFiles,
  writeManagedFiles,
  type PlannedFileChange,
  type RenderedFile
} from "../../renderer/conflict-policy.js";
import { renderTargetFiles } from "../../renderer/target-renderer.js";
import { commonOptions } from "./skeleton.js";
import type { CommandContext, CommandModule } from "./types.js";

export const initCommand: CommandModule = {
  definition: {
    name: "init",
    summary: "Create a new Agent Flow install in the current project",
    usage: ["agent-flow init [--dry-run] [--profile <name>]"],
    options: commonOptions([
      { flag: "--dry-run", description: "Show planned files without writing" },
      { flag: "--profile <name>", description: "Use a starter profile" }
    ])
  },
  async run(context: CommandContext): Promise<string> {
    const dryRun = context.args.includes("--dry-run");
    const profile = readFlagValue(context.args, "--profile") ?? "generic";
    const root = process.cwd();

    if (profile !== "generic") {
      return `Unknown starter profile: ${profile}\nAvailable profiles: generic\n`;
    }

    const detected = await detectProjectConfig(root);
    const detectedConfig = context.config.source === "defaults"
      ? await reuseExistingArtifactPaths(root, detected.config, detected.needsReview, detected.evidence)
      : context.config.config;
    const config = detectedConfig;
    const templateRoot = await findTemplateRoot(root);
    const packs = composePacks(builtinPacks, config.packs);
    const files = [
      configFile(config),
      ...await starterArtifactFiles(root, config),
      ...await renderTargetFiles(config, packs, { templateRoot })
    ];
    const plan = await planManagedFiles(root, files);

    if (!dryRun) {
      const conflicts = plan.filter((change) => change.action === "conflict");
      if (conflicts.length > 0) {
        return renderInitPlan(
          "Agent Flow init found existing unmanaged files. No files were written.",
          plan,
          detected.needsReview,
          detected.evidence
        );
      }

      const written = await writeManagedFiles(root, files);
      return renderInitPlan("Initialized Agent Flow.", written, detected.needsReview, detected.evidence);
    }

    return renderInitPlan("Agent Flow init preview. No files were written.", plan, detected.needsReview, detected.evidence);
  }
};

function configFile(config: unknown): RenderedFile {
  return {
    path: path.join(".agent-flow", "config.json"),
    content: `${JSON.stringify(config, null, 2)}\n`
  };
}

async function reuseExistingArtifactPaths(
  root: string,
  config: AgentFlowConfig,
  needsReview: string[],
  evidence: string[]
): Promise<AgentFlowConfig> {
  const next: AgentFlowConfig = {
    ...config,
    artifacts: { ...config.artifacts }
  };

  await reuseExistingPath(root, next, "statusFile", [
    "PROJECT_STATUS.md",
    "STATUS.md",
    "docs/STATUS.md",
    "docs/PROJECT_STATUS.md"
  ], needsReview, evidence);
  await reuseExistingPath(root, next, "roadmapFile", [
    "docs/ROADMAP.md",
    "ROADMAP.md",
    "docs/roadmap.md",
    "docs/roadmap/index.md"
  ], needsReview, evidence);
  await reuseExistingPath(root, next, "productFile", [
    "docs/PRODUCT.md",
    "PRODUCT.md",
    "docs/PRD.md",
    "docs/product.md",
    "docs/product/README.md"
  ], needsReview, evidence);
  await reuseExistingPath(root, next, "architectureFile", [
    "docs/ARCHITECTURE.md",
    "ARCHITECTURE.md",
    "docs/architecture.md",
    "docs/architecture/README.md"
  ], needsReview, evidence);
  await reuseExistingPath(root, next, "userIsolationArchitectureFile", [
    "docs/ARCHITECTURE_MULTI_USER.md",
    "docs/USER_ISOLATION.md",
    "docs/DATA_ISOLATION.md",
    "docs/SECURITY.md",
    "docs/security.md"
  ], needsReview, evidence);
  await reuseExistingPath(root, next, "schedulingArchitectureFile", [
    "docs/ARCHITECTURE_SCHEDULING.md",
    "docs/SCHEDULING.md",
    "docs/JOBS.md",
    "docs/QUEUES.md",
    "docs/WORKERS.md"
  ], needsReview, evidence);

  return next;
}

async function reuseExistingPath(
  root: string,
  config: AgentFlowConfig,
  key: keyof AgentFlowConfig["artifacts"],
  candidates: string[],
  needsReview: string[],
  evidence: string[]
): Promise<void> {
  for (const candidate of candidates) {
    if (await exists(path.join(root, candidate))) {
      config.artifacts[key] = candidate;
      needsReview.push(`artifacts.${key}`);
      evidence.push(`Detected existing artifact for artifacts.${key}: ${candidate}.`);
      return;
    }
  }
}

async function starterArtifactFiles(root: string, config: CommandContext["config"]["config"]): Promise<RenderedFile[]> {
  return withoutExistingFiles(root, uniqueFiles([
    {
      path: config.artifacts.statusFile,
      content: markdownStarter("Project Status", [
        "Agent Flow installed this starter status file.",
        "",
        "Keep the current project state, active phase, blockers, and delivery status here."
      ])
    },
    {
      path: config.artifacts.roadmapFile,
      content: markdownStarter("Roadmap", [
        "Agent Flow installed this starter roadmap file.",
        "",
        "Use this file for milestones, task IDs, sequencing, and accepted scope."
      ])
    },
    {
      path: config.artifacts.productFile,
      content: markdownStarter("Product Reference", [
        "Agent Flow installed this starter product reference.",
        "",
        "Capture product goals, user promises, terminology, and user-facing constraints here."
      ])
    },
    {
      path: config.artifacts.architectureFile,
      content: markdownStarter("Architecture", [
        "Agent Flow installed this starter architecture reference.",
        "",
        "Capture system boundaries, runtime surfaces, storage choices, contracts, and operational constraints here."
      ])
    },
    {
      path: config.artifacts.userIsolationArchitectureFile,
      content: markdownStarter("User Isolation Architecture", [
        "Agent Flow installed this starter user-isolation architecture reference.",
        "",
        "Use this file when work touches identity, authorization, tenancy, privacy, or data isolation boundaries."
      ])
    },
    {
      path: config.artifacts.schedulingArchitectureFile,
      content: markdownStarter("Scheduling Architecture", [
        "Agent Flow installed this starter scheduling architecture reference.",
        "",
        "Use this file when work touches cron, queues, background jobs, event fan-out, retries, or idempotency."
      ])
    }
  ]));
}

function markdownStarter(title: string, body: string[]): string {
  return [
    "<!-- @agent-flow managed id=starter-doc version=1 -->",
    `# ${title}`,
    "",
    ...body,
    ""
  ].join("\n");
}

function uniqueFiles(files: RenderedFile[]): RenderedFile[] {
  const byPath = new Map<string, RenderedFile>();

  for (const file of files) {
    if (!byPath.has(file.path)) {
      byPath.set(file.path, file);
    }
  }

  return [...byPath.values()];
}

async function withoutExistingFiles(root: string, files: RenderedFile[]): Promise<RenderedFile[]> {
  const missing: RenderedFile[] = [];

  for (const file of files) {
    if (!(await exists(path.join(root, file.path)))) {
      missing.push(file);
    }
  }

  return missing;
}

function renderInitPlan(
  title: string,
  plan: PlannedFileChange[],
  needsReview: string[],
  evidence: string[]
): string {
  return [
    title,
    "",
    "Plan:",
    ...plan.map((change) => `- ${change.action.padEnd(8)} ${change.path} (${change.reason})`),
    "",
    "Detected:",
    ...(evidence.length > 0 ? evidence.map((item) => `- ${item}`) : ["- no project shape detected"]),
    "",
    "Needs review:",
    ...(needsReview.length > 0 ? needsReview.map((item) => `- ${item}`) : ["- none"]),
    ""
  ].join("\n");
}

function readFlagValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}

async function findTemplateRoot(cwd: string): Promise<string> {
  const candidates = [
    path.join(cwd, "templates"),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "templates")
  ];

  for (const candidate of candidates) {
    if (await exists(path.join(candidate, "canonical"))) {
      return candidate;
    }
  }

  return candidates[0] ?? path.join(cwd, "templates");
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
