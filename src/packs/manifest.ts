import type { AgentFlowConfig } from "../config/defaults.js";

export interface PackManifest {
  name: string;
  version: number;
  description: string;
  contributes: PackContribution;
}

export interface PackContribution {
  agents?: string[];
  guides?: string[];
  skillFragments?: string[];
  validators?: string[];
  mcpServers?: AgentFlowConfig["mcp"]["servers"];
  checks?: Partial<AgentFlowConfig["checks"]>;
  deploymentImpactSurfaces?: string[];
  quality?: {
    domainExpert?: string;
    invariants?: string[];
  };
}

export interface ComposedPacks {
  packs: string[];
  agents: string[];
  guides: string[];
  skillFragments: string[];
  validators: string[];
  mcpServers: AgentFlowConfig["mcp"]["servers"];
  checks: AgentFlowConfig["checks"];
  deploymentImpactSurfaces: string[];
  quality: {
    domainExpert: string | null;
    invariants: string[];
  };
}

export interface PackCompositionIssue {
  pack: string;
  path: string;
  message: string;
}

export class PackCompositionError extends Error {
  readonly issues: PackCompositionIssue[];

  constructor(issues: PackCompositionIssue[]) {
    super(formatIssues(issues));
    this.name = "PackCompositionError";
    this.issues = issues;
  }
}

export function composePacks(available: PackManifest[], selectedNames: string[]): ComposedPacks {
  const issues: PackCompositionIssue[] = [];
  const manifestsByName = new Map(available.map((pack) => [pack.name, pack]));
  const selected = selectedNames.map((name) => {
    const manifest = manifestsByName.get(name);
    if (!manifest) {
      issues.push({ pack: name, path: "packs", message: "unknown pack" });
    }

    return manifest;
  }).filter((manifest): manifest is PackManifest => manifest !== undefined);

  if (new Set(selectedNames).size !== selectedNames.length) {
    issues.push({ pack: "*", path: "packs", message: "pack list contains duplicates" });
  }

  const composed: ComposedPacks = {
    packs: selectedNames,
    agents: [],
    guides: [],
    skillFragments: [],
    validators: [],
    mcpServers: {},
    checks: {
      default: [],
      optional: {},
      changed: {}
    },
    deploymentImpactSurfaces: [],
    quality: {
      domainExpert: null,
      invariants: []
    }
  };

  for (const pack of selected) {
    mergeStringList(composed.agents, pack.contributes.agents);
    mergeStringList(composed.guides, pack.contributes.guides);
    mergeStringList(composed.skillFragments, pack.contributes.skillFragments);
    mergeValidators(composed.validators, pack, issues);
    mergeMcpServers(composed.mcpServers, pack);
    mergeChecks(composed.checks, pack, issues);
    mergeStringList(composed.deploymentImpactSurfaces, pack.contributes.deploymentImpactSurfaces);
    mergeQuality(composed.quality, pack, issues);
  }

  if (issues.length > 0) {
    throw new PackCompositionError(issues);
  }

  return composed;
}

function mergeValidators(target: string[], pack: PackManifest, issues: PackCompositionIssue[]): void {
  for (const validator of pack.contributes.validators ?? []) {
    if (target.includes(validator)) {
      issues.push({
        pack: pack.name,
        path: `validators.${validator}`,
        message: "validation hook is already contributed by another pack"
      });
      continue;
    }

    target.push(validator);
  }
}

function mergeMcpServers(target: AgentFlowConfig["mcp"]["servers"], pack: PackManifest): void {
  for (const [name, server] of Object.entries(pack.contributes.mcpServers ?? {})) {
    const existing = target[name];
    target[name] = {
      enabled: existing?.enabled === true || server.enabled,
      required: existing?.required === true || server.required
    };
  }
}

function mergeChecks(target: AgentFlowConfig["checks"], pack: PackManifest, issues: PackCompositionIssue[]): void {
  const checks = pack.contributes.checks;
  if (!checks) {
    return;
  }

  mergeStringList(target.default, checks.default);

  for (const [name, command] of Object.entries(checks.optional ?? {})) {
    const existing = target.optional[name];
    if (existing && existing !== command) {
      issues.push({
        pack: pack.name,
        path: `checks.optional.${name}`,
        message: "optional check conflicts with another pack"
      });
      continue;
    }

    target.optional[name] = command;
  }

  for (const [name, commands] of Object.entries(checks.changed ?? {})) {
    target.changed[name] = target.changed[name] ?? [];
    mergeStringList(target.changed[name], commands);
  }
}

function mergeQuality(target: ComposedPacks["quality"], pack: PackManifest, issues: PackCompositionIssue[]): void {
  const quality = pack.contributes.quality;
  if (!quality) {
    return;
  }

  if (quality.domainExpert) {
    if (target.domainExpert) {
      issues.push({
        pack: pack.name,
        path: "quality.domainExpert",
        message: `domain expert already provided by another pack: ${target.domainExpert}`
      });
    } else {
      target.domainExpert = quality.domainExpert;
    }
  }

  mergeStringList(target.invariants, quality.invariants);
}

function mergeStringList(target: string[], source: string[] | undefined): void {
  for (const item of source ?? []) {
    if (!target.includes(item)) {
      target.push(item);
    }
  }
}

function formatIssues(issues: PackCompositionIssue[]): string {
  const details = issues.map((issue) => `- ${issue.pack} ${issue.path}: ${issue.message}`).join("\n");
  return `Invalid Agent Flow pack composition:\n${details}`;
}
