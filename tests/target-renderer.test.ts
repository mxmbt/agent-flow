import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
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
  config.checks.focusedTestCommand = "npm test -- <test-file>";
  config.dev.start.url = "http://localhost:3000";
  config.discovery.codeGraphProvider = "code-review-graph";
  const packs = composePacks(builtinPacks, ["finance", "cloudflare-worker", "code-review-toolkit", "code-review-graph"]);

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
    path.join(".claude", "agents", "paranoid-architect.md"),
    path.join(".claude", "agents", "performance-expert.md"),
    path.join(".claude", "agents", "product-manager.md"),
    path.join(".claude", "agents", "ux-expert.md"),
    path.join(".claude", "agents", "math-genius.md"),
    path.join(".claude", "agents", "prt-code-reviewer.md"),
    path.join(".claude", "agents", "prt-code-simplifier.md"),
    path.join(".claude", "agents", "prt-comment-analyzer.md"),
    path.join(".claude", "agents", "prt-pr-test-analyzer.md"),
    path.join(".claude", "agents", "prt-silent-failure-hunter.md"),
    path.join(".claude", "agents", "prt-type-design-analyzer.md"),
    path.join(".claude", "agents", "delivery-agent.md"),
    path.join(".claude", "agents", "qa-expert.md"),
    path.join(".claude", "guides", "gan-protocol.md"),
    path.join(".claude", "guides", "systematic-debugging.md"),
    path.join(".claude", "guides", "test-driven-development.md"),
    path.join(".claude", "guides", "verification-before-completion.md"),
    path.join(".claude", "guides", "worktree-workflow.md"),
    path.join(".claude", "guides", "code-review-graph-usage.md"),
    "AGENTS.md",
    path.join(".codex", "orchestration-policy.md"),
    path.join(".codex", "claude-interop.md"),
    path.join(".codex", "agents", "feature-developer.md"),
    path.join(".codex", "agents", "analyst.md"),
    path.join(".codex", "agents", "architect.md"),
    path.join(".codex", "agents", "code-simplifier.md"),
    path.join(".codex", "agents", "deep-reviewer.md"),
    path.join(".codex", "agents", "findings-arbiter.md"),
    path.join(".codex", "agents", "paranoid-architect.md"),
    path.join(".codex", "agents", "performance-expert.md"),
    path.join(".codex", "agents", "product-manager.md"),
    path.join(".codex", "agents", "ux-expert.md"),
    path.join(".codex", "agents", "math-genius.md"),
    path.join(".codex", "agents", "prt-code-reviewer.md"),
    path.join(".codex", "agents", "prt-code-simplifier.md"),
    path.join(".codex", "agents", "prt-comment-analyzer.md"),
    path.join(".codex", "agents", "prt-pr-test-analyzer.md"),
    path.join(".codex", "agents", "prt-silent-failure-hunter.md"),
    path.join(".codex", "agents", "prt-type-design-analyzer.md"),
    path.join(".codex", "agents", "delivery-agent.md"),
    path.join(".codex", "agents", "qa-expert.md"),
    path.join(".codex", "guides", "gan-protocol.md"),
    path.join(".codex", "guides", "systematic-debugging.md"),
    path.join(".codex", "guides", "test-driven-development.md"),
    path.join(".codex", "guides", "verification-before-completion.md"),
    path.join(".codex", "guides", "worktree-workflow.md"),
    path.join(".codex", "guides", "code-review-graph-usage.md")
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
  assert.match(claudeDeepReviewer, /configured planning discovery provider: `code-review-graph pack`/);
  assert.match(codexDeepReviewer, /configured planning discovery provider: `code-review-graph pack`/);
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

  const claudeParanoidArchitect = byPath.get(path.join(".claude", "agents", "paranoid-architect.md"));
  const codexParanoidArchitect = byPath.get(path.join(".codex", "agents", "paranoid-architect.md"));
  assert.ok(claudeParanoidArchitect);
  assert.ok(codexParanoidArchitect);
  assert.deepEqual(parseManagedMetadata(claudeParanoidArchitect), {
    id: "claude-agent-paranoid-architect",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "paranoid-architect.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexParanoidArchitect), {
    id: "codex-agent-paranoid-architect",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "paranoid-architect.md.hbs")
  });
  assert.match(claudeParanoidArchitect, /configured planning discovery provider: `code-review-graph pack`/);
  assert.match(codexParanoidArchitect, /configured planning discovery provider: `code-review-graph pack`/);
  assert.match(codexParanoidArchitect, /worker bindings\n- D1 migrations\n- R2 buckets\n- KV namespaces/);
  assert.doesNotMatch(codexParanoidArchitect, /Worker endpoint exposure|Telegram\/webhook/);

  const claudePerformanceExpert = byPath.get(path.join(".claude", "agents", "performance-expert.md"));
  const codexPerformanceExpert = byPath.get(path.join(".codex", "agents", "performance-expert.md"));
  assert.ok(claudePerformanceExpert);
  assert.ok(codexPerformanceExpert);
  assert.deepEqual(parseManagedMetadata(claudePerformanceExpert), {
    id: "claude-agent-performance-expert",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "performance-expert.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexPerformanceExpert), {
    id: "codex-agent-performance-expert",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "performance-expert.md.hbs")
  });
  assert.match(claudePerformanceExpert, /configured planning discovery provider: `code-review-graph pack`/);
  assert.match(codexPerformanceExpert, /configured planning discovery provider: `code-review-graph pack`/);
  assert.match(codexPerformanceExpert, /configured runtime and pack-contributed performance constraints/);
  assert.doesNotMatch(codexPerformanceExpert, /Cloudflare Worker execution limits|R2 asset fetch/);

  const claudeProductManager = byPath.get(path.join(".claude", "agents", "product-manager.md"));
  const codexProductManager = byPath.get(path.join(".codex", "agents", "product-manager.md"));
  assert.ok(claudeProductManager);
  assert.ok(codexProductManager);
  assert.deepEqual(parseManagedMetadata(claudeProductManager), {
    id: "claude-agent-product-manager",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "product-manager.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexProductManager), {
    id: "codex-agent-product-manager",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "product-manager.md.hbs")
  });
  assert.match(codexProductManager, /`PROJECT_STATUS\.md`/);
  assert.match(codexProductManager, /`docs\/PRODUCT\.md`/);
  assert.match(codexProductManager, /`docs\/ROADMAP\.md`/);
  assert.match(codexProductManager, /`docs\/ARCHITECTURE\.md`/);
  assert.match(codexProductManager, /`docs\/tasks\.md`/);
  assert.match(codexProductManager, /`docs\/phases\/phase-<phase-token>\/tasks\.md`/);
  assert.doesNotMatch(codexProductManager, /PROGRESS\.md/);

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

  const claudePrtCodeReviewer = byPath.get(path.join(".claude", "agents", "prt-code-reviewer.md"));
  const codexPrtCodeReviewer = byPath.get(path.join(".codex", "agents", "prt-code-reviewer.md"));
  assert.ok(claudePrtCodeReviewer);
  assert.ok(codexPrtCodeReviewer);
  assert.deepEqual(parseManagedMetadata(claudePrtCodeReviewer), {
    id: "claude-agent-prt-code-reviewer",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "prt-code-reviewer.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexPrtCodeReviewer), {
    id: "codex-agent-prt-code-reviewer",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "prt-code-reviewer.md.hbs")
  });
  assert.match(claudePrtCodeReviewer, /CLAUDE\.md or equivalent root instructions/);
  assert.match(codexPrtCodeReviewer, /AGENTS\.md or equivalent root instructions/);
  assert.match(codexPrtCodeReviewer, /root agent instructions/);
  assert.doesNotMatch(codexPrtCodeReviewer, /explicit AGENTS\.md violation/);

  const claudePrtCodeSimplifier = byPath.get(path.join(".claude", "agents", "prt-code-simplifier.md"));
  const codexPrtCodeSimplifier = byPath.get(path.join(".codex", "agents", "prt-code-simplifier.md"));
  assert.ok(claudePrtCodeSimplifier);
  assert.ok(codexPrtCodeSimplifier);
  assert.deepEqual(parseManagedMetadata(claudePrtCodeSimplifier), {
    id: "claude-agent-prt-code-simplifier",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "prt-code-simplifier.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexPrtCodeSimplifier), {
    id: "codex-agent-prt-code-simplifier",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "prt-code-simplifier.md.hbs")
  });
  assert.match(codexPrtCodeSimplifier, /language\/framework docs, and installed packs/);
  assert.doesNotMatch(codexPrtCodeSimplifier, /React component patterns|ES modules/);

  const claudePrtCommentAnalyzer = byPath.get(path.join(".claude", "agents", "prt-comment-analyzer.md"));
  const codexPrtCommentAnalyzer = byPath.get(path.join(".codex", "agents", "prt-comment-analyzer.md"));
  assert.ok(claudePrtCommentAnalyzer);
  assert.ok(codexPrtCommentAnalyzer);
  assert.deepEqual(parseManagedMetadata(claudePrtCommentAnalyzer), {
    id: "claude-agent-prt-comment-analyzer",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "prt-comment-analyzer.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexPrtCommentAnalyzer), {
    id: "codex-agent-prt-comment-analyzer",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "prt-comment-analyzer.md.hbs")
  });
  assert.match(codexPrtCommentAnalyzer, /comment rot/);
  assert.doesNotMatch(codexPrtCommentAnalyzer, /pull request|Daisy/);

  const claudePrtPrTestAnalyzer = byPath.get(path.join(".claude", "agents", "prt-pr-test-analyzer.md"));
  const codexPrtPrTestAnalyzer = byPath.get(path.join(".codex", "agents", "prt-pr-test-analyzer.md"));
  assert.ok(claudePrtPrTestAnalyzer);
  assert.ok(codexPrtPrTestAnalyzer);
  assert.deepEqual(parseManagedMetadata(claudePrtPrTestAnalyzer), {
    id: "claude-agent-prt-pr-test-analyzer",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "prt-pr-test-analyzer.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexPrtPrTestAnalyzer), {
    id: "codex-agent-prt-pr-test-analyzer",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "prt-pr-test-analyzer.md.hbs")
  });
  assert.match(codexPrtPrTestAnalyzer, /change-set review/);
  assert.match(codexPrtPrTestAnalyzer, /root agent instructions/);
  assert.doesNotMatch(codexPrtPrTestAnalyzer, /CLAUDE\.md|AGENTS\.md|Daisy|pull request/);

  const claudePrtSilentFailureHunter = byPath.get(path.join(".claude", "agents", "prt-silent-failure-hunter.md"));
  const codexPrtSilentFailureHunter = byPath.get(path.join(".codex", "agents", "prt-silent-failure-hunter.md"));
  assert.ok(claudePrtSilentFailureHunter);
  assert.ok(codexPrtSilentFailureHunter);
  assert.deepEqual(parseManagedMetadata(claudePrtSilentFailureHunter), {
    id: "claude-agent-prt-silent-failure-hunter",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "prt-silent-failure-hunter.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexPrtSilentFailureHunter), {
    id: "codex-agent-prt-silent-failure-hunter",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "prt-silent-failure-hunter.md.hbs")
  });
  assert.match(codexPrtSilentFailureHunter, /root agent instructions/);
  assert.match(codexPrtSilentFailureHunter, /project-standard error identifier/);
  assert.doesNotMatch(codexPrtSilentFailureHunter, /CLAUDE\.md|AGENTS\.md|Sentry|constants\/errorIds\.ts|pull request|Daisy/);

  const claudePrtTypeDesignAnalyzer = byPath.get(path.join(".claude", "agents", "prt-type-design-analyzer.md"));
  const codexPrtTypeDesignAnalyzer = byPath.get(path.join(".codex", "agents", "prt-type-design-analyzer.md"));
  assert.ok(claudePrtTypeDesignAnalyzer);
  assert.ok(codexPrtTypeDesignAnalyzer);
  assert.deepEqual(parseManagedMetadata(claudePrtTypeDesignAnalyzer), {
    id: "claude-agent-prt-type-design-analyzer",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "prt-type-design-analyzer.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexPrtTypeDesignAnalyzer), {
    id: "codex-agent-prt-type-design-analyzer",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "prt-type-design-analyzer.md.hbs")
  });
  assert.match(codexPrtTypeDesignAnalyzer, /language-native guarantees/);
  assert.doesNotMatch(codexPrtTypeDesignAnalyzer, /compile-time|pull request|Daisy|business requirements/);

  const claudeUxExpert = byPath.get(path.join(".claude", "agents", "ux-expert.md"));
  const codexUxExpert = byPath.get(path.join(".codex", "agents", "ux-expert.md"));
  assert.ok(claudeUxExpert);
  assert.ok(codexUxExpert);
  assert.deepEqual(parseManagedMetadata(claudeUxExpert), {
    id: "claude-agent-ux-expert",
    version: 7,
    source: path.join("templates", "targets", "claude", "agents", "ux-expert.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexUxExpert), {
    id: "codex-agent-ux-expert",
    version: 7,
    source: path.join("templates", "targets", "codex", "agents", "ux-expert.md.hbs")
  });
  assert.match(claudeUxExpert, /`\.claude\/skills\/design-audit\/SKILL\.md`/);
  assert.match(codexUxExpert, /`\.codex\/skills\/design-audit\/SKILL\.md`/);
  assert.match(codexUxExpert, /`docs\/UI-UX-SPECIFICATION\.md`/);
  assert.match(codexUxExpert, /Preferred path:/);
  assert.doesNotMatch(codexUxExpert, /Preferred path in FinAI:/);

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
  assert.match(codexQaAgent, /http:\/\/localhost:3000/);
  assert.match(codexQaAgent, /`docs\/testing\/QA-SHARED-ACCOUNT\.md`/);
  assert.match(codexQaAgent, /`docs\/design\/DESIGN-SYSTEM\.md`, `docs\/design\/UX-WRITING-GUIDE\.md`/);

  const claudeGanGuide = byPath.get(path.join(".claude", "guides", "gan-protocol.md"));
  const codexGanGuide = byPath.get(path.join(".codex", "guides", "gan-protocol.md"));
  assert.ok(claudeGanGuide);
  assert.ok(codexGanGuide);
  assert.deepEqual(parseManagedMetadata(claudeGanGuide), {
    id: "claude-guide-gan-protocol",
    version: 7,
    source: path.join("templates", "targets", "claude", "guides", "gan-protocol.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexGanGuide), {
    id: "codex-guide-gan-protocol",
    version: 7,
    source: path.join("templates", "targets", "codex", "guides", "gan-protocol.md.hbs")
  });
  assert.equal(stripManagedHeader(claudeGanGuide), stripManagedHeader(codexGanGuide));

  const claudeDebuggingGuide = byPath.get(path.join(".claude", "guides", "systematic-debugging.md"));
  const codexDebuggingGuide = byPath.get(path.join(".codex", "guides", "systematic-debugging.md"));
  assert.ok(claudeDebuggingGuide);
  assert.ok(codexDebuggingGuide);
  assert.deepEqual(parseManagedMetadata(claudeDebuggingGuide), {
    id: "claude-guide-systematic-debugging",
    version: 7,
    source: path.join("templates", "targets", "claude", "guides", "systematic-debugging.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexDebuggingGuide), {
    id: "codex-guide-systematic-debugging",
    version: 7,
    source: path.join("templates", "targets", "codex", "guides", "systematic-debugging.md.hbs")
  });
  assert.match(claudeDebuggingGuide, /`\.claude\/guides\/test-driven-development\.md`/);
  assert.match(codexDebuggingGuide, /`\.codex\/guides\/test-driven-development\.md`/);

  const claudeTddGuide = byPath.get(path.join(".claude", "guides", "test-driven-development.md"));
  const codexTddGuide = byPath.get(path.join(".codex", "guides", "test-driven-development.md"));
  assert.ok(claudeTddGuide);
  assert.ok(codexTddGuide);
  assert.deepEqual(parseManagedMetadata(claudeTddGuide), {
    id: "claude-guide-test-driven-development",
    version: 7,
    source: path.join("templates", "targets", "claude", "guides", "test-driven-development.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexTddGuide), {
    id: "codex-guide-test-driven-development",
    version: 7,
    source: path.join("templates", "targets", "codex", "guides", "test-driven-development.md.hbs")
  });
  assert.match(codexTddGuide, /Run: `npm test -- <test-file>`/);
  assert.equal(stripManagedHeader(claudeTddGuide), stripManagedHeader(codexTddGuide));

  const claudeVerificationGuide = byPath.get(path.join(".claude", "guides", "verification-before-completion.md"));
  const codexVerificationGuide = byPath.get(path.join(".codex", "guides", "verification-before-completion.md"));
  assert.ok(claudeVerificationGuide);
  assert.ok(codexVerificationGuide);
  assert.deepEqual(parseManagedMetadata(claudeVerificationGuide), {
    id: "claude-guide-verification-before-completion",
    version: 7,
    source: path.join("templates", "targets", "claude", "guides", "verification-before-completion.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexVerificationGuide), {
    id: "codex-guide-verification-before-completion",
    version: 7,
    source: path.join("templates", "targets", "codex", "guides", "verification-before-completion.md.hbs")
  });
  assert.match(codexVerificationGuide, /For code changes in the active project/);
  assert.equal(stripManagedHeader(claudeVerificationGuide), stripManagedHeader(codexVerificationGuide));

  const claudeWorktreeGuide = byPath.get(path.join(".claude", "guides", "worktree-workflow.md"));
  const codexWorktreeGuide = byPath.get(path.join(".codex", "guides", "worktree-workflow.md"));
  assert.ok(claudeWorktreeGuide);
  assert.ok(codexWorktreeGuide);
  assert.deepEqual(parseManagedMetadata(claudeWorktreeGuide), {
    id: "claude-guide-worktree-workflow",
    version: 7,
    source: path.join("templates", "targets", "claude", "guides", "worktree-workflow.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexWorktreeGuide), {
    id: "codex-guide-worktree-workflow",
    version: 7,
    source: path.join("templates", "targets", "codex", "guides", "worktree-workflow.md.hbs")
  });
  assert.match(codexWorktreeGuide, /gh pr create --base main --title/);
  assert.equal(stripManagedHeader(claudeWorktreeGuide), stripManagedHeader(codexWorktreeGuide));

  const claudeCodeReviewGraphGuide = byPath.get(path.join(".claude", "guides", "code-review-graph-usage.md"));
  const codexCodeReviewGraphGuide = byPath.get(path.join(".codex", "guides", "code-review-graph-usage.md"));
  assert.ok(claudeCodeReviewGraphGuide);
  assert.ok(codexCodeReviewGraphGuide);
  assert.deepEqual(parseManagedMetadata(claudeCodeReviewGraphGuide), {
    id: "claude-guide-code-review-graph-usage",
    version: 7,
    source: path.join("templates", "targets", "claude", "guides", "code-review-graph-usage.md.hbs")
  });
  assert.deepEqual(parseManagedMetadata(codexCodeReviewGraphGuide), {
    id: "codex-guide-code-review-graph-usage",
    version: 7,
    source: path.join("templates", "targets", "codex", "guides", "code-review-graph-usage.md.hbs")
  });
  assert.match(claudeCodeReviewGraphGuide, /Edit \/ Write \(Claude Code\)/);
  assert.match(claudeCodeReviewGraphGuide, /`\.claude\/settings\.json`/);
  assert.match(codexCodeReviewGraphGuide, /Edit \/ Write \(Codex\)/);
  assert.match(codexCodeReviewGraphGuide, /`\.codex\/settings\.json`/);
});

test("renderTargetFiles renders design pack guide and UI/UX skill assets", async () => {
  const config = createDefaultConfig("Design Fixture");
  const packs = composePacks(builtinPacks, ["design"]);

  const files = await renderTargetFiles(config, packs, { templateRoot, version: 9 });
  const byPath = new Map(files.map((file) => [file.path, file.content]));
  const designAssetPaths = [...byPath.keys()].filter((filePath) => filePath.includes(`${path.sep}skills${path.sep}`));

  assert.equal(designAssetPaths.length, 154);
  assert.ok(byPath.has(path.join(".claude", "guides", "ui-ux-pro-max-reference.md")));
  assert.ok(byPath.has(path.join(".codex", "guides", "ui-ux-pro-max-reference.md")));
  assert.ok(byPath.has(path.join(".claude", "skills", "ui-ux-pro-max", "SKILL.md")));
  assert.ok(byPath.has(path.join(".codex", "skills", "ui-ux-pro-max", "SKILL.md")));
  assert.ok(byPath.has(path.join(".claude", "skills", "ui-styling-uupm", "references", "shadcn-components.md")));
  assert.ok(byPath.has(path.join(".codex", "skills", "design-system-uupm", "scripts", "generate-tokens.cjs")));

  const codexGuide = byPath.get(path.join(".codex", "guides", "ui-ux-pro-max-reference.md"));
  assert.ok(codexGuide);
  assert.match(codexGuide, /python3 \.codex\/skills\/ui-ux-pro-max\/scripts\/search\.py/);
  assert.match(codexGuide, /`docs\/design\/DESIGN-SYSTEM\.md`/);

  const claudeSkill = byPath.get(path.join(".claude", "skills", "ui-ux-pro-max", "SKILL.md"));
  const codexDesignSystemSkill = byPath.get(path.join(".codex", "skills", "design-system-uupm", "SKILL.md"));
  assert.ok(claudeSkill);
  assert.ok(codexDesignSystemSkill);
  assert.match(claudeSkill, /^---\nprovenance_class: adapted_vendor/m);
  assert.deepEqual(parseManagedMetadata(claudeSkill), {
    id: "claude-skill-ui-ux-pro-max-SKILL.md",
    version: 9,
    source: path.join("templates", "static", "skills", "ui-ux-pro-max", "SKILL.md")
  });
  assert.match(codexDesignSystemSkill, /node \.codex\/skills\/design-system-uupm\/scripts\/generate-tokens\.cjs/);

  const csv = byPath.get(path.join(".claude", "skills", "ui-ux-pro-max", "data", "colors.csv"));
  assert.ok(csv);
  assert.match(csv, /^# @agent-flow managed /);
  assert.match(csv, /\nNo,Product Type,Primary/);

  const python = byPath.get(path.join(".claude", "skills", "ui-ux-pro-max", "scripts", "core.py"));
  assert.ok(python);
  assert.match(python, /^#!\/usr\/bin\/env python3\n# -\*- coding: utf-8 -\*-\n# @agent-flow managed /);
  assert.match(python, /line for line in f if not line\.startswith\("# @agent-flow managed "\)/);
});

test("design pack static skill assets do not contain dangling local references", async () => {
  const skillRoots = [
    path.join(templateRoot, "static", "skills", "ui-ux-pro-max"),
    path.join(templateRoot, "static", "skills", "ui-styling-uupm"),
    path.join(templateRoot, "static", "skills", "design-system-uupm")
  ];
  const files = (await Promise.all(skillRoots.map((root) => listFiles(root)))).flat();
  const missing: string[] = [];

  for (const file of files.filter(isReferenceSource)) {
    const content = await readFile(file, "utf8");

    for (const reference of extractLocalReferences(content)) {
      const skillRoot = skillRoots.find((root) => file.startsWith(`${root}${path.sep}`));
      const nearbyCandidate = path.join(path.dirname(file), reference);
      const rootCandidate = skillRoot ? path.join(skillRoot, reference) : nearbyCandidate;

      if (!existsSync(nearbyCandidate) && !existsSync(rootCandidate)) {
        missing.push(`${path.relative(templateRoot, file)} -> ${reference}`);
      }
    }
  }

  assert.deepEqual(missing, []);
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
    path.join(".codex", "agents", "paranoid-architect.md"),
    path.join(".codex", "agents", "performance-expert.md"),
    path.join(".codex", "agents", "product-manager.md"),
    path.join(".codex", "agents", "ux-expert.md"),
    path.join(".codex", "agents", "delivery-agent.md"),
    path.join(".codex", "agents", "qa-expert.md"),
    path.join(".codex", "guides", "gan-protocol.md"),
    path.join(".codex", "guides", "systematic-debugging.md"),
    path.join(".codex", "guides", "test-driven-development.md"),
    path.join(".codex", "guides", "verification-before-completion.md"),
    path.join(".codex", "guides", "worktree-workflow.md")
  ]);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "math-genius.md")), false);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "prt-code-reviewer.md")), false);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "prt-code-simplifier.md")), false);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "prt-comment-analyzer.md")), false);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "prt-pr-test-analyzer.md")), false);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "prt-silent-failure-hunter.md")), false);
  assert.equal(files.some((file) => file.path === path.join(".codex", "agents", "prt-type-design-analyzer.md")), false);
  assert.equal(files.some((file) => file.path === path.join(".codex", "guides", "code-review-graph-usage.md")), false);
});

async function listFiles(root: string): Promise<string[]> {
  const entries = await readdir(root, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath);
    }

    return entry.isFile() ? [entryPath] : [];
  }));

  return files.flat().sort();
}

function isReferenceSource(filePath: string): boolean {
  return /\.(md|txt|py|cjs|js|json)$/.test(filePath) || path.basename(filePath) === "SKILL.md";
}

function extractLocalReferences(content: string): string[] {
  const references: string[] = [];
  const pattern = /[`"']((?:references|data|scripts|templates)\/[A-Za-z0-9_./-]+)[`"']/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    references.push(match[1].replace(/[),.;:]+$/, ""));
  }

  return references;
}

function canonicalBody(content: string): string {
  const marker = "# Agent Flow Canonical Contract";
  const index = content.indexOf(marker);
  assert.notEqual(index, -1);
  return content.slice(index);
}

function stripManagedHeader(content: string): string {
  return content.replace(/^<!-- @agent-flow managed[^\n]* -->\n+/, "");
}
