import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import { commonOptions } from "./skeleton.js";
import type { CommandContext, CommandModule } from "./types.js";

export const doctorCommand: CommandModule = {
  definition: {
    name: "doctor",
    summary: "Check Agent Flow install health and missing setup",
    usage: ["agent-flow doctor [--strict]"],
    options: commonOptions([
      { flag: "--strict", description: "Treat warnings as failures" }
    ])
  },
  async run(context: CommandContext): Promise<string> {
    const strict = context.args.includes("--strict");
    const config = context.config.config;
    const packs = composePacks(builtinPacks, config.packs);
    const warnings: string[] = [];

    if (config.discovery.codeGraphProvider === "code-review-graph" && !packs.guides.includes("code-review-graph-usage")) {
      warnings.push("discovery.codeGraphProvider is code-review-graph, but the code-review-graph pack is not enabled.");
    }

    if (config.discovery.codeGraphProvider === "none") {
      warnings.push("No code graph provider configured; planning will use filesystem/search fallback. For coding projects, enable code-review-graph or configure a custom provider.");
    }

    if (config.discovery.codeGraphProvider === "custom" && !config.discovery.customProvider) {
      warnings.push("Custom code graph provider selected, but discovery.customProvider is empty.");
    }

    return [
      "agent-flow doctor",
      "",
      `Config source: ${context.config.source}`,
      `Planning discovery provider: ${renderDiscoveryProvider(config)}`,
      `Enabled packs: ${config.packs.length === 0 ? "none" : config.packs.join(", ")}`,
      "",
      warnings.length === 0 ? "No doctor warnings." : "Warnings:",
      ...warnings.map((warning) => `- ${warning}`),
      "",
      strict && warnings.length > 0 ? "Strict mode: warnings should be treated as failures." : ""
    ].filter((line, index, lines) => line.length > 0 || lines[index - 1]?.length !== 0).join("\n");
  }
};

function renderDiscoveryProvider(config: CommandContext["config"]["config"]): string {
  if (config.discovery.codeGraphProvider === "custom") {
    return `custom (${config.discovery.customProvider ?? "not described"})`;
  }

  if (config.discovery.codeGraphProvider === "code-review-graph") {
    return "code-review-graph";
  }

  return `none; fallback=${config.discovery.fallback}`;
}
