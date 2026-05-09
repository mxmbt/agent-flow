import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AgentFlowConfig } from "../config/defaults.js";
import type { ComposedPacks } from "../packs/manifest.js";
import type { RenderedFile } from "./conflict-policy.js";
import { buildCanonicalContext } from "./canonical-context.js";
import { renderManagedFile } from "./managed-blocks.js";
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

  return Promise.all(targets.map(async (target) => {
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
    path.join("guides", "code-review-graph-usage")
  ];
  const partials: TemplatePartials = {};

  await Promise.all(names.map(async (name) => {
    partials[name.replaceAll(path.sep, "/")] = await readFile(path.join(canonicalRoot, `${name}.md.hbs`), "utf8");
  }));

  return partials;
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
    .replaceAll(".claude/guides/", ".codex/guides/")
    .replaceAll(".claude/skills/", ".codex/skills/");
}
