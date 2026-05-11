import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { AgentFlowConfig } from "../config/defaults.js";
import { renderMcpFiles } from "../mcp/catalog.js";
import type { ComposedPacks } from "../packs/manifest.js";
import type { RenderedFile } from "./conflict-policy.js";
import { buildCanonicalContext } from "./canonical-context.js";
import { renderManagedAssetFile, renderManagedFile } from "./managed-blocks.js";
import { renderTemplate, type TemplatePartials } from "./render-template.js";

export interface TargetRenderOptions {
  templateRoot: string;
  version?: number;
}

interface TargetTemplate {
  outputPath: string;
  templatePath: string;
  id: string;
  target: TargetKind;
  packAgent?: string;
  packGuide?: string;
}

interface StaticAsset {
  sourcePath: string;
  relativePath: string;
}

interface SharedTemplate {
  outputPath: string;
  templatePath: string;
  id: string;
  mode?: number;
}

const SHARED_TEMPLATES: SharedTemplate[] = [
  {
    outputPath: path.join("docs", "templates", "agent-report-template.md"),
    templatePath: path.join("shared", "docs", "templates", "agent-report-template.md.hbs"),
    id: "shared-doc-template-agent-report"
  },
  {
    outputPath: path.join("docs", "templates", "design-document-template.md"),
    templatePath: path.join("shared", "docs", "templates", "design-document-template.md.hbs"),
    id: "shared-doc-template-design-document"
  },
  {
    outputPath: path.join("docs", "templates", "qa-report-template.md"),
    templatePath: path.join("shared", "docs", "templates", "qa-report-template.md.hbs"),
    id: "shared-doc-template-qa-report"
  },
  {
    outputPath: path.join("docs", "templates", "state-template.json"),
    templatePath: path.join("shared", "docs", "templates", "state-template.json.hbs"),
    id: "shared-doc-template-state"
  },
  {
    outputPath: path.join("docs", "templates", "walkthrough-template.md"),
    templatePath: path.join("shared", "docs", "templates", "walkthrough-template.md.hbs"),
    id: "shared-doc-template-walkthrough"
  },
  {
    outputPath: path.join("scripts", "agent-flow-review-gate.mjs"),
    templatePath: path.join("shared", "scripts", "agent-flow-review-gate.mjs.hbs"),
    id: "shared-script-review-gate",
    mode: 0o755
  },
  {
    outputPath: path.join("scripts", "agent-flow-phase-check.mjs"),
    templatePath: path.join("shared", "scripts", "agent-flow-phase-check.mjs.hbs"),
    id: "shared-script-phase-check",
    mode: 0o755
  },
  {
    outputPath: path.join("scripts", "agent-flow-validate-phase.mjs"),
    templatePath: path.join("shared", "scripts", "agent-flow-validate-phase.mjs.hbs"),
    id: "shared-script-validate-phase",
    mode: 0o755
  },
  {
    outputPath: path.join("scripts", "park-worktrees.sh"),
    templatePath: path.join("shared", "scripts", "park-worktrees.sh.hbs"),
    id: "shared-script-park-worktrees",
    mode: 0o755
  },
  {
    outputPath: path.join("scripts", "report-delivery-state.sh"),
    templatePath: path.join("shared", "scripts", "report-delivery-state.sh.hbs"),
    id: "shared-script-report-delivery-state",
    mode: 0o755
  }
];

const CORE_STATIC_SKILLS = [
  "architecture-designer",
  "architecture-patterns",
  "commit",
  "architecture-phase",
  "bugfix-flow",
  "delivery-phase",
  "e2e-testing",
  "e2e-testing-patterns",
  "fix-phase",
  "improve-codebase-architecture",
  "implementation-phase",
  "rag-implementation",
  "release-sync",
  "phase-check",
  "plan-phase",
  "planning-lifecycle",
  "product-review",
  "quality-gate-phase",
  "refactor",
  "refactor-plan",
  "refactor-method-complexity-reduce",
  "review-phase",
  "work-planning",
  "writing-plans",
  "shadcn-ui",
  "simplify",
  "simplify-phase",
  "systematic-debugging",
  "tech-review",
  "test-driven-development",
  "testing-phase",
  "ux-copy-review",
  "verification-before-completion",
  "webapp-testing",
  "frontend-design",
  "design-audit",
  "accessibility-audit",
  "brainstorming",
  "devils-advocate"
];

const CORE_STATIC_SKILL_FILES: string[] = [];

