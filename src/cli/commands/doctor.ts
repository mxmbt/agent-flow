import { builtinPacks } from "../../packs/builtin.js";
import { composePacks, PackCompositionError } from "../../packs/manifest.js";
import { CliCommandError } from "../errors.js";
import { checkMcpHealth } from "../../mcp/catalog.js";
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
    const warnings: string[] = [];
    const errors: string[] = [];
    let packs = composePacks(builtinPacks, []);

    try {
      packs = composePacks(builtinPacks, config.packs);
    } catch (error) {
      if (!(error instanceof PackCompositionError)) {
        throw error;
      }

      for (const issue of error.issues) {
        errors.push(`Pack config issue at ${issue.path}: ${issue.pack} ${issue.message}.`);
      }

      const knownPacks = config.packs.filter((packName) => builtinPacks.some((pack) => pack.name === packName));
      packs = composePacks(builtinPacks, knownPacks);
    }

    if (config.discovery.codeGraphProvider === "code-review-graph" && !packs.guides.includes("code-review-graph-usage")) {
      warnings.push("discovery.codeGraphProvider is code-review-graph, but the code-review-graph pack is not enabled.");
    }

    if (config.discovery.codeGraphProvider === "none") {
      warnings.push("No code graph provider configured; planning will use filesystem/search fallback. For coding projects, enable code-review-graph or configure a custom provider.");
    }

    if (config.discovery.codeGraphProvider === "custom" && !config.discovery.customProvider) {
      warnings.push("Custom code graph provider selected, but discovery.customProvider is empty.");
    }

    for (const item of config.needsReview ?? []) {
      warnings.push(`Config needs review: ${item}.`);
    }

    const mcp = await checkMcpHealth(process.cwd(), config, packs);
    warnings.push(...mcp.warnings);
    errors.push(...mcp.errors);

    const report = [
      "agent-flow doctor",
      "",
      `Config source: ${context.config.source}`,
      `Planning discovery provider: ${renderDiscoveryProvider(config)}`,
      `Enabled packs: ${config.packs.length === 0 ? "none" : config.packs.join(", ")}`,
      `MCP mode: ${config.mcp.mode}`,
      `Needs review: ${(config.needsReview ?? []).length === 0 ? "none" : (config.needsReview ?? []).join(", ")}`,
      "",
      errors.length === 0 ? "No doctor errors." : "Errors:",
      ...errors.map((error) => `- ${error}`),
      "",
      warnings.length === 0 ? "No doctor warnings." : "Warnings:",
      ...warnings.map((warning) => `- ${warning}`),
      "",
      strict && (errors.length > 0 || warnings.length > 0) ? "Strict mode: doctor issues are treated as failures." : ""
    ].filter((line, index, lines) => line.length > 0 || lines[index - 1]?.length !== 0).join("\n");

    if (strict && (errors.length > 0 || warnings.length > 0)) {
      throw new CliCommandError("Agent Flow doctor failed.", {
        exitCode: 1,
        stdout: report,
        stderr: ""
      });
    }

    return report;
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
