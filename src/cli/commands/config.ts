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
    key: "project.taskPrefix",
    summary: "Configured task ID prefix used in example task branch names.",
    renderedFrom: [".agent-flow/config.json -> project.taskPrefix"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "checks.defaultShellBlock",
    summary: "Default verification commands rendered into agent code blocks.",
    renderedFrom: [".agent-flow/config.json -> checks.default", "enabled packs -> contributes.checks.default"],
    usedIn: [
      "templates/canonical/agents/feature-developer.md.hbs",
      "templates/canonical/agents/delivery-agent.md.hbs",
      "templates/canonical/agents/qa-expert.md.hbs",
      "templates/canonical/guides/verification-before-completion.md.hbs"
    ]
  },
  {
    key: "checks.changedSchemaInline",
    summary: "Schema-change verification commands rendered inline in agent guidance.",
    renderedFrom: [".agent-flow/config.json -> checks.changed.schema", "enabled packs -> contributes.checks.changed.schema"],
    usedIn: [
      "templates/canonical/agents/feature-developer.md.hbs",
      "templates/canonical/guides/verification-before-completion.md.hbs"
    ]
  },
  {
    key: "checks.focusedTestCommand",
    summary: "Focused single-test command rendered into TDD guidance.",
    renderedFrom: [".agent-flow/config.json -> checks.focusedTestCommand", "init detection may derive this from package scripts"],
    usedIn: ["templates/canonical/guides/test-driven-development.md.hbs"]
  },
  {
    key: "dev.startCommand",
    summary: "Command an agent should use to start the local runtime when needed.",
    renderedFrom: [".agent-flow/config.json -> dev.start.command"],
    usedIn: ["templates/canonical/agents/qa-expert.md.hbs"]
  },
  {
    key: "dev.startUrl",
    summary: "Configured local runtime URL agents should use for QA smoke checks when applicable.",
    renderedFrom: [".agent-flow/config.json -> dev.start.url"],
    usedIn: ["templates/canonical/agents/qa-expert.md.hbs"]
  },
  {
    key: "runtime.appRoot",
    summary: "Project-relative root for the active application/runtime surface.",
    renderedFrom: [".agent-flow/config.json -> runtime.appRoot"],
    usedIn: ["templates/canonical/agents/feature-developer.md.hbs"]
  },
  {
    key: "artifacts.architectureFile",
    summary: "Primary project architecture reference used by architecture agents.",
    renderedFrom: [".agent-flow/config.json -> artifacts.architectureFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/architect.md.hbs"
    ]
  },
  {
    key: "artifacts.userIsolationArchitectureFile",
    summary: "Project architecture reference for user/data isolation work.",
    renderedFrom: [".agent-flow/config.json -> artifacts.userIsolationArchitectureFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/architect.md.hbs"
    ]
  },
  {
    key: "artifacts.schedulingArchitectureFile",
    summary: "Project architecture reference for scheduling and asynchronous flow work.",
    renderedFrom: [".agent-flow/config.json -> artifacts.schedulingArchitectureFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/architect.md.hbs"
    ]
  },
  {
    key: "artifacts.backlogFile",
    summary: "Project backlog file used for cross-phase follow-ups and deferred work.",
    renderedFrom: [".agent-flow/config.json -> artifacts.backlogFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/product-manager.md.hbs"
    ]
  },
  {
    key: "artifacts.uiUxSpecificationFile",
    summary: "Project UI/UX specification used by UX quality review.",
    renderedFrom: [".agent-flow/config.json -> artifacts.uiUxSpecificationFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/feature-developer.md.hbs",
      "templates/canonical/agents/qa-expert.md.hbs",
      "templates/canonical/agents/ux-expert.md.hbs"
    ]
  },
  {
    key: "artifacts.designSystemFile",
    summary: "Project design system reference used by UX quality review.",
    renderedFrom: [".agent-flow/config.json -> artifacts.designSystemFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/feature-developer.md.hbs",
      "templates/canonical/agents/qa-expert.md.hbs",
      "templates/canonical/agents/ux-expert.md.hbs"
    ]
  },
  {
    key: "artifacts.uxWritingGuideFile",
    summary: "Project UX writing guide used by UX-copy review.",
    renderedFrom: [".agent-flow/config.json -> artifacts.uxWritingGuideFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/ux-expert.md.hbs"
    ]
  },
  {
    key: "artifacts.qaSharedAccountFile",
    summary: "Project QA shared-account or test-identity reference used by QA agents.",
    renderedFrom: [".agent-flow/config.json -> artifacts.qaSharedAccountFile"],
    usedIn: [
      "templates/canonical/artifact-contracts.md.hbs",
      "templates/canonical/agents/qa-expert.md.hbs"
    ]
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
      "templates/canonical/agents/delivery-agent.md.hbs",
      "templates/canonical/guides/verification-before-completion.md.hbs"
    ]
  },
  {
    key: "runtime.routeEntrypoint",
    summary: "Runtime route entrypoint derived from the configured runtime app root.",
    renderedFrom: [".agent-flow/config.json -> runtime.appRoot"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "discovery.codeGraphProvider",
    summary: "Planning-time code discovery provider used for codebase maps, impact analysis, and affected-flow discovery.",
    renderedFrom: [".agent-flow/config.json -> discovery.codeGraphProvider", "enabled packs may provide the concrete guide/tooling"],
    usedIn: [
      "templates/canonical/index.md.hbs",
      "templates/canonical/agents/architect.md.hbs",
      "templates/canonical/agents/code-simplifier.md.hbs",
      "templates/canonical/agents/deep-reviewer.md.hbs",
      "templates/canonical/agents/performance-expert.md.hbs",
      "templates/canonical/agents/paranoid-architect.md.hbs",
      "templates/canonical/guides/code-review-graph-usage.md.hbs"
    ]
  },
  {
    key: "discovery.planningProviderSummary",
    summary: "Human-readable planning discovery provider summary shown during onboarding and troubleshooting.",
    renderedFrom: [
      ".agent-flow/config.json -> discovery.codeGraphProvider",
      ".agent-flow/config.json -> discovery.customProvider",
      ".agent-flow/config.json -> discovery.fallback"
    ],
    usedIn: [
      "templates/canonical/index.md.hbs",
      "templates/canonical/agents/architect.md.hbs",
      "templates/canonical/agents/code-simplifier.md.hbs",
      "templates/canonical/agents/deep-reviewer.md.hbs",
      "templates/canonical/agents/performance-expert.md.hbs",
      "templates/canonical/agents/paranoid-architect.md.hbs"
    ]
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
    usedIn: [
      "templates/canonical/agents/delivery-agent.md.hbs",
      "templates/canonical/guides/worktree-workflow.md.hbs"
    ]
  },
  {
    key: "git.remoteBranchDeleteCommand",
    summary: "Remote branch deletion command or generic branch-cleanup instruction.",
    renderedFrom: [".agent-flow/config.json -> git.repository"],
    usedIn: [
      "templates/canonical/agents/delivery-agent.md.hbs",
      "templates/canonical/guides/worktree-workflow.md.hbs"
    ]
  },
  {
    key: "git.releaseFlow",
    summary: "Human-readable integration-to-release branch flow.",
    renderedFrom: [".agent-flow/config.json -> git.integrationBranch", ".agent-flow/config.json -> git.releaseBranch"],
    usedIn: ["templates/canonical/agents/delivery-agent.md.hbs"]
  },
  {
    key: "git.remoteName",
    summary: "Git remote name used in worktree and delivery commands.",
    renderedFrom: [".agent-flow/config.json -> git.remoteName"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "git.integrationBranch",
    summary: "Integration branch used for feature PRs and task delivery.",
    renderedFrom: [".agent-flow/config.json -> git.integrationBranch"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "git.releaseBranch",
    summary: "Release branch used for explicit release-sync flow when configured.",
    renderedFrom: [".agent-flow/config.json -> git.releaseBranch"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "git.integrationRef",
    summary: "Remote integration branch ref used for rebase, parking, and delivery-state checks.",
    renderedFrom: [".agent-flow/config.json -> git.remoteName", ".agent-flow/config.json -> git.integrationBranch"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "git.releaseRef",
    summary: "Remote release branch ref used for release-sync checks when a release branch is configured.",
    renderedFrom: [".agent-flow/config.json -> git.remoteName", ".agent-flow/config.json -> git.releaseBranch"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "git.worktreeParkCommand",
    summary: "Installed helper command for parking/syncing local worktrees after delivery.",
    renderedFrom: ["Agent Flow installed scripts"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "git.deliveryStateCommand",
    summary: "Installed helper command for printing canonical post-delivery state.",
    renderedFrom: ["Agent Flow installed scripts"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
  },
  {
    key: "git.deliveryStateRef",
    summary: "Default post-delivery state ref derived from the configured integration branch.",
    renderedFrom: [".agent-flow/config.json -> git.remoteName", ".agent-flow/config.json -> git.integrationBranch"],
    usedIn: ["templates/canonical/guides/worktree-workflow.md.hbs"]
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