const CLAUDE_TARGETS: TargetTemplate[] = [
  {
    outputPath: "CLAUDE.md",
    templatePath: path.join("targets", "claude", "CLAUDE.md.hbs"),
    id: "claude-root",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "CLAUDE.md"),
    templatePath: path.join("targets", "claude", ".claude", "CLAUDE.md.hbs"),
    id: "claude-orchestrator",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "feature-developer.md"),
    templatePath: path.join("targets", "claude", "agents", "feature-developer.md.hbs"),
    id: "claude-agent-feature-developer",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "analyst.md"),
    templatePath: path.join("targets", "claude", "agents", "analyst.md.hbs"),
    id: "claude-agent-analyst",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "architect.md"),
    templatePath: path.join("targets", "claude", "agents", "architect.md.hbs"),
    id: "claude-agent-architect",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "code-simplifier.md"),
    templatePath: path.join("targets", "claude", "agents", "code-simplifier.md.hbs"),
    id: "claude-agent-code-simplifier",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "deep-reviewer.md"),
    templatePath: path.join("targets", "claude", "agents", "deep-reviewer.md.hbs"),
    id: "claude-agent-deep-reviewer",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "findings-arbiter.md"),
    templatePath: path.join("targets", "claude", "agents", "findings-arbiter.md.hbs"),
    id: "claude-agent-findings-arbiter",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "paranoid-architect.md"),
    templatePath: path.join("targets", "claude", "agents", "paranoid-architect.md.hbs"),
    id: "claude-agent-paranoid-architect",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "performance-expert.md"),
    templatePath: path.join("targets", "claude", "agents", "performance-expert.md.hbs"),
    id: "claude-agent-performance-expert",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "product-manager.md"),
    templatePath: path.join("targets", "claude", "agents", "product-manager.md.hbs"),
    id: "claude-agent-product-manager",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "ux-expert.md"),
    templatePath: path.join("targets", "claude", "agents", "ux-expert.md.hbs"),
    id: "claude-agent-ux-expert",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "math-genius.md"),
    templatePath: path.join("targets", "claude", "agents", "math-genius.md.hbs"),
    id: "claude-agent-math-genius",
    target: "claude",
    packAgent: "math-genius"
  },
  {
    outputPath: path.join(".claude", "agents", "prt-code-reviewer.md"),
    templatePath: path.join("targets", "claude", "agents", "prt-code-reviewer.md.hbs"),
    id: "claude-agent-prt-code-reviewer",
    target: "claude",
    packAgent: "prt-code-reviewer"
  },
  {
    outputPath: path.join(".claude", "agents", "prt-code-simplifier.md"),
    templatePath: path.join("targets", "claude", "agents", "prt-code-simplifier.md.hbs"),
    id: "claude-agent-prt-code-simplifier",
    target: "claude",
    packAgent: "prt-code-simplifier"
  },
  {
    outputPath: path.join(".claude", "agents", "prt-comment-analyzer.md"),
    templatePath: path.join("targets", "claude", "agents", "prt-comment-analyzer.md.hbs"),
    id: "claude-agent-prt-comment-analyzer",
    target: "claude",
    packAgent: "prt-comment-analyzer"
  },
  {
    outputPath: path.join(".claude", "agents", "prt-pr-test-analyzer.md"),
    templatePath: path.join("targets", "claude", "agents", "prt-pr-test-analyzer.md.hbs"),
    id: "claude-agent-prt-pr-test-analyzer",
    target: "claude",
    packAgent: "prt-pr-test-analyzer"
  },
  {
    outputPath: path.join(".claude", "agents", "prt-silent-failure-hunter.md"),
    templatePath: path.join("targets", "claude", "agents", "prt-silent-failure-hunter.md.hbs"),
    id: "claude-agent-prt-silent-failure-hunter",
    target: "claude",
    packAgent: "prt-silent-failure-hunter"
  },
  {
    outputPath: path.join(".claude", "agents", "prt-type-design-analyzer.md"),
    templatePath: path.join("targets", "claude", "agents", "prt-type-design-analyzer.md.hbs"),
    id: "claude-agent-prt-type-design-analyzer",
    target: "claude",
    packAgent: "prt-type-design-analyzer"
  },
  {
    outputPath: path.join(".claude", "agents", "delivery-agent.md"),
    templatePath: path.join("targets", "claude", "agents", "delivery-agent.md.hbs"),
    id: "claude-agent-delivery-agent",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "agents", "qa-expert.md"),
    templatePath: path.join("targets", "claude", "agents", "qa-expert.md.hbs"),
    id: "claude-agent-qa-expert",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "guides", "gan-protocol.md"),
    templatePath: path.join("targets", "claude", "guides", "gan-protocol.md.hbs"),
    id: "claude-guide-gan-protocol",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "guides", "systematic-debugging.md"),
    templatePath: path.join("targets", "claude", "guides", "systematic-debugging.md.hbs"),
    id: "claude-guide-systematic-debugging",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "guides", "test-driven-development.md"),
    templatePath: path.join("targets", "claude", "guides", "test-driven-development.md.hbs"),
    id: "claude-guide-test-driven-development",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "guides", "verification-before-completion.md"),
    templatePath: path.join("targets", "claude", "guides", "verification-before-completion.md.hbs"),
    id: "claude-guide-verification-before-completion",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "guides", "worktree-workflow.md"),
    templatePath: path.join("targets", "claude", "guides", "worktree-workflow.md.hbs"),
    id: "claude-guide-worktree-workflow",
    target: "claude"
  },
  {
    outputPath: path.join(".claude", "guides", "ui-ux-pro-max-reference.md"),
    templatePath: path.join("targets", "claude", "guides", "ui-ux-pro-max-reference.md.hbs"),
    id: "claude-guide-ui-ux-pro-max-reference",
    target: "claude",
    packGuide: "ui-ux-pro-max-reference"
  },
  {
    outputPath: path.join(".claude", "guides", "code-review-graph-usage.md"),
    templatePath: path.join("targets", "claude", "guides", "code-review-graph-usage.md.hbs"),
    id: "claude-guide-code-review-graph-usage",
    target: "claude",
    packGuide: "code-review-graph-usage"
  }
];

