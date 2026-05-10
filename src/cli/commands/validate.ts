import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CliCommandError } from "../errors.js";
import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import { renderTargetFiles } from "../../renderer/target-renderer.js";
import { formatMirrorParityReport, validateInstalledMirrorParity } from "../../validation/mirror-parity.js";
import { commonOptions } from "./skeleton.js";
import type { CommandModule } from "./types.js";

export const validateCommand: CommandModule = {
  definition: {
    name: "validate",
    summary: "Run core validation checks for generated output",
    usage: ["agent-flow validate [--strict]"],
    options: commonOptions([
      { flag: "--strict", description: "Exit non-zero when installed files are missing, stale, or drifted" }
    ])
  },
  async run(context): Promise<string> {
    const root = process.cwd();
    const templateRoot = await findTemplateRoot(root);
    const packs = composePacks(builtinPacks, context.config.config.packs);
    const rendered = await renderTargetFiles(context.config.config, packs, { templateRoot });
    const result = await validateInstalledMirrorParity(root, rendered);
    const report = formatMirrorParityReport(result);

    if (!result.passed && context.args.includes("--strict")) {
      throw new CliCommandError("Agent Flow validation failed.", {
        exitCode: 1,
        stdout: report,
        stderr: ""
      });
    }

    return report;
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

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
