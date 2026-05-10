import type { AgentFlowConfig } from "../config/defaults.js";
import type { ComposedPacks } from "../packs/manifest.js";
import type { RenderContext } from "./render-template.js";

export function buildCanonicalContext(config: AgentFlowConfig, packs: ComposedPacks): RenderContext {
  return {
    project: {
      name: config.project.name,
      taskPrefix: config.project.taskPrefix,
      taskIdPattern: config.project.taskIdPattern
    },
    lifecycle: {
      sequence: "PLAN -> [ARCHITECTURE if RED] -> IMPLEMENTATION -> SIMPLIFY -> REVIEW <-> FIX -> QUALITY_GATE <-> FIX -> QA <-> FIX -> DELIVERY"
    },
    artifacts: {
      statusFile: config.artifacts.statusFile,
      roadmapFile: config.artifacts.roadmapFile,
      productFile: config.artifacts.productFile,
      architectureFile: config.artifacts.architectureFile,
      userIsolationArchitectureFile: config.artifacts.userIsolationArchitectureFile,
      schedulingArchitectureFile: config.artifacts.schedulingArchitectureFile,
      backlogFile: config.artifacts.backlogFile,
      uiUxSpecificationFile: config.artifacts.uiUxSpecificationFile,
      designSystemFile: config.artifacts.designSystemFile,
      uxWritingGuideFile: config.artifacts.uxWritingGuideFile,
      qaSharedAccountFile: config.artifacts.qaSharedAccountFile ?? "docs/testing/QA-SHARED-ACCOUNT.md",
      phaseRoot: config.artifacts.phaseRoot,
      walkthroughRoot: config.artifacts.walkthroughRoot,
      taskContextPathPattern: `${config.artifacts.phaseRoot}/phase-<phase-token>/context/<taskId>-context.md`,
      table: renderArtifactTable(config)
    },
    checks: {
      default: renderList([...config.checks.default, ...packs.checks.default]),
      defaultShellBlock: renderShellBlock([...config.checks.default, ...packs.checks.default]),
      focusedTestCommand: config.checks.focusedTestCommand ?? "run the configured focused test command for <test-file>",
      changed: renderChangedChecks(mergeChangedChecks(config.checks.changed, packs.checks.changed)),
      changedSchemaInline: renderInlineCommands(
        mergeChangedChecks(config.checks.changed, packs.checks.changed).schema ?? []
      ),
      changedSchemaIndented: renderIndentedList(
        mergeChangedChecks(config.checks.changed, packs.checks.changed).schema ?? []
      )
    },
    quality: {
      experts: renderList(config.quality.experts),
      domainExpert: config.quality.domainExpert ?? packs.quality.domainExpert ?? "none configured",
      invariants: renderList([...config.quality.invariants, ...packs.quality.invariants]),
      invariantSummary: renderInvariantSummary([...config.quality.invariants, ...packs.quality.invariants])
    },
    packs: {
      installed: renderList(packs.packs),
      validators: renderList(packs.validators),
      deploymentImpactSurfaces: renderList([
        ...config.runtime.deploymentImpactSurfaces,
        ...packs.deploymentImpactSurfaces
      ])
    },
    runtime: {
      appRoot: config.runtime.appRoot,
      migrationsGlob: `${config.runtime.appRoot}/migrations/**`,
      bindingConfigFile: `${config.runtime.appRoot}/configured-runtime.toml`,
      routeEntrypoint: `${config.runtime.appRoot}/src/index.ts`
    },
    discovery: {
      codeGraphProvider: config.discovery.codeGraphProvider,
      customProvider: config.discovery.customProvider ?? "none configured",
      fallback: config.discovery.fallback,
      planningProviderSummary: renderPlanningProviderSummary(config)
    },
    state: {
      phaseFields: renderPhaseFields(),
      reportFields: renderList([
        "verdict",
        "summary",
        "filesChanged",
        "checks",
        "handoffFile",
        "selfCritique",
        "lessons",
        "memoryLessons"
      ])
    },
    git: {
      remoteName: config.git.remoteName,
      integrationBranch: config.git.integrationBranch,
      releaseBranch: config.git.releaseBranch ?? "none configured",
      releaseBranchLabel: config.git.releaseBranch ?? "no release branch configured",
      integrationRef: `${config.git.remoteName}/${config.git.integrationBranch}`,
      releaseRef: config.git.releaseBranch ? `${config.git.remoteName}/${config.git.releaseBranch}` : "none configured",
      defaultDeliveryDiffCommand: `git diff --name-only ${config.git.remoteName}/${config.git.integrationBranch}...HEAD`,
      releaseSyncDiffCommand: config.git.releaseBranch
        ? `git diff --name-only ${config.git.remoteName}/${config.git.releaseBranch}...${config.git.remoteName}/${config.git.integrationBranch}`
        : "none configured",
      releaseFlow: config.git.releaseBranch
        ? `${config.git.integrationBranch} -> ${config.git.releaseBranch}`
        : "none configured",
      protectedBranchRule: config.git.releaseBranch
        ? `Working branch must not be \`${config.git.releaseBranch}\` or \`${config.git.integrationBranch}\`.`
        : `Working branch must not be \`${config.git.integrationBranch}\`.`,
      releaseCloseoutRequirement: config.git.releaseBranch
        ? `the close-out explicitly states whether \`${config.git.releaseBranch}\` is already released or not`
        : "the close-out explicitly states that no release branch is configured",
      releaseCloseoutLine: config.git.releaseBranch
        ? `\`${config.git.releaseBranch}\`: released / not released, release PR number if any`
        : "Release branch: not configured",
      releaseSyncAvailability: config.git.releaseBranch
        ? `Release sync is available as \`${config.git.integrationBranch}\` -> \`${config.git.releaseBranch}\`.`
        : "Release sync is unavailable until git.releaseBranch is configured.",
      worktreeParking: config.git.worktreeParking,
      worktreeParkingMode: config.git.worktreeParking ? "enabled" : "disabled",
      worktreeParkingAction: config.git.worktreeParking
        ? "Sync worktrees with `./scripts/park-worktrees.sh`"
        : "Worktree parking is disabled by config; skip parking and rely on the delivery-state report.",
      worktreeHygieneSuccessLine: config.git.worktreeParking
        ? "Local worktree hygiene: pass"
        : "Local worktree hygiene: skipped",
      worktreePostcondition: config.git.worktreeParking
        ? `delivery is not complete until the current worktree is on \`worktree/<dirname>\`, tracks \`${config.git.remoteName}/${config.git.integrationBranch}\`, and its HEAD matches \`${config.git.remoteName}/${config.git.integrationBranch}\``
        : "delivery may complete without parking because git.worktreeParking is disabled; still run the delivery-state helper so the skipped local hygiene state is explicit",
      prBaseFlag: `--base ${config.git.integrationBranch}`,
      remoteBranchDeleteCommand: `gh api "repos/{owner}/{repo}/git/refs/heads/<branch>" -X DELETE`,
      deliveryStateRef: `<merged-commit-or-${config.git.remoteName}/${config.git.integrationBranch}>`,
      worktreeParkCommand: "./scripts/park-worktrees.sh",
      deliveryStateCommand: "./scripts/report-delivery-state.sh"
    },
    dev: {
      startCommand: config.dev.start.command ?? "none configured",
      startUrl: config.dev.start.url ?? "none configured"
    }
  };
}