const CODEX_TARGETS: TargetTemplate[] = [
  {
    outputPath: "AGENTS.md",
    templatePath: path.join("targets", "codex", "AGENTS.md.hbs"),
    id: "codex-root",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "orchestration-policy.md"),
    templatePath: path.join("targets", "codex", ".codex", "orchestration-policy.md.hbs"),
    id: "codex-orchestration-policy",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "claude-interop.md"),
    templatePath: path.join("targets", "codex", ".codex", "claude-interop.md.hbs"),
    id: "codex-claude-interop",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "README.md"),
    templatePath: path.join("targets", "codex", ".codex", "README.md.hbs"),
    id: "codex-readme",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "feature-developer.md"),
    templatePath: path.join("targets", "codex", "agents", "feature-developer.md.hbs"),
    id: "codex-agent-feature-developer",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "analyst.md"),
    templatePath: path.join("targets", "codex", "agents", "analyst.md.hbs"),
    id: "codex-agent-analyst",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "architect.md"),
    templatePath: path.join("targets", "codex", "agents", "architect.md.hbs"),
    id: "codex-agent-architect",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "code-simplifier.md"),
    templatePath: path.join("targets", "codex", "agents", "code-simplifier.md.hbs"),
    id: "codex-agent-code-simplifier",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "deep-reviewer.md"),
    templatePath: path.join("targets", "codex", "agents", "deep-reviewer.md.hbs"),
    id: "codex-agent-deep-reviewer",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "findings-arbiter.md"),
    templatePath: path.join("targets", "codex", "agents", "findings-arbiter.md.hbs"),
    id: "codex-agent-findings-arbiter",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "paranoid-architect.md"),
    templatePath: path.join("targets", "codex", "agents", "paranoid-architect.md.hbs"),
    id: "codex-agent-paranoid-architect",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "performance-expert.md"),
    templatePath: path.join("targets", "codex", "agents", "performance-expert.md.hbs"),
    id: "codex-agent-performance-expert",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "product-manager.md"),
    templatePath: path.join("targets", "codex", "agents", "product-manager.md.hbs"),
    id: "codex-agent-product-manager",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "ux-expert.md"),
    templatePath: path.join("targets", "codex", "agents", "ux-expert.md.hbs"),
    id: "codex-agent-ux-expert",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "math-genius.md"),
    templatePath: path.join("targets", "codex", "agents", "math-genius.md.hbs"),
    id: "codex-agent-math-genius",
    target: "codex",
    packAgent: "math-genius"
  },
  {
    outputPath: path.join(".codex", "agents", "prt-code-reviewer.md"),
    templatePath: path.join("targets", "codex", "agents", "prt-code-reviewer.md.hbs"),
    id: "codex-agent-prt-code-reviewer",
    target: "codex",
    packAgent: "prt-code-reviewer"
  },
  {
    outputPath: path.join(".codex", "agents", "prt-code-simplifier.md"),
    templatePath: path.join("targets", "codex", "agents", "prt-code-simplifier.md.hbs"),
    id: "codex-agent-prt-code-simplifier",
    target: "codex",
    packAgent: "prt-code-simplifier"
  },
  {
    outputPath: path.join(".codex", "agents", "prt-comment-analyzer.md"),
    templatePath: path.join("targets", "codex", "agents", "prt-comment-analyzer.md.hbs"),
    id: "codex-agent-prt-comment-analyzer",
    target: "codex",
    packAgent: "prt-comment-analyzer"
  },
  {
    outputPath: path.join(".codex", "agents", "prt-pr-test-analyzer.md"),
    templatePath: path.join("targets", "codex", "agents", "prt-pr-test-analyzer.md.hbs"),
    id: "codex-agent-prt-pr-test-analyzer",
    target: "codex",
    packAgent: "prt-pr-test-analyzer"
  },
  {
    outputPath: path.join(".codex", "agents", "prt-silent-failure-hunter.md"),
    templatePath: path.join("targets", "codex", "agents", "prt-silent-failure-hunter.md.hbs"),
    id: "codex-agent-prt-silent-failure-hunter",
    target: "codex",
    packAgent: "prt-silent-failure-hunter"
  },
  {
    outputPath: path.join(".codex", "agents", "prt-type-design-analyzer.md"),
    templatePath: path.join("targets", "codex", "agents", "prt-type-design-analyzer.md.hbs"),
    id: "codex-agent-prt-type-design-analyzer",
    target: "codex",
    packAgent: "prt-type-design-analyzer"
  },
  {
    outputPath: path.join(".codex", "agents", "delivery-agent.md"),
    templatePath: path.join("targets", "codex", "agents", "delivery-agent.md.hbs"),
    id: "codex-agent-delivery-agent",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "agents", "qa-expert.md"),
    templatePath: path.join("targets", "codex", "agents", "qa-expert.md.hbs"),
    id: "codex-agent-qa-expert",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "guides", "gan-protocol.md"),
    templatePath: path.join("targets", "codex", "guides", "gan-protocol.md.hbs"),
    id: "codex-guide-gan-protocol",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "guides", "systematic-debugging.md"),
    templatePath: path.join("targets", "codex", "guides", "systematic-debugging.md.hbs"),
    id: "codex-guide-systematic-debugging",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "guides", "test-driven-development.md"),
    templatePath: path.join("targets", "codex", "guides", "test-driven-development.md.hbs"),
    id: "codex-guide-test-driven-development",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "guides", "verification-before-completion.md"),
    templatePath: path.join("targets", "codex", "guides", "verification-before-completion.md.hbs"),
    id: "codex-guide-verification-before-completion",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "guides", "worktree-workflow.md"),
    templatePath: path.join("targets", "codex", "guides", "worktree-workflow.md.hbs"),
    id: "codex-guide-worktree-workflow",
    target: "codex"
  },
  {
    outputPath: path.join(".codex", "guides", "ui-ux-pro-max-reference.md"),
    templatePath: path.join("targets", "codex", "guides", "ui-ux-pro-max-reference.md.hbs"),
    id: "codex-guide-ui-ux-pro-max-reference",
    target: "codex",
    packGuide: "ui-ux-pro-max-reference"
  },
  {
    outputPath: path.join(".codex", "guides", "code-review-graph-usage.md"),
    templatePath: path.join("targets", "codex", "guides", "code-review-graph-usage.md.hbs"),
    id: "codex-guide-code-review-graph-usage",
    target: "codex",
    packGuide: "code-review-graph-usage"
  }
];

