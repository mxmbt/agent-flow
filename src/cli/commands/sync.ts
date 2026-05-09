import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import { planManagedFiles, writeManagedFiles, type PlannedFileChange, type RenderedFile } from "../../renderer/conflict-policy.js";
import { renderTargetFiles } from "../../renderer/target-renderer.js";
import { commonOptions } from "./skeleton.js";
import type { CommandContext, CommandModule } from "./types.js";

export const syncCommand: CommandModule = {
  definition: {
    name: "sync",
    summary: "Regenerate target mirrors from canonical templates",
    usage: ["agent-flow sync [--dry-run] [--diff]"],
    options: commonOptions([
      { flag: "--dry-run", description: "Show generated target changes without writing" },
      { flag: "--diff", description: "Show a compact diff preview for generated target changes" }
    ])
  },
  async run(context: CommandContext): Promise<string> {
    const dryRun = context.args.includes("--dry-run") || context.args.includes("--diff");
    const showDiff = context.args.includes("--diff");
    const root = process.cwd();
    const templateRoot = await findTemplateRoot(root);
    const packs = composePacks(builtinPacks, context.config.config.packs);
    const rendered = await renderTargetFiles(context.config.config, packs, { templateRoot });
    const plan = await planManagedFiles(root, rendered);

    if (!dryRun) {
      const written = await writeManagedFiles(root, rendered);
      return renderSyncPlan("Synced Agent Flow managed files.", written, rendered, root, false);
    }

    return renderSyncPlan("Agent Flow sync preview. No files were written.", plan, rendered, root, showDiff);
  }
};

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

function renderSyncPlan(
  title: string,
  plan: PlannedFileChange[],
  rendered: RenderedFile[],
  root: string,
  showDiff: boolean
): Promise<string> {
  const renderedByPath = new Map(rendered.map((file) => [file.path, file]));
  const lines = [
    title,
    "",
    "Plan:",
    ...plan.map((change) => `- ${change.action.padEnd(8)} ${change.path} (${change.reason})`)
  ];

  if (!showDiff) {
    return Promise.resolve([...lines, ""].join("\n"));
  }

  return renderDiffSections(plan, renderedByPath, root).then((sections) => [
    ...lines,
    "",
    "Diff preview:",
    ...sections,
    ""
  ].join("\n"));
}

async function renderDiffSections(
  plan: PlannedFileChange[],
  renderedByPath: Map<string, RenderedFile>,
  root: string
): Promise<string[]> {
  const sections: string[] = [];

  for (const change of plan) {
    if (change.action === "noop") {
      continue;
    }

    const rendered = renderedByPath.get(change.path);
    if (!rendered) {
      continue;
    }

    const existingPath = path.join(root, change.path);
    const existing = await readOptional(existingPath);
    sections.push(`--- ${change.path}`);
    sections.push(...renderCompactDiff(existing, rendered.content));
  }

  if (sections.length === 0) {
    return ["- no content changes"];
  }

  return sections;
}

function renderCompactDiff(before: string | null, after: string, maxLines = 24): string[] {
  if (before === null) {
    return after
      .split("\n")
      .slice(0, maxLines)
      .map((line) => `+ ${line}`);
  }

  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  const lines: string[] = [];
  const max = Math.max(beforeLines.length, afterLines.length);

  for (let index = 0; index < max && lines.length < maxLines; index += 1) {
    const left = beforeLines[index];
    const right = afterLines[index];

    if (left === right) {
      continue;
    }

    if (left !== undefined) {
      lines.push(`- ${left}`);
    }
    if (right !== undefined && lines.length < maxLines) {
      lines.push(`+ ${right}`);
    }
  }

  if (lines.length === maxLines) {
    lines.push("... diff truncated ...");
  }

  return lines.length > 0 ? lines : ["  no line-level changes"];
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
