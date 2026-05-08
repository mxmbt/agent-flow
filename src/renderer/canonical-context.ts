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
      phaseRoot: config.artifacts.phaseRoot,
      walkthroughRoot: config.artifacts.walkthroughRoot,
      table: renderArtifactTable(config)
    },
    checks: {
      default: renderList([...config.checks.default, ...packs.checks.default]),
      changed: renderChangedChecks(mergeChangedChecks(config.checks.changed, packs.checks.changed))
    },
    quality: {
      experts: renderList(config.quality.experts),
      domainExpert: config.quality.domainExpert ?? packs.quality.domainExpert ?? "none configured",
      invariants: renderList([...config.quality.invariants, ...packs.quality.invariants])
    },
    packs: {
      installed: renderList(packs.packs),
      validators: renderList(packs.validators),
      deploymentImpactSurfaces: renderList([
        ...config.runtime.deploymentImpactSurfaces,
        ...packs.deploymentImpactSurfaces
      ])
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
      integrationBranch: config.git.integrationBranch,
      releaseBranch: config.git.releaseBranch ?? "none configured"
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