type TargetKind = "claude" | "codex";

export async function renderTargetFiles(
  config: AgentFlowConfig,
  packs: ComposedPacks,
  options: TargetRenderOptions
): Promise<RenderedFile[]> {
  const partials = await loadCanonicalPartials(options.templateRoot);
  const context = buildCanonicalContext(config, packs);
  const targets = [
    ...(config.features.claude ? CLAUDE_TARGETS : []),
    ...(config.features.codex ? CODEX_TARGETS : [])
  ].filter((target) => {
    if (target.packAgent && !packs.agents.includes(target.packAgent)) {
      return false;
    }

    if (target.packGuide && !packs.guides.includes(target.packGuide)) {
      return false;
    }

    return true;
  });

  const renderedTemplates = await Promise.all(targets.map(async (target) => {
    const template = await readFile(path.join(options.templateRoot, target.templatePath), "utf8");
    const rendered = renderTemplate(template, {
      ...context,
      target: targetContext(target.target)
    }, partials);
    const body = applyTargetAdapters(rendered, target.target);

    return {
      path: target.outputPath,
      content: renderManagedFile(
        {
          id: target.id,
          version: options.version ?? 1,
          source: path.join("templates", target.templatePath)
        },
        body
      )
    };
  }));

  const renderedSkillAssets = await renderPackSkillAssets(config, packs, options);
  const renderedSharedTemplates = await renderSharedTemplates(config, packs, options);
  const renderedMcpFiles = renderMcpFiles(config, packs);
  return [...renderedTemplates, ...renderedSkillAssets, ...renderedSharedTemplates, ...renderedMcpFiles];
}

