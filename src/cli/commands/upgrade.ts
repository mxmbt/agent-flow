import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import { planManagedFiles, writeManagedFiles } from "../../renderer/conflict-policy.js";
import { renderTargetFiles } from "../../renderer/target-renderer.js";
import { commonOptions } from "./skeleton.js";
import type { CommandModule } from "./types.js";
import { findTemplateRoot, renderPlan } from "./update.js";

export const upgradeCommand: CommandModule = {
  definition: {
    name: "upgrade",
    summary: "Upgrade Agent Flow managed files across package versions",
    usage: ["agent-flow upgrade [--dry-run] [--from <version>]"],
    options: commonOptions([
      { flag: "--dry-run", description: "Show upgrade plan without writing" },
      { flag: "--from <version>", description: "Declare the installed Agent Flow version" }
    ])
  },
  async run(context): Promise<string> {
    const root = process.cwd();
    const dryRun = context.args.includes("--dry-run");
    const fromVersion = readFlagValue(context.args, "--from");
    const templateRoot = await findTemplateRoot(root);
    const packs = composePacks(builtinPacks, context.config.config.packs);
    const rendered = await renderTargetFiles(context.config.config, packs, { templateRoot });
    const plan = await planManagedFiles(root, rendered);
    const title = fromVersion
      ? `Agent Flow upgrade preview from ${fromVersion}.`
      : "Agent Flow upgrade preview.";

    if (dryRun) {
      return renderPlan(`${title} No files were written.`, plan);
    }

    const conflicts = plan.filter((change) => change.action === "conflict");
    if (conflicts.length > 0) {
      return renderPlan("Agent Flow upgrade found unmanaged conflicts. No files were written.", plan);
    }

    const written = await writeManagedFiles(root, rendered);
    return renderPlan("Upgraded Agent Flow managed files.", written);
  }
};

function readFlagValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}
