import assert from "node:assert/strict";
import test from "node:test";
import { compareMigrationTexts, normalizeMigrationText } from "../src/validation/migration-similarity.js";

test("normalizeMigrationText ignores frontmatter, generated notices, and tool root differences", () => {
  const source = [
    "---",
    "name: feature-developer",
    "---",
    "",
    "<!-- @generated from claude:agents/feature-developer.md. Run `npm run agents:sync`. -->",
    "",
    "- `.claude/guides/test-driven-development.md`"
  ].join("\n");

  const target = [
    "---",
    "name: feature-developer",
    "model: sonnet",
    "---",
    "",
    "- `.codex/guides/test-driven-development.md`"
  ].join("\n");

  assert.equal(
    normalizeMigrationText(source),
    "- `.agent-tool/guides/test-driven-development.md`"
  );
  assert.equal(normalizeMigrationText(source), normalizeMigrationText(target));
});

test("compareMigrationTexts passes near-identical migrations", () => {
  const result = compareMigrationTexts(
    "near-identical",
    "# Agent\n\n- keep the contract\n- run tests\n",
    "# Agent\n\n- keep the contract\n- run tests\n",
    { threshold: 0.99 }
  );

  assert.equal(result.passed, true);
  assert.equal(result.meetsTarget, true);
  assert.equal(result.similarity, 1);
});

test("compareMigrationTexts fails and reports directional differences", () => {
  const result = compareMigrationTexts(
    "changed",
    "# Agent\n\n- preserve original instruction\n- run tests\n",
    "# Agent\n\n- generalized replacement\n- run tests\n",
    { threshold: 0.99 }
  );

  assert.equal(result.passed, false);
  assert.equal(result.meetsTarget, false);
  assert.ok(result.similarity < 0.99);
  assert.deepEqual(result.missingLines, ["- preserve original instruction"]);
  assert.deepEqual(result.addedLines, ["- generalized replacement"]);
});

test("compareMigrationTexts can pass a minimum while reporting a missed aspirational target", () => {
  const result = compareMigrationTexts(
    "universalized",
    "# Agent\n\n- source-specific detail\n- shared instruction\n",
    "# Agent\n\n- configurable detail\n- shared instruction\n",
    { threshold: 0.65, targetSimilarity: 0.99 }
  );

  assert.equal(result.passed, true);
  assert.equal(result.meetsTarget, false);
  assert.equal(result.threshold, 0.65);
  assert.equal(result.targetSimilarity, 0.99);
});