async function loadCanonicalPartials(templateRoot: string): Promise<TemplatePartials> {
  const canonicalRoot = path.join(templateRoot, "canonical");
  const names = [
    "index",
    "lifecycle",
    "artifact-contracts",
    "quality-gates",
    "qa-delivery",
    "state-report-contracts",
    path.join("agents", "feature-developer"),
    path.join("agents", "analyst"),
    path.join("agents", "architect"),
    path.join("agents", "code-simplifier"),
    path.join("agents", "deep-reviewer"),
    path.join("agents", "findings-arbiter"),
    path.join("agents", "paranoid-architect"),
    path.join("agents", "performance-expert"),
    path.join("agents", "product-manager"),
    path.join("agents", "ux-expert"),
    path.join("agents", "math-genius"),
    path.join("agents", "prt-code-reviewer"),
    path.join("agents", "prt-code-simplifier"),
    path.join("agents", "prt-comment-analyzer"),
    path.join("agents", "prt-pr-test-analyzer"),
    path.join("agents", "prt-silent-failure-hunter"),
    path.join("agents", "prt-type-design-analyzer"),
    path.join("agents", "delivery-agent"),
    path.join("agents", "qa-expert"),
    path.join("guides", "gan-protocol"),
    path.join("guides", "systematic-debugging"),
    path.join("guides", "test-driven-development"),
    path.join("guides", "verification-before-completion"),
    path.join("guides", "worktree-workflow"),
    path.join("guides", "ui-ux-pro-max-reference"),
    path.join("guides", "code-review-graph-usage")
  ];
  const partials: TemplatePartials = {};

  await Promise.all(names.map(async (name) => {
    partials[name.replaceAll(path.sep, "/")] = await readFile(path.join(canonicalRoot, `${name}.md.hbs`), "utf8");
  }));

  return partials;
}

async function renderPackSkillAssets(
  config: AgentFlowConfig,
  packs: ComposedPacks,
  options: TargetRenderOptions
): Promise<RenderedFile[]> {
  const context = buildCanonicalContext(config, packs);
  const targetKinds: TargetKind[] = [
    ...(config.features.claude ? ["claude" as const] : []),
    ...(config.features.codex ? ["codex" as const] : [])
  ];
  const rendered: RenderedFile[] = [];
  const selectedSkills = [...new Set([...CORE_STATIC_SKILLS, ...packs.skills])];
  const selectedSkillFiles = [...new Set([...CORE_STATIC_SKILL_FILES, ...packs.skillFiles])];

  for (const skill of selectedSkills) {
    const sourceRoot = path.join("static", "skills", skill);
    const assets = await listStaticAssets(path.join(options.templateRoot, sourceRoot));

    for (const target of targetKinds) {
      for (const asset of assets) {
        const outputPath = path.join(targetContext(target).toolRoot, "skills", skill, asset.relativePath);
        const sourcePath = path.join(sourceRoot, asset.relativePath);
        const raw = await readFile(asset.sourcePath, "utf8");
        const renderedBody = needsStaticTemplate(raw)
          ? renderTemplate(raw, {
            ...context,
            target: targetContext(target)
          })
          : raw;
        const body = applyTargetAdapters(renderedBody, target);

        rendered.push({
          path: outputPath,
          mode: executableModeForContent(body),
          content: renderManagedAssetFile(
            {
              id: `${target}-skill-${skill}-${asset.relativePath.replaceAll(path.sep, "-")}`,
              version: options.version ?? 1,
              source: path.join("templates", sourcePath)
            },
            body,
            outputPath
          )
        });
      }
    }
  }

  for (const skillFile of selectedSkillFiles) {
    const sourcePath = path.join("static", "skills", skillFile);
    const raw = await readFile(path.join(options.templateRoot, sourcePath), "utf8");

    for (const target of targetKinds) {
      const outputPath = path.join(targetContext(target).toolRoot, "skills", skillFile);
      const renderedBody = needsStaticTemplate(raw)
        ? renderTemplate(raw, {
          ...context,
          target: targetContext(target)
        })
        : raw;
      const body = applyTargetAdapters(renderedBody, target);

      rendered.push({
        path: outputPath,
        mode: executableModeForContent(body),
        content: renderManagedAssetFile(
          {
            id: `${target}-skill-file-${skillFile.replaceAll(path.sep, "-")}`,
            version: options.version ?? 1,
            source: path.join("templates", sourcePath)
          },
          body,
          outputPath
        )
      });
    }
  }

  return rendered;
}

