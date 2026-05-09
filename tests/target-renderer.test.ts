import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createDefaultConfig } from "../src/config/defaults.js";
import { builtinPacks } from "../src/packs/builtin.js";
import { composePacks } from "../src/packs/manifest.js";
import { parseManagedMetadata } from "../src/renderer/managed-blocks.js";
import { renderTargetFiles } from "../src/renderer/target-renderer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const templateRoot = path.join(repoRoot, "templates");

test("renderTargetFiles renders native Claude and Codex root targets from the same canonical contract", async () => {
  const config = createDefaultConfig("Target Fixture");
  config.checks.default = ["npm test"];
  const packs = composePacks(builtinPacks, ["finance"]);

  const files = await renderTargetFiles(config, packs, { templateRoot, version: 7 });
  const byPath = new Map(files.map((file) => [file.path, file.content]));

  assert.deepEqual([...byPath.keys()], [
    "CLAUDE.md",
    path.join(".claude", "CLAUDE.md"),
    path.join(".claude", "agents", "feature-developer.md"),
    path.join(".claude", "agents", "analyst.md"),
    path.join(".claude", "agents", "architect.md"),
    path.join(".claude", "agents", "code-simplifier.md"),
    path.join(".claude", "agents", "deep-reviewer.md"),
    path.join(".claude", "agents", "findings-arbiter.md"),
    path.join(".claude", "agents", "math-genius.md"),
    path.join(".claude", "agents", "delivery-agent.md"),
    path.join(".claude", "agents", "qa-expert.md"),
    "AGENTS.md",
    path.join(".codex", "orchestration-policy.md"),
    path.join(".codex", "claude-interop.md"),
    path.join(".codex", "agents", "feature-developer.md"),
    path.join(".codex", "agents", "analyst.md"),
    path.join(".codex", "agents", "architect.md"),
    path.join(".codex", "agents", "code-simplifier.md"),
    path.join(".codex", "agents", "deep-reviewer.md"),
    path.join(".codex", "agents", "findings-arbiter.md"),
    path.join(".codex", "agents", "math-genius.md"),
    path.join(".codex", "agents", "delivery-agent.md"),
    path.join(".codex", "agents", "qa-expert.md")
  ]);

  const claude = byPath.get("CLAUDE.md");
  const codex = byPath.get("AGENTS.md");
  assert.ok(claude);
  assert.ok(codex);

  assert.deepEqual(parseManagedMetadata(claude), {
    id: "claude-root",
    version: 7,
    source: path.join("templates", "targets", "claude", "CLAUDE.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codex), {
    id: "codex-root",
    version: 7,
    source: path.join("templates", "targets", "codex", "AGENTS.md.hbs")
  });

  assert.equal(canonicalBody(claude), canonicalBody(codex));
  assert.match(codex, /# Codex Orchestrator/);
  assert.match(claude, /# Claude Code Bootstrap/);
  assert.match(codex, /PLAN -> \[ARCHITECTURE if RED\]/);
  assert.match(codex, /# Canonical Artifact Contracts/);
  assert.match(codex, /# Canonical Quality Gates/);
  assert.match(codex, /# Canonical QA And Delivery/);
  assert.match(codex, /# Canonical State And Report Contracts/);
  assert.doesNotMatch(codex, /FinAI|FINAI|ZNAI|cf &&|organizationId/);

  const claudeAgent = byPath.get(path.join(".claude", "agents", "feature-developer.md"));
  const codexAgent = byPath.get(path.join(".codex", "agents", "feature-developer.md"));
  assert.ok(claudeAgent);
  assert.ok(codexAgent);
  assert.deepEqual(parseManagedMetadata(claudeAgent), {
    id: "claude-agent-feature-developer",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "feature-developer.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexAgent), {
    id: "codex-agent-feature-developer",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "feature-developer.md.hbs")
  });
  assert.match(claudeAgent, /`\.claude\/guides\/test-driven-development\.md`/);
  assert.match(codexAgent, /`\.codex\/guides\/test-driven-development\.md`/);
  assert.match(claudeAgent, /`\.claude\/skills\/frontend-design\/SKILL\.md`/);
  assert.match(codexAgent, /`\.codex\/skills\/frontend-design\/SKILL\.md`/);
  assert.match(codexAgent, /fixed-point money, no look-ahead, and explicit timezone handling/);
  assert.match(codexAgent, /Preferred path:/);
  assert.doesNotMatch(codexAgent, /Preferred path in FinAI:/);
  assert.match(codexAgent, /Default required checks for code changes:\n\n```bash\nnpm test\n```/s);

  const claudeAnalyst = byPath.get(path.join(".claude", "agents", "analyst.md"));
  const codexAnalyst = byPath.get(path.join(".codex", "agents", "analyst.md"));
  assert.ok(claudeAnalyst);
  assert.ok(codexAnalyst);
  assert.deepEqual(parseManagedMetadata(claudeAnalyst), {
    id: "claude-agent-analyst",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "analyst.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexAnalyst), {
    id: "codex-agent-analyst",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "analyst.md.hbs")
  });
  assert.match(codexAnalyst, /canonical research pack/);

  const claudeArchitect = byPath.get(path.join(".claude", "agents", "architect.md"));
  const codexArchitect = byPath.get(path.join(".codex", "agents", "architect.md"));
  assert.ok(claudeArchitect);
  assert.ok(codexArchitect);
  assert.deepEqual(parseManagedMetadata(claudeArchitect), {
    id: "claude-agent-architect",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "architect.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexArchitect), {
    id: "codex-agent-architect",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "architect.md.hbs")
  });
  assert.match(claudeArchitect, /`\.claude\/skills\/architecture-designer\/SKILL\.md`/);
  assert.match(codexArchitect, /`\.codex\/skills\/architecture-designer\/SKILL\.md`/);
  assert.match(codexArchitect, /`docs\/ARCHITECTURE\.md`/);
  assert.match(codexArchitect, /user-isolation work -> `docs\/ARCHITECTURE_MULTI_USER\.md`/);
  assert.match(codexArchitect, /scheduling or asynchronous work -> `docs\/ARCHITECTURE_SCHEDULING\.md`/);
  assert.match(codexArchitect, /Preferred path:/);
  assert.doesNotMatch(codexArchitect, /Preferred path in FinAI:/);
  assert.doesNotMatch(codexArchitect, /Cloudflare Workers|Telegram-first/);

  const claudeSimplifier = byPath.get(path.join(".claude", "agents", "code-simplifier.md"));
  const codexSimplifier = byPath.get(path.join(".codex", "agents", "code-simplifier.md"));
  assert.ok(claudeSimplifier);
  assert.ok(codexSimplifier);
  assert.deepEqual(parseManagedMetadata(claudeSimplifier), {
    id: "claude-agent-code-simplifier",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "code-simplifier.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexSimplifier), {
    id: "codex-agent-code-simplifier",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "code-simplifier.md.hbs")
  });
  assert.match(claudeSimplifier, /`\.claude\/skills\/simplify\/SKILL\.md`/);
  assert.match(codexSimplifier, /`\.codex\/skills\/simplify\/SKILL\.md`/);
  assert.match(codexSimplifier, /Run the repo-native checks after simplification:\n\n```bash\nnpm test\n```/s);

  const claudeDeepReviewer = byPath.get(path.join(".claude", "agents", "deep-reviewer.md"));
  const codexDeepReviewer = byPath.get(path.join(".codex", "agents", "deep-reviewer.md"));
  assert.ok(claudeDeepReviewer);
  assert.ok(codexDeepReviewer);
  assert.deepEqual(parseManagedMetadata(claudeDeepReviewer), {
    id: "claude-agent-deep-reviewer",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "deep-reviewer.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexDeepReviewer), {
    id: "codex-agent-deep-reviewer",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "deep-reviewer.md.hbs")
  });
  assert.match(claudeDeepReviewer, /`\.claude\/guides\/code-review-graph-usage\.md`/);
  assert.match(codexDeepReviewer, /`\.codex\/guides\/code-review-graph-usage\.md`/);
  assert.match(codexDeepReviewer, /`docs\/phases\/phase-<phase-token>\/research\/<taskId>-research-pack\.md`/);
  assert.match(codexDeepReviewer, /docs\/phases\/phase-<phase-token>\/handoffs\/<taskId>\/deep-review-detail\.md/);
  assert.match(codexDeepReviewer, /Preferred path:/);
  assert.doesNotMatch(codexDeepReviewer, /Preferred path in FinAI:/);
  assert.doesNotMatch(codexDeepReviewer, /financial correctness/);

  const claudeFindingsArbiter = byPath.get(path.join(".claude", "agents", "findings-arbiter.md"));
  const codexFindingsArbiter = byPath.get(path.join(".codex", "agents", "findings-arbiter.md"));
  assert.ok(claudeFindingsArbiter);
  assert.ok(codexFindingsArbiter);
  assert.deepEqual(parseManagedMetadata(claudeFindingsArbiter), {
    id: "claude-agent-findings-arbiter",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "findings-arbiter.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexFindingsArbiter), {
    id: "codex-agent-findings-arbiter",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "findings-arbiter.md.hbs")
  });
  assert.match(codexFindingsArbiter, /phase-local follow-up -> `docs\/phases\/phase-<phase-token>\/tasks\.md`/);
  assert.match(codexFindingsArbiter, /roadmap \/ milestone follow-up -> `docs\/ROADMAP\.md`/);
  assert.doesNotMatch(codexFindingsArbiter, /financial-math/);

  const claudeMathGenius = byPath.get(path.join(".claude", "agents", "math-genius.md"));
  const codexMathGenius = byPath.get(path.join(".codex", "agents", "math-genius.md"));
  assert.ok(claudeMathGenius);
  assert.ok(codexMathGenius);
  assert.deepEqual(parseManagedMetadata(claudeMathGenius), {
    id: "claude-agent-math-genius",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "math-genius.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexMathGenius), {
    id: "codex-agent-math-genius",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "math-genius.md.hbs")
  });
  assert.match(codexMathGenius, /finance pack extension/);
  assert.doesNotMatch(codexMathGenius, /FinAI|ZNAI/);

  const claudeDeliveryAgent = byPath.get(path.join(".claude", "agents", "delivery-agent.md"));
  const codexDeliveryAgent = byPath.get(path.join(".codex", "agents", "delivery-agent.md"));
  assert.ok(claudeDeliveryAgent);
  assert.ok(codexDeliveryAgent);
  assert.deepEqual(parseManagedMetadata(claudeDeliveryAgent), {
    id: "claude-agent-delivery-agent",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "delivery-agent.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexDeliveryAgent), {
    id: "codex-agent-delivery-agent",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "delivery-agent.md.hbs")
  });
  assert.match(claudeDeliveryAgent, /Commit staged files per `\.claude\/skills\/commit\/SKILL\.md`/);
  assert.match(codexDeliveryAgent, /Commit staged files per `\.codex\/skills\/commit\/SKILL\.md`/);

  const claudeQaAgent = byPath.get(path.join(".claude", "agents", "qa-expert.md"));
  const codexQaAgent = byPath.get(path.join(".codex", "agents", "qa-expert.md"));
  assert.ok(claudeQaAgent);
  assert.ok(codexQaAgent);
  assert.deepEqual(parseManagedMetadata(claudeQaAgent), {
    id: "claude-agent-qa-expert",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "qa-expert.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexQaAgent), {
    id: "codex-agent-qa-expert",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "qa-expert.md.hbs")
  });
  assert.match(claudeQaAgent, /`\.claude\/guides\/verification-before-completion\.md`/);
  assert.match(codexQaAgent, /`\.codex\/guides\/verification-before-completion\.md`/);
});

test("renderTargetFiles honors disabled Claude or Codex feature flags", async () => {
  const config = createDefaultConfig("Codex Only");
  config.features.claude = false;
  const packs = composePacks(builtinPacks, []);

  const files = await renderTargetFiles(config, packs, { templateRoot });

  assert.deepEqual(files.map((file) => file.path), [
    "AGENTS.md",
    path.join(".codex", "orchestration-policy.md"),
    path.join(".codex", "claude-interop.md"),
    path.join(".codex", "agents", "feature-developer.md"),
    path.join(".codex", "agents", "analyst.md"),
    path.join(".codex", "agents", "architect.md"),
    path.join(".codex", "agents", "code-simplifier.md"),
    path.join(".codex", "agents", "deep-reviewer.md"),
    path.join(".codex", "agents", "findings-arbiter.md"),
    path.join(".codex", "agents", "delivery-agent.md"),
    path.join(".codex", "agents", "qa-expert.md")
  ]);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "math-genius.md")), false);
});

function canonicalBody(content: string): string {
  const marker = "# Agent Flow Canonical Contract";
  const index = content.indexOf(marker);
  assert.notEqual(index, -1);
  return content.slice(index);
}
