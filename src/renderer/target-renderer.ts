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
}

const CLAUDE_TARGETS: TargetTemplate[] = [
  {
    outputPath: "CLAUDE.md",
    templatePath: path.join("targets", "claude", "CLAUDE.md.hbs"),
    id: "claude-root"
  },
  {
    outputPath: path.join(".claude", "CLAUDE.md"),
    templatePath: path.join("targets", "claude", ".claude", "CLAUDE.md.hbs"),
    id: "claude-orchestrator"
  }
];

const CODEX_TARGETS: TargetTemplate[] = [
  {
    outputPath: "AGENTS.md",
    templatePath: path.join("targets", "codex", "AGENTS.md.hbs"),
    id: "codex-root"
  },
  {
    outputPath: path.join(".codex", "orchestration-policy.md"),
    templatePath: path.join("targets", "codex", ".codex", "orchestration-policy.md.hbs"),
    id: "codex-orchestration-policy"
  },
  {
    outputPath: path.join(".codex", "claude-interop.md"),
    templatePath: path.join("targets", "codex", ".codex", "claude-interop.md.hbs"),
    id: "codex-claude-interop"
  }
];

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
    const body = renderTemplate(template, context, partials);

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
    "state-report-contracts"
  ];
  const partials: TemplatePartials = {};

  await Promise.all(names.map(async (name) => {
    partials[name] = await readFile(path.join(canonicalRoot, `${name}.md.hbs`), "utf8");
  }));

  return partials;
}