async function renderSharedTemplates(
  config: AgentFlowConfig,
  packs: ComposedPacks,
  options: TargetRenderOptions
): Promise<RenderedFile[]> {
  const context = buildCanonicalContext(config, packs);

  return Promise.all(SHARED_TEMPLATES.map(async (template) => {
    const raw = await readFile(path.join(options.templateRoot, template.templatePath), "utf8");
    const body = renderTemplate(raw, context);

    return {
      path: template.outputPath,
      mode: template.mode ?? executableModeForContent(body),
      content: renderManagedAssetFile(
        {
          id: template.id,
          version: options.version ?? 1,
          source: path.join("templates", template.templatePath)
        },
        body,
        template.outputPath
      )
    };
  }));
}

function executableModeForContent(content: string): number | undefined {
  return content.startsWith("#!") ? 0o755 : undefined;
}

function needsStaticTemplate(content: string): boolean {
  return /\{\{\s*(?:target|git|checks|artifacts|runtime|dev|project|quality|packs|discovery|state|lifecycle)\./.test(content);
}

async function listStaticAssets(root: string, current = root): Promise<StaticAsset[]> {
  let entries;
  try {
    entries = await readdir(current, { withFileTypes: true });
  } catch (error) {
    if ((error as { code?: string }).code === "ENOENT" && current === root) {
      return [];
    }

    throw error;
  }

  const assets: StaticAsset[] = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const entryPath = path.join(current, entry.name);

    if (entry.isDirectory()) {
      assets.push(...await listStaticAssets(root, entryPath));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    assets.push({
      sourcePath: entryPath,
      relativePath: path.relative(root, entryPath)
    });
  }

  return assets;
}

function targetContext(target: TargetKind): {
  agentName: string;
  guideRoot: string;
  homeRoot: string;
  skillRoot: string;
  toolRoot: string;
} {
  const root = target === "claude" ? ".claude" : ".codex";
  return {
    agentName: target === "claude" ? "Claude Code" : "Codex",
    guideRoot: path.posix.join(root, "guides"),
    homeRoot: target === "claude" ? "~/.claude" : "~/.codex",
    toolRoot: root,
    skillRoot: path.posix.join(root, "skills")
  };
}

function applyTargetAdapters(content: string, target: TargetKind): string {
  if (target !== "codex") {
    return content;
  }

  return content
    .replaceAll("Claude/OpenBrowser", "agent/browser")
    .replaceAll(".claude/guides/", ".codex/guides/")
    .replaceAll(".claude/skills/", ".codex/skills/")
    .replaceAll(".claude", ".codex")
    .replaceAll("`/ckm:brand`", "`brand-uupm`")
    .replaceAll("`/ckm:design-system`", "`design-system-uupm`")
    .replaceAll("`/ck:ui-ux-pro-max`", "`ui-ux-pro-max`")
    .replaceAll("`/ck:frontend-design`", "`frontend-design`")
    .replaceAll("`/ui-ux-pro-max`", "`ui-ux-pro-max`")
    .replaceAll("AskUserQuestion", "ask the user directly")
    .replaceAll("OpenBrowser", "browser automation")
    .replaceAll("Claude-native", "runtime-native")
    .replaceAll("Claude consumption", "agent consumption");
}
