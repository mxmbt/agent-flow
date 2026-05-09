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
  ];

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
