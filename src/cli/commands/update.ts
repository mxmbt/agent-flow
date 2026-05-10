import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import { planManagedFiles, writeManagedFiles, type ConflictMode, type PlannedFileChange } from "../../renderer/conflict-policy.js";
import { renderTargetFiles } from "../../renderer/target-renderer.js";
import { commonOptions } from "./skeleton.js";
import type { CommandModule } from "./types.js";

export const updateCommand: CommandModule = {
  definition: {
    name: "update",
    summary: "Update managed Agent Flow files in an installed project",
    usage: ["agent-flow update [--dry-run] [--force]"],
    options: commonOptions([
      { flag: "--dry-run", description: "Show planned changes without writing" },
      { flag: "--force", description: "Allow managed-file replacement when safe" }
    ])
  },
  async run(context): Promise<string> {
    const root = process.cwd();
    const dryRun = context.args.includes("--dry-run");
    const conflictMode: ConflictMode = context.args.includes("--force") ? "force" : "error";
    const templateRoot = await findTemplateRoot(root);
    const packs = composePacks(builtinPacks, context.config.config.packs);
    const rendered = await renderTargetFiles(context.config.config, packs, { templateRoot });
    const plan = await planManagedFiles(root, rendered, { conflictMode });

    if (dryRun) {
      return renderPlan("Agent Flow update preview. No files were written.", plan);
    }

    const conflicts = plan.filter((change) => change.action === "conflict");
    if (conflicts.length > 0) {
      return renderPlan("Agent Flow update found unmanaged conflicts. No files were written.", plan);
    }

    const written = await writeManagedFiles(root, rendered, { conflictMode });
    return renderPlan("Updated Agent Flow managed files.", written);
  }
};

export async function findTemplateRoot(cwd: string): Promise<string> {
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

export function renderPlan(title: string, plan: PlannedFileChange[]): string {
  return [
    title,
    "",
    "Plan:",
    ...plan.map((change) => `- ${change.action.padEnd(8)} ${change.path} (${change.reason})`),
    ""
  ].join("\n");
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
