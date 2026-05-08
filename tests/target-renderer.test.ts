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
    "AGENTS.md",
    path.join(".codex", "orchestration-policy.md"),
    path.join(".codex", "claude-interop.md")
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
});

test("renderTargetFiles honors disabled Claude or Codex feature flags", async () => {
  const config = createDefaultConfig("Codex Only");
  config.features.claude = false;
  const packs = composePacks(builtinPacks, []);

  const files = await renderTargetFiles(config, packs, { templateRoot });

  assert.deepEqual(files.map((file) => file.path), [
    "AGENTS.md",
    path.join(".codex", "orchestration-policy.md"),
    path.join(".codex", "claude-interop.md")
  ]);
});

function canonicalBody(content: string): string {
  const marker = "# Agent Flow Canonical Contract";
  const index = content.indexOf(marker);
  assert.notEqual(index, -1);
  return content.slice(index);
}