function renderArtifactTable(config: AgentFlowConfig): string {
  return [
    "| Artifact | Path |",
    "|----------|------|",
    `| Status snapshot | \`${config.artifacts.statusFile}\` |`,
    `| Roadmap | \`${config.artifacts.roadmapFile}\` |`,
    `| Product reference | \`${config.artifacts.productFile}\` |`,
    `| Architecture reference | \`${config.artifacts.architectureFile}\` |`,
    `| User-isolation architecture reference | \`${config.artifacts.userIsolationArchitectureFile}\` |`,
    `| Scheduling architecture reference | \`${config.artifacts.schedulingArchitectureFile}\` |`,
    `| Backlog | \`${config.artifacts.backlogFile}\` |`,
    `| UI/UX specification | \`${config.artifacts.uiUxSpecificationFile}\` |`,
    `| Design system | \`${config.artifacts.designSystemFile}\` |`,
    `| UX writing guide | \`${config.artifacts.uxWritingGuideFile}\` |`,
    `| QA shared account | \`${config.artifacts.qaSharedAccountFile ?? "docs/testing/QA-SHARED-ACCOUNT.md"}\` |`,
    `| Phase root | \`${config.artifacts.phaseRoot}\` |`,
    `| Walkthrough root | \`${config.artifacts.walkthroughRoot}\` |`,
    `| Design document | \`${config.artifacts.phaseRoot}/phase-<phase-token>/design/<taskId>-design.md\` |`,
    `| State | \`${config.artifacts.phaseRoot}/phase-<phase-token>/states/<taskId>-state.json\` |`,
    `| Handoff details | \`${config.artifacts.phaseRoot}/phase-<phase-token>/handoffs/<taskId>/<phase>-detail.md\` |`
  ].join("\n");
}

