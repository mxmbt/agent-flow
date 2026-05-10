import type { AgentFlowConfig } from "./defaults.js";

export const profileNames = ["generic", "webapp", "finai.example"] as const;
export type ProfileName = typeof profileNames[number];

export interface ProfileApplication {
  config: AgentFlowConfig;
  evidence: string[];
}

export function isProfileName(value: string): value is ProfileName {
  return (profileNames as readonly string[]).includes(value);
}

export function applyProfile(config: AgentFlowConfig, profile: ProfileName): ProfileApplication {
  const next = cloneConfig(config);
  const evidence: string[] = [];

  if (profile === "generic") {
    evidence.push("Applied generic profile: stack-neutral core install.");
    return { config: next, evidence };
  }

  if (profile === "webapp") {
    addPack(next, "webapp");
    addQualityInvariant(next, "browser-accessible user flows");
    addQualityInvariant(next, "responsive layout and accessibility");

    if (!next.dev.start.url) {
      next.dev.start.url = "http://localhost:3000";
    }

    evidence.push("Applied webapp profile: enabled browser QA/accessibility pack and starter frontend defaults without assuming a framework.");
    return { config: next, evidence };
  }

  next.project.taskPrefix = "FINAI";
  next.project.taskIdPattern = "FINAI-[A-Z0-9]+-T[0-9]+";
  next.git.integrationBranch = "develop";
  next.git.releaseBranch = "master";
  next.git.worktreeParking = true;
  next.checks.default = ["npm test", "npm run type-check"];
  next.checks.focusedTestCommand = "npm test -- <test-file>";
  next.checks.changed.schema = ["npm run generate", "npm run migrate:local"];
  next.dev.start.command = "npm run dev";
  next.dev.start.url = "http://localhost:8787";
  next.runtime.appRoot = "cf";
  next.runtime.deploymentImpactSurfaces = ["D1 migrations", "R2 buckets", "KV namespaces", "Telegram webhook"];
  next.discovery.codeGraphProvider = "code-review-graph";
  next.mcp.servers.codeReviewGraph = { enabled: true, required: false };
  addPack(next, "finance");
  addPack(next, "cloudflare-worker");
  addPack(next, "telegram");
  addPack(next, "webapp");
  addPack(next, "code-review-toolkit");
  addPack(next, "code-review-graph");
  addQualityInvariant(next, "fixed-point money");
  addQualityInvariant(next, "no look-ahead");
  addQualityInvariant(next, "explicit timezone handling");

  evidence.push("Applied finai.example profile: composed finance, Cloudflare Worker, Telegram, webapp, code-review-toolkit, and code-review-graph assumptions as adapter config.");
  return { config: next, evidence };
}

function addPack(config: AgentFlowConfig, pack: string): void {
  if (!config.packs.includes(pack)) {
    config.packs.push(pack);
  }
}

function addQualityInvariant(config: AgentFlowConfig, invariant: string): void {
  if (!config.quality.invariants.includes(invariant)) {
    config.quality.invariants.push(invariant);
  }
}

function cloneConfig(config: AgentFlowConfig): AgentFlowConfig {
  return JSON.parse(JSON.stringify(config)) as AgentFlowConfig;
}
