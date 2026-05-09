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
    path.join(".claude", "agents", "delivery-agent.md"),
    path.join(".claude", "agents", "qa-expert.md"),
    "AGENTS.md",
    path.join(".codex", "orchestration-policy.md"),
    path.join(".codex", "claude-interop.md"),
    path.join(".codex", "agents", "feature-developer.md"),
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
    path.join(".codex", "agents", "delivery-agent.md"),
    path.join(".codex", "agents", "qa-expert.md")
  ]);
});

function canonicalBody(content: string): string {
  const marker = "# Agent Flow Canonical Contract";
  const index = content.indexOf(marker);
  assert.notEqual(index, -1);
  return content.slice(index);
}