function renderPhaseFields(): string {
  return [
    "| Phase | Required fields |",
    "|-------|-----------------|",
    "| PLAN | `complexity`, `designDocument`, `scope`, `approvedAt` |",
    "| ARCHITECTURE | `addFile`, `decisions`, `risks` |",
    "| IMPLEMENTATION | `branch`, `diffBase`, `filesCreated`, `filesModified`, `filesDeleted`, `checks` |",
    "| SIMPLIFY | `verdict`, `filesReviewed`, `filesChanged`, `findings`, `summary` |",
    "| REVIEW | `verdict`, `issues`, `triage`, `deferred`, `cycles` |",
    "| QUALITY_GATE | `expertReports`, `arbiterDisposition`, `arbiterVerdict` |",
    "| QA | `testPlan`, `verdict`, `summary`, `failedTests`, `cycles` |",
    "| DELIVERY | `commit`, `pr`, `walkthroughFile`, `docsUpdated`, `followUpsCaptured`, `deploymentImpact` |"
  ].join("\n");
}

function renderChangedChecks(changed: AgentFlowConfig["checks"]["changed"]): string {
  const entries = Object.entries(changed);

  if (entries.length === 0) {
    return "- none configured";
  }

  return entries
    .map(([scope, commands]) => [`- ${scope}`, ...commands.map((command) => `  - \`${command}\``)].join("\n"))
    .join("\n");
}

function renderPlanningProviderSummary(config: AgentFlowConfig): string {
  if (config.discovery.codeGraphProvider === "code-review-graph") {
    return "code-review-graph pack";
  }

  if (config.discovery.codeGraphProvider === "custom") {
    return config.discovery.customProvider ?? "custom code graph provider";
  }

  return `no code graph provider; use ${config.discovery.fallback}`;
}

function renderShellBlock(commands: string[]): string {
  if (commands.length === 0) {
    return "# none configured";
  }

  return commands.join("\n");
}

function renderIndentedList(values: string[]): string {
  if (values.length === 0) {
    return "  - none configured";
  }

  return values.map((value) => `  - \`${value}\``).join("\n");
}

function renderInlineCommands(values: string[]): string {
  if (values.length === 0) {
    return "none configured";
  }

  return values.map((value) => `\`${value}\``).join(" and ");
}

function mergeChangedChecks(
  configChecks: AgentFlowConfig["checks"]["changed"],
  packChecks: AgentFlowConfig["checks"]["changed"]
): AgentFlowConfig["checks"]["changed"] {
  const merged: AgentFlowConfig["checks"]["changed"] = {};

  for (const [scope, commands] of Object.entries(configChecks)) {
    merged[scope] = [...commands];
  }

  for (const [scope, commands] of Object.entries(packChecks)) {
    merged[scope] = merged[scope] ?? [];
    for (const command of commands) {
      if (!merged[scope].includes(command)) {
        merged[scope].push(command);
      }
    }
  }

  return merged;
}

function renderList(values: string[]): string {
  if (values.length === 0) {
    return "- none configured";
  }

  return values.map((value) => `- ${value}`).join("\n");
}

function renderInvariantSummary(values: string[]): string {
  if (values.length === 0) {
    return "configured correctness";
  }

  if (values.length === 1) {
    return values[0] ?? "configured correctness";
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}
