import assert from "node:assert/strict";
import test from "node:test";
import { scanUniversality } from "../src/validation/universality-scan.js";

test("scanUniversality flags project, runtime, command, and domain assumptions", () => {
  const findings = scanUniversality("template.md", [
    "FinAI task research pack",
    "{{checks.default}}",
    "cd cf && npm test",
    "`cf/wrangler.toml`",
    "gh api repos/id-bu/AI_Finance_Manager/git/refs/heads/<branch> -X DELETE",
    "release-sync delivery -> `git diff --name-only origin/master...origin/develop`",
    "get_review_context base=\"master\"",
    "Update PROGRESS.md",
    "`docs/design/DESIGN-SYSTEM.md`",
    "financial correctness and no-look-ahead",
    "precise arithmetic where financial values matter",
    "user isolation"
  ].join("\n"));

  assert.deepEqual(findings.map((finding) => finding.ruleId), [
    "project-brand-literal",
    "hardcoded-app-root",
    "hardcoded-npm-command",
    "hardcoded-app-root",
    "cloudflare-worker-runtime",
    "hardcoded-github-repo",
    "hardcoded-branch-flow",
    "hardcoded-branch-flow",
    "hardcoded-status-artifact",
    "domain-invariant-literal",
    "domain-invariant-literal"
  ]);
});

test("scanUniversality allows core planning and design artifact terms", () => {
  const findings = scanUniversality("template.md", [
    "Read the task research pack.",
    "Update the Design Document.",
    "Reference DDREF:ui.layout.",
    "Write the ADD and ADR."
  ].join("\n"));

  assert.equal(findings.length, 0);
});

test("scanUniversality flags source-specific FinAI wording", () => {
  const findings = scanUniversality("template.md", "Preferred path in FinAI:");

  assert.deepEqual(findings.map((finding) => finding.ruleId), [
    "project-brand-literal",
    "source-specific-wording"
  ]);
});

test("scanUniversality allows Agent Flow skill and guide cross-links", () => {
  const findings = scanUniversality("template.md", [
    ".claude/guides/test-driven-development.md",
    ".claude/skills/shadcn-ui/SKILL.md",
    ".codex/skills/rag-implementation/SKILL.md"
  ].join("\n"));

  assert.equal(findings.length, 0);
});

test("scanUniversality allows documented exceptions", () => {
  const findings = scanUniversality(
    "template.md",
    "FinAI source fixture",
    [{ file: "template.md", ruleId: "project-brand-literal", reason: "source fixture name" }]
  );

  assert.equal(findings.length, 0);
});
