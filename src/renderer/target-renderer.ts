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
    outputPath: path.join(".claude", "agents", "math-genius.md"),
    templatePath: path.join("targets", "claude", "agents", "math-genius.md.hbs"),
    id: "claude-agent-math-genius",
    target: "claude",
    packAgent: "math-genius"
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
    outputPath: path.join(".codex", "agents", "math-genius.md"),
    templatePath: path.join("targets", "codex", "agents", "math-genius.md.hbs"),
    id: "codex-agent-math-genius",
    target: "codex",
    packAgent: "math-genius"
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
  ].filter((target) => !target.packAgent || packs.agents.includes(target.packAgent));

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
    path.join("agents", "math-genius"),
    path.join("agents", "delivery-agent"),
    path.join("agents", "qa-expert")
  ];
  const partials: TemplatePartials = {};

  await Promise.all(names.map(async (name) => {
    partials[name.replaceAll(path.sep, "/")] = await readFile(path.join(canonicalRoot, `${name}.md.hbs`), "utf8");
  }));

  return partials;
}

function targetContext(target: TargetKind): { guideRoot: string; skillRoot: string } {
  const root = target === "claude" ? ".claude" : ".codex";
  return {
    guideRoot: path.posix.join(root, "guides"),
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
