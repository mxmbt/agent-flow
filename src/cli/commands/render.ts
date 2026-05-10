import { applyProfile, isProfileName, profileNames } from "../../config/profiles.js";
import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import { renderTargetFiles } from "../../renderer/target-renderer.js";
import { commonOptions } from "./skeleton.js";
import type { CommandModule } from "./types.js";
import { findTemplateRoot } from "./update.js";

export const renderCommand: CommandModule = {
  definition: {
    name: "render",
    summary: "Render Agent Flow files without applying them",
    usage: ["agent-flow render [--profile <name>] [--json]"],
    options: commonOptions([
      { flag: "--profile <name>", description: "Render using a starter profile" },
      { flag: "--json", description: "Print machine-readable render output" }
    ])
  },
  async run(context): Promise<string> {
    const profile = readFlagValue(context.args, "--profile") ?? "generic";
    if (!isProfileName(profile)) {
      return `Unknown starter profile: ${profile}\nAvailable profiles: ${profileNames.join(", ")}\n`;
    }

    const root = process.cwd();
    const templateRoot = await findTemplateRoot(root);
    const config = applyProfile(context.config.config, profile).config;
    const packs = composePacks(builtinPacks, config.packs);
    const rendered = await renderTargetFiles(config, packs, { templateRoot });

    if (context.args.includes("--json")) {
      return JSON.stringify({ files: rendered }, null, 2);
    }

    return [
      "Rendered Agent Flow files. No files were written.",
      "",
      ...rendered.flatMap((file) => [`--- ${file.path}`, file.content.trimEnd(), ""])
    ].join("\n");
  }
};

function readFlagValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }

  return args[index + 1] ?? null;
}
