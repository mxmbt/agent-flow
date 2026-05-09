import { builtinPacks } from "../../packs/builtin.js";
import { composePacks } from "../../packs/manifest.js";
import { buildCanonicalContext } from "../../renderer/canonical-context.js";
import type { RenderValue } from "../../renderer/render-template.js";
import { commonOptions } from "./skeleton.js";
import type { CommandContext, CommandModule } from "./types.js";

interface ExplainEntry {
  key: string;
  summary: string;
  renderedFrom: string[];
  usedIn: string[];
}

const EXPLAIN_ENTRIES: ExplainEntry[] = [
  {
    key: "checks.defaultShellBlock",
    summary: "Default verification commands rendered into agent code blocks.",
    renderedFrom: [".agent-flow/config.json -> checks.default", "enabled packs -> contributes.checks.default"],
    usedIn: [
      "templates/canonical/agents/feature-developer.md.hbs",
      "templates/canonical/agents/delivery-agent.md.hbs",
      "templates/canonical/agents/qa-expert.md.hbs"
    ]
  },
  {
    key: "checks.changedSchemaInline",
    summary: "Schema-change verification commands rendered inline in agent guidance.",
    renderedFrom: [".agent-flow/config.json -> checks.changed.schema", "enabled packs -> contributes.checks.changed.schema"],
    usedIn: ["templates/canonical/agents/feature-developer.md.hbs"]
  },
  {
    key: "dev.startCommand",
    summary: "Command an agent should use to start the local runtime when needed.",
    renderedFrom: [".agent-flow/config.json -> dev.start.command"],
    usedIn: ["templates/canonical/agents/qa-expert.md.hbs"]
  },
  {
    key: "runtime.appRoot",
    summary: "Project-relative root for the active application/runtime surface.",
    renderedFrom: [".agent-flow/config.json -> runtime.appRoot"],
    usedIn: ["templates/canonical/agents/feature-developer.md.hbs"]
  },
  {
    key: "runtime.migrationsGlob",
    summary: "Migration-file glob derived from the configured runtime app root.",
    renderedFrom: [".agent-flow/config.json -> runtime.appRoot"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "runtime.bindingConfigFile",
    summary: "Runtime/deployment config file agents should inspect for binding changes.",
    renderedFrom: [".agent-flow/config.json -> runtime.appRoot", "enabled runtime packs may refine this later"],
    usedIn: [
      "templates/canonical/agents/feature-developer.md.hbs",
      "templates/canonical/agents/delivery-agent.md.hbs"
    ]
  },
  {
    key: "runtime.routeEntrypoint",
    summary: "Runtime route entrypoint derived from the configured runtime app root.",
    renderedFrom: [".agent-flow/config.json -> runtime.appRoot"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "quality.invariantSummary",
    summary: "Compact correctness-invariant summary rendered into implementation guidance.",
    renderedFrom: [".agent-flow/config.json -> quality.invariants", "enabled packs -> contributes.quality.invariants"],
    usedIn: ["templates/canonical/agents/feature-developer.md.hbs"]
  },
  {
    key: "git.defaultDeliveryDiffCommand",
    summary: "Diff command for normal task delivery.",
    renderedFrom: [".agent-flow/config.json -> git.remoteName", ".agent-flow/config.json -> git.integrationBranch"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "git.releaseSyncDiffCommand",
    summary: "Diff command for release-sync delivery.",
    renderedFrom: [
      ".agent-flow/config.json -> git.remoteName",
      ".agent-flow/config.json -> git.integrationBranch",
      ".agent-flow/config.json -> git.releaseBranch"
    ],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "git.prBaseFlag",
    summary: "Pull request base-branch flag for delivery.",
    renderedFrom: [".agent-flow/config.json -> git.integrationBranch"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "git.remoteBranchDeleteCommand",
    summary: "Remote branch deletion command or generic branch-cleanup instruction.",
    renderedFrom: [".agent-flow/config.json -> git.repository"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "git.releaseFlow",
    summary: "Human-readable integration-to-release branch flow.",
    renderedFrom: [".agent-flow/config.json -> git.integrationBranch", ".agent-flow/config.json -> git.releaseBranch"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  }
];

export const configCommand: CommandModule = {
  definition: {
    name: "config",
    summary: "Inspect Agent Flow project config and rendered placeholders",
    usage: [
      "agent-flow config list",
      "agent-flow config explain <key>"
    ],
    options: commonOptions([])
  },
  async run(context: CommandContext): Promise<string> {
    const [subcommand, key] = context.args;

    if (!subcommand || subcommand === "list") {
      return renderConfigList();
    }

    if (subcommand !== "explain") {
      return [
        `Unknown config subcommand: ${subcommand}`,
        "",
        renderConfigList()
      ].join("\n");
    }

    if (!key) {
      return [
        "Missing config key.",
        "",
        renderConfigList()
      ].join("\n");
    }

    return renderConfigExplanation(context, key);
  }
};

function renderConfigList(): string {
  return [
    "agent-flow config",
    "",
    "Available explanations:",
    ...EXPLAIN_ENTRIES.map((entry) => `  ${entry.key.padEnd(32)} ${entry.summary}`),
    "",
    "Usage:",
    "  agent-flow config explain <key>",
    ""
  ].join("\n");
}

function renderConfigExplanation(context: CommandContext, key: string): string {
  const entry = EXPLAIN_ENTRIES.find((candidate) => candidate.key === key);
  if (!entry) {
    return [
      `Unknown config explanation key: ${key}`,
      "",
      renderConfigList()
    ].join("\n");
  }

  const packs = composePacks(builtinPacks, context.config.config.packs);
  const renderContext = buildCanonicalContext(context.config.config, packs);
  const value = resolvePath(renderContext, key);

  return [
    key,
    "",
    entry.summary,
    "",
    `Config source: ${context.config.source}`,
    "",
    "Current value:",
    "```text",
    stringifyRenderValue(value),
    "```",
    "",
    "Rendered from:",
    ...entry.renderedFrom.map((source) => `- ${source}`),
    "",
    "Used in:",
    ...entry.usedIn.map((usage) => `- ${usage}`),
    ""
  ].join("\n");
}

function resolvePath(context: Record<string, RenderValue>, key: string): RenderValue {
  const segments = key.split(".");
  let current: RenderValue | undefined = context;

  for (const segment of segments) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return "not configured";
    }

    current = current[segment];
  }

  return current ?? "not configured";
}

function stringifyRenderValue(value: RenderValue): string {
  if (Array.isArray(value)) {
    return value.map(stringifyRenderValue).join("\n");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  if (value === null || value === "") {
    return "not configured";
  }

  return String(value);
}
