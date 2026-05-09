export interface MigrationSimilarityPair {
  id: string;
  source: string;
  target: string;
  threshold?: number;
  targetSimilarity?: number;
}

export interface MigrationSimilarityResult {
  id: string;
  sourceLineCount: number;
  targetLineCount: number;
  lineSimilarity: number;
  tokenSimilarity: number;
  similarity: number;
  missingLines: string[];
  addedLines: string[];
  passed: boolean;
  threshold: number;
  targetSimilarity: number;
  meetsTarget: boolean;
}

export interface TextSimilarityOptions {
  threshold: number;
  targetSimilarity?: number;
  maxDiffLines?: number;
}

interface DiffLine {
  kind: "same" | "missing" | "added";
  value: string;
}

const DEFAULT_MAX_DIFF_LINES = 12;
const MAX_EXACT_LCS_CELLS = 1_000_000;

export function compareMigrationTexts(
  id: string,
  source: string,
  target: string,
  options: TextSimilarityOptions
): MigrationSimilarityResult {
  const maxDiffLines = options.maxDiffLines ?? DEFAULT_MAX_DIFF_LINES;
  const sourceLines = normalizeMigrationText(source).split("\n").filter((line) => line.length > 0);
  const targetLines = normalizeMigrationText(target).split("\n").filter((line) => line.length > 0);
  const sourceTokens = tokenize(sourceLines.join("\n"));
  const targetTokens = tokenize(targetLines.join("\n"));
  const targetSimilarity = options.targetSimilarity ?? options.threshold;
  const lineSimilarity = sequenceSimilarity(sourceLines, targetLines);
  const tokenSimilarity = sequenceSimilarity(sourceTokens, targetTokens);
  const similarity = Math.min(lineSimilarity, tokenSimilarity);
  const diff = lineDiff(sourceLines, targetLines);

  return {
    id,
    sourceLineCount: sourceLines.length,
    targetLineCount: targetLines.length,
    lineSimilarity,
    tokenSimilarity,
    similarity,
    missingLines: diff
      .filter((line) => line.kind === "missing")
      .slice(0, maxDiffLines)
      .map((line) => line.value),
    addedLines: diff
      .filter((line) => line.kind === "added")
      .slice(0, maxDiffLines)
      .map((line) => line.value),
    passed: similarity >= options.threshold,
    threshold: options.threshold,
    targetSimilarity,
    meetsTarget: similarity >= targetSimilarity
  };
}

export function normalizeMigrationText(value: string): string {
  const lines = value
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

  let body = stripFrontmatter(lines);
  body = body.filter((line) => !isGeneratedNotice(line) && !isTemplateComment(line));

  return normalizeAllowedMigrationText(body
    .map((line) => line.trimEnd())
    .map(normalizeAllowedMigrationDifferences)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n"))
    .trim();
}

export function formatSimilarityResult(result: MigrationSimilarityResult, source: string, target: string): string {
  const status = result.passed ? "PASS" : "FAIL";
  const lines = [
    `[${status}] ${result.id}: ${(result.similarity * 100).toFixed(2)}% similarity, minimum ${(result.threshold * 100).toFixed(2)}%, target ${(result.targetSimilarity * 100).toFixed(2)}%`,
    `  source: ${source}`,
    `  target: ${target}`,
    `  line similarity: ${(result.lineSimilarity * 100).toFixed(2)}% (${result.sourceLineCount} source lines, ${result.targetLineCount} target lines)`,
    `  token similarity: ${(result.tokenSimilarity * 100).toFixed(2)}%`
  ];

  if (result.passed && !result.meetsTarget) {
    lines.push("  note: below target; migration must document why universalization changed the source wording.");
  }

  if (!result.passed || !result.meetsTarget) {
    lines.push("  missing from target:");
    lines.push(...formatDiffExamples("-", result.missingLines));
    lines.push("  added in target:");
    lines.push(...formatDiffExamples("+", result.addedLines));
  }

  return lines.join("\n");
}

function stripFrontmatter(lines: string[]): string[] {
  if (lines[0]?.trim() !== "---") {
    return lines;
  }

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === "---");
  if (end === -1) {
    return lines;
  }

  return lines.slice(end + 1);
}

function isGeneratedNotice(line: string): boolean {
  const trimmed = line.trim();
  return /^<!--\s*@generated\b/.test(trimmed)
    || /^<!--\s*@agent-flow managed\b/.test(trimmed)
    || /^#\s*@agent-flow managed\b/.test(trimmed)
    || /^\/\/\s*@agent-flow managed\b/.test(trimmed);
}

function isTemplateComment(line: string): boolean {
  return /^\s*\{\{!/.test(line);
}

function normalizeAllowedMigrationDifferences(line: string): string {
  return line
    .replaceAll(".claude/", ".agent-tool/")
    .replaceAll(".codex/", ".agent-tool/")
    .replaceAll("{{target.guideRoot}}/", ".agent-tool/guides/")
    .replaceAll("{{target.skillRoot}}/", ".agent-tool/skills/")
    .replaceAll("{{target.toolRoot}}/", ".agent-tool/")
    .replaceAll("{{target.toolRoot}}", ".claude")
    .replaceAll("{{target.homeRoot}}", "~/.claude")
    .replaceAll("{{target.agentName}}", "Claude Code")
    .replaceAll("{{project.taskPrefix}}", "FINAI")
    .replaceAll("Claude Code <noreply@example.invalid>", "Claude <noreply@anthropic.com>")
    .replaceAll("{{lifecycle.sequence}}", "PLAN → [ARCHITECTURE] → IMPLEMENTATION → SIMPLIFY → REVIEW → QUALITY_GATE → QA → DELIVERY")
    .replaceAll("{{artifacts.phaseRoot}}", "docs/phases")
    .replaceAll("{{artifacts.architectureFile}}", "docs/ARCHITECTURE.md")
    .replaceAll("{{artifacts.userIsolationArchitectureFile}}", "ARCHITECTURE_MULTI_USER.md")
    .replaceAll("{{artifacts.statusFile}}", "PROGRESS.md")
    .replaceAll("{{artifacts.productFile}}", "docs/PRODUCT.md")
    .replaceAll("{{artifacts.roadmapFile}}", "docs/ROADMAP.md")
    .replaceAll("{{artifacts.backlogFile}}", "docs/tasks.md")
    .replaceAll("{{artifacts.uiUxSpecificationFile}}", "docs/UI-UX-SPECIFICATION.md")
    .replaceAll("{{artifacts.designSystemFile}}", "docs/design/DESIGN-SYSTEM.md")
    .replaceAll("{{artifacts.uxWritingGuideFile}}", "docs/design/UX-WRITING-GUIDE.md")
    .replaceAll("{{artifacts.qaSharedAccountFile}}", "docs/testing/QA-SHARED-ACCOUNT.md")
    .replaceAll("{{runtime.appRoot}}", "cf")
    .replaceAll("{{runtime.migrationsGlob}}", "cf/migrations/**")
    .replaceAll("{{runtime.bindingConfigFile}}", "cf/wrangler.toml")
    .replaceAll("{{runtime.routeEntrypoint}}", "cf/src/index.ts")
    .replaceAll("{{quality.invariantSummary}}", "financial correctness, user isolation, UTC handling, and no-look-ahead")
    .replaceAll("{{quality.experts}}", "- `paranoid-architect`\n- `math-genius`\n- `performance-expert`\n- `ux-expert`")
    .replaceAll("{{quality.domainExpert}}", "math-genius")
    .replaceAll("the repo-local design document template", "docs/templates/design-document-template.md")
    .replaceAll("the repo-local state template", "docs/templates/state-template.json")
    .replaceAll("the repo-local walkthrough template", "docs/templates/walkthrough-template.md")
    .replaceAll("## Project Guardrails", "## FinAI-Specific Guardrails")
    .replaceAll("Configured guardrails remain in force:", "FinAI guardrails remain in force:")
    .replaceAll("Configured project checklist:", "FinAI-specific checklist:")
    .replaceAll("configured data-isolation and authorization boundaries", "`userId` scoping on all D1 access for user-owned data")
    .replaceAll("- data-isolation and authorization boundaries", "- `userId` scoping")
    .replaceAll("financial correctness invariants: financial correctness, user isolation, UTC handling, and no-look-ahead", "fixed-point or integer-safe financial math")
    .replaceAll("- configured runtime and pack-contributed constraints", "- Worker runtime constraints")
    .replaceAll("- domain correctness invariants from project config and installed packs: financial correctness, user isolation, UTC handling, and no-look-ahead", "- fixed-point or integer-safe financial math where relevant")
    .replaceAll("- runtime and pack-contributed constraints", "- Cloudflare Worker constraints")
    .replaceAll("Use the current shared state shape. Do not force legacy fields such as `lint`, `auditGate`, storage-specific checks, or framework-specific contracts into implementation state when the task does not use them.", "Use the current shared state shape. Do not force old ZNAI-only fields such as `lint`, `auditGate`, Prisma-specific checks, or tRPC/Zod-specific contracts into FinAI implementation state when the task does not use them.")
    .replaceAll("`DDREF:plan.review`", "`DDREF:codex.review`")
    .replaceAll("## Step 7: Plan Review Of The Draft Plan", "## Step 7: Codex Review Of The Draft Plan")
    .replaceAll("Use the configured reviewer invocation rule from the root agent instructions.", "Use the Codex invocation rule from `.agent-tool/CLAUDE.md`.")
    .replaceAll("configured domain-correctness concerns", "financial correctness concerns")
    .replaceAll("## Step 8: Request Plan Approval → User Approval → Resume After Approval", "## Step 8: EnterPlanMode → User Approval → ExitPlanMode")
    .replaceAll("Only after the draft passes internal plan review:", "Only after the draft is Codex-reviewed:")
    .replaceAll("1. Request plan approval", "1. `EnterPlanMode`")
    .replaceAll("4. Resume after approval", "4. `ExitPlanMode`")
    .replaceAll("Primary review", "Codex review")
    .replaceAll("primary-review", "Codex")
    .replaceAll("primaryReviewIssues", "codexIssues")
    .replaceAll("primaryReviewTriage", "codexTriage")
    .replaceAll("primaryReviewThreadId", "codexThreadId")
    .replaceAll("data isolation", "userId isolation")
    .replaceAll("data-isolation", "userId")
    .replaceAll("query/resource bounds", "D1 query bounds")
    .replaceAll("configured project rules", "FinAI-specific project rules")
    .replaceAll("every data access path touching scoped data MUST contain the configured authorization boundary", "every D1 query touching user-owned data MUST contain a userId filter")
    .replaceAll("Domain correctness: enforce configured invariants from project config and installed packs", "No look-ahead: historical projections must not use future data — violation = P0\n- Financial correctness: integer/fixed-point math for monetary values, no floating-point accumulation")
    .replaceAll("Runtime constraints: configured runtime and pack-contributed limits must be respected", "Cloudflare Worker constraints: no Node.js built-ins, CPU time budget respected")
    .replaceAll("No debug output left in released or user-visible code", "No console.log in production code")
    .replaceAll("Duplicate of configured static analysis/type checks", "Duplicate of linter/TypeScript")
    .replaceAll("covered by configured static checks", "covered by type-check")
    .replaceAll("style/static-check", "style/type-check")
    .replaceAll("missing userId boundary", "missing userId filter")
    .replaceAll("unique constraint as guard", "unique constraint in D1 as guard")
    .replaceAll("added userId boundary", "added userId filter")
    .replaceAll("Agent contract:", "Task tool:")
    .replaceAll("Configured project focus:", "FinAI-specific focus:")
    .replaceAll("- `userId` and authorization boundaries on scoped data", "- userId scoping on all D1 queries for user-owned data")
    .replaceAll("- `userId` scoping on scoped data", "- userId scoping on all D1 queries for user-owned data")
    .replaceAll("- temporal-leakage or causal-ordering constraints from project config and installed packs", "- No look-ahead in financial projections")
    .replaceAll("- financial correctness, user isolation, UTC handling, and no-look-ahead", "- Integer/fixed-point math for monetary values")
    .replaceAll("- Worker runtime and pack-contributed constraints", "- Cloudflare Worker runtime constraints")
    .replaceAll("  - Worker runtime constraints\"", "  - Cloudflare Worker runtime constraints\"")
    .replaceAll("domain-correctness defects", "financial-math defects")
    .replaceAll("description: \"PLAN phase: research → product review → brainstorming → tech review → devil's advocate → Design Document → configured plan review.\"", "description: \"PLAN phase: research → product review → brainstorming → tech review → devil's advocate → Design Document → Codex review.\"")
    .replaceAll("description: \"QUALITY_GATE phase: security, domain correctness, performance, and UX review → findings arbiter.\"", "description: \"QUALITY_GATE phase: security, financial correctness, performance, and UX review → findings arbiter.\"")
    .replaceAll("Run configured expert reviews in parallel, then route all findings through `findings-arbiter`.", "Run four expert reviews in parallel, then route all findings through `findings-arbiter`.")
    .replaceAll("- configured core experts:", "")
    .replaceAll("- configured domain expert when present: `math-genius`", "")
    .replaceAll("## Step 2: Experts In Parallel", "## Step 2: Four Experts In Parallel")
    .replaceAll("Call configured experts in parallel.", "Call all four experts in parallel.")
    .replaceAll("### configured domain expert", "### math-genius")
    .replaceAll("- domain-specific edge cases from installed packs", "- no look-ahead in projections or historical analysis")
    .replaceAll("- deterministic handling of rounding, aggregation, or boundary behavior where relevant", "- deterministic rounding behavior")
    .replaceAll("- correctness of derived calculations and summaries", "- aggregation correctness")
    .replaceAll("- query/resource counts and hot-path amplification", "- D1 query counts and hot-path amplification")
    .replaceAll("- configured runtime time-budget risks", "- Worker CPU/time-budget risks")
    .replaceAll("- user-facing clarity and brevity", "- Telegram-first clarity and brevity")
    .replaceAll("domain-correctness defects", "financial-math defects")
    .replaceAll("Non-negotiable `FIX NOW` cases:", "Non-negotiable `FIX NOW` cases in FinAI:")
    .replaceAll("- missing configured `userId` or authorization boundary on scoped data", "- missing `userId` isolation on user-owned D1 data")
    .replaceAll("- missing configured userId or authorization boundary on scoped data", "- missing `userId` isolation on user-owned D1 data")
    .replaceAll("- violation of configured domain correctness invariants", "- look-ahead in financial logic")
    .replaceAll("- violation of configured numeric precision or accumulation invariants", "- floating-point accumulation for canonical monetary logic")
    .replaceAll("- `domainExpert`", "- `mathGenius`")
    .replaceAll("Agent contract (general-purpose):", "Task tool (general-purpose):")
    .replaceAll("- `develop: merged`", "- `Develop: merged`")
    .replaceAll("`develop: merged`", "`Develop: merged`")
    .replaceAll("`master` is already released", "`Master` is already released")
    .replaceAll("configured runtime bindings in cf/wrangler.toml", "D1/R2/KV bindings in wrangler.toml")
    .replaceAll("(binding, storage, namespace, or trigger changes)", "(binding or `[[d1_databases]]` / `[[r2_buckets]]` / `[[kv_namespaces]]` / `[triggers]` changes)")
    .replaceAll("without matching configured secret-management documentation", "without a matching `wrangler secret put` doc")
    .replaceAll("agent prompt contracts or tier-1 prompt assembly", "`cf/src/agents/*/SOUL.md`, `cf/src/agents/*/RULES.md`, or tier-1 prompt assembly")
    .replaceAll("user-visible copy, status rendering, or notifier fan-out", "user-visible Telegram copy, `/pending` rendering, or notifier fan-out")
    .replaceAll("Prefix `Deploy <date> — <one-line summary>`", "Prefix `📢 FinAI deploy <date> — <one-line summary>`")
    .replaceAll("previous release tip", "previous master tip")
    .replaceAll("This is the rule that prevents stale-status drift: shipped tickets that don't carry SHIPPED markers confuse future sessions and reconciliation passes.", "This is the rule that prevents stale-status drift: shipped tickets that don't carry SHIPPED markers confuse future sessions and reconciliation passes (M3.5 T2/T5 went unmarked for ~5 days because their tracker PRs were missed, which caused a reconciliation session to report M3.5 as in-flight when it was fully released — see CLAUDE.md rule 16).")
    .replaceAll("## Numeric / Data Correctness", "## Financial / Data Correctness")
    .replaceAll("precise arithmetic where high-value numeric or regulated values matter", "precise arithmetic where financial values matter")
    .replaceAll("Strong-consistency transactions (ACID compliance)", "Financial transactions (ACID compliance)")
    .replaceAll("ACID compliance for business-critical transactions", "ACID compliance for financial transactions")
    .replaceAll("## Common Bug Classes", "## Common FinAI Bug Classes")
    .replaceAll("incorrect domain arithmetic or aggregation", "incorrect financial math or aggregation")
    .replaceAll("`.agent-tool/skills/frontend-design/SKILL.md`, `docs/design/DESIGN-SYSTEM.md`, `docs/design/UX-WRITING-GUIDE.md`, relevant design docs", "`.agent-tool/skills/frontend-design/SKILL.md`, `.agent-tool/skills/ux-copy-review/SKILL.md`, relevant design docs")
    .replaceAll("active Agent Flow lifecycle", "active FinAI lifecycle")
    .replaceAll("produce a concrete ADD or ADR in the configured repo-local architecture decision location", "produce a concrete ADD or ADR under `docs/ADRs/`")
    .replaceAll("Use the repo-local QA report template only if a fuller repo-local QA report is actually produced.", "Use `docs/templates/qa-report-template.md` only if a fuller repo-local QA report is actually produced.")
    .replaceAll("Milestone or phase-scoped work |", "Milestone or phase-scoped work (M4, fix, etc.) |")
    .replaceAll("Cross-phase fix/planned backlog (`FINAI-FIX-*`, `FINAI-PLAN-*`) |", "Cross-phase fix/planned backlog (FINAI-FIX-*, FINAI-PLAN-*) |")
    .replaceAll("<!-- or: # Cross-Phase Fix Now and Planned Work  for the configured backlog file -->", "<!-- or: # FinAI Fix Now and Planned Work  for docs/tasks.md -->")
    .replaceAll("#FINAI-x-t1", "#finai-x-t1")
    .replaceAll("#FINAI-x-t2", "#finai-x-t2")
    .replaceAll("{{checks.defaultShellBlock}}", "cd cf && npm test\ncd cf && npm run type-check")
    .replaceAll("<project-root>/src/", "cf/src/")
    .replaceAll("`webhook`, `auth`, `db`, `tools`, `agents`, `jobs`, `orchestrator`, `infra`, `docs`", "`webhook`, `auth`, `db`, `tools`, `agents`, `cron`, `orchestrator`, `market`, `media`, `infra`, `docs`")
    .replaceAll("docs(architecture): updated data flow for task context", "docs(architecture): updated data flow for M3 userId threading")
    .replaceAll("chore(deps): bumped runtime dependency", "chore(deps): bumped wrangler to latest")
    .replaceAll("For code changes in the active project:", "For code changes in the active Worker app:")
    .replaceAll("{{checks.focusedTestCommand}}", "npm test -- path/to/test.test.ts")
    .replaceAll("- [ ] All configured checks pass", "- [ ] All tests pass: `npm test`")
    .replaceAll("{{checks.changedSchemaInline}}", "`cd cf && npm run generate` and `cd cf && npm run migrate:local`")
    .replaceAll("{{checks.changedSchemaIndented}}", "  - `cd cf && npm run generate`\n  - `cd cf && npm run migrate:local`")
    .replaceAll('csv.DictReader(line for line in f if not line.startswith("# @agent-flow managed "))', "csv.DictReader(f)")
    .replaceAll('csv.DictReader(line for line in f if not line.startswith("# -flow managed "))', "csv.DictReader(f)")
    .replaceAll("{{dev.startCommand}}", "cd cf && npm run dev")
    .replaceAll("{{dev.startUrl}}", "http://localhost:8787")
    .replaceAll("Use the configured local runtime URL when the task needs a live service:", "Assume the local application should answer at:")
    .replaceAll("- configured planning discovery provider: `{{discovery.planningProviderSummary}}`", "- `.agent-tool/guides/code-review-graph-usage.md`")
    .replaceAll("## Discovery-First Analysis", "## Graph-First Analysis")
    .replaceAll("When structural impact is unclear, use the configured planning discovery provider before broad manual scanning:", "When structural impact is unclear, use code-review-graph before broad manual scanning:")
    .replaceAll("\n`{{discovery.planningProviderSummary}}`\n", "\n")
    .replaceAll("`{{discovery.planningProviderSummary}}`", "")
    .replaceAll("{{git.integrationBranch}}", "develop")
    .replaceAll("{{git.releaseBranch}}", "master")
    .replaceAll("{{git.integrationRef}}", "origin/develop")
    .replaceAll('base="origin/develop", include_source=true', 'base="master", include_source=true')
    .replaceAll("{{git.releaseRef}}", "origin/master")
    .replaceAll("{{git.remoteName}}", "origin")
    .replaceAll("{{git.defaultDeliveryDiffCommand}}", "git diff --name-only origin/develop...HEAD")
    .replaceAll("{{git.releaseSyncDiffCommand}}", "git diff --name-only origin/master...origin/develop")
    .replaceAll("{{git.releaseFlow}}", "develop -> master")
    .replaceAll("{{git.prBaseFlag}}", "--base develop")
    .replaceAll("{{git.remoteBranchDeleteCommand}}", "gh api repos/id-bu/AI_Finance_Manager/git/refs/heads/<branch> -X DELETE")
    .replaceAll("{{git.deliveryStateRef}}", "<merged-commit-or-origin/develop>")
    .replaceAll("{{git.worktreeParkCommand}}", "./scripts/park-worktrees.sh")
    .replaceAll("{{git.deliveryStateCommand}}", "./scripts/report-delivery-state.sh")
    .replaceAll("- `develop: merged`", "- `Develop: merged`")
    .replaceAll("`develop: merged`", "`Develop: merged`")
    .replaceAll("`master` is already released", "`Master` is already released")
    .replaceAll("## Step 8: Request Plan Approval", "## Step 8: EnterPlanMode")
    .replaceAll("Resume After Approval", "ExitPlanMode")
    .replaceAll("## Stage 1: Primary Review", "## Stage 1: Codex Review")
    .replaceAll("->", "→")
    .replaceAll("## Feature Delivery: Task → develop", "## Feature Delivery: Task → Develop")
    .replaceAll("## Release Sync: develop → master", "## Release Sync: Develop → Master")
    .replaceAll("- `develop:` merged / not merged, PR number, commit", "- `Develop:` merged / not merged, PR number, commit")
    .replaceAll("- `master:` released / not released, release PR number if any", "- `Master:` released / not released, release PR number if any")
    .replaceAll("Worktrees паркуются между задачами на своих ветках:", "Три worktree, каждый паркуется между задачами на своей ветке:")
    .replaceAll("| Main | `<main worktree>` | `develop` |", "| Main | `/Users/mburtikov/ai_finance_manager` | `develop` |")
    .replaceAll("| additional | `<additional worktree>` | `worktree/<dirname>` |", "| dar-es-salaam | `…/conductor/workspaces/ai_finance_manager/dar-es-salaam` | `worktree/dar-es-salaam` |\n| san-juan | `…/conductor/workspaces/ai_finance_manager/san-juan` | `worktree/san-juan` |")
    .replaceAll("Дополнительные worktrees", "Conductor worktrees")
    .replaceAll("remote, обновляет integration branch", "origin, обновляет develop")
    .replaceAll("feature/FINAI-<taskId>-short-desc", "feature/FINAI-<taskId>-short-desc")
    .replaceAll("git -C <main worktree>", "git -C /Users/mburtikov/ai_finance_manager")
    .replaceAll("`<merge-commit-or-origin/develop>`", "`<merge-commit-or-origin/develop>`")
    .replaceAll("| yes, GitHub мёрджит сам |", "| ✅ GitHub мёрджит сам |")
    .replaceAll("| rebase обязателен |", "| ⚠️ rebase обязателен |")
    .replaceAll("| только последовательно |", "| ❌ только последовательно |")
    .replaceAll("`{{artifacts.architectureFile}}`", "`docs/ARCHITECTURE.md`")
    .replaceAll("- user-isolation work -> `{{artifacts.userIsolationArchitectureFile}}`", "- `ARCHITECTURE_MULTI_USER.md` when user isolation or scheduling is involved")
    .replaceAll("- user-isolation work → `{{artifacts.userIsolationArchitectureFile}}`", "- `ARCHITECTURE_MULTI_USER.md` when user isolation or scheduling is involved")
    .replaceAll("- user-isolation work → `ARCHITECTURE_MULTI_USER.md`", "- `ARCHITECTURE_MULTI_USER.md` when user isolation or scheduling is involved")
    .replaceAll("- scheduling or asynchronous work -> `{{artifacts.schedulingArchitectureFile}}`\n", "")
    .replaceAll("- scheduling or asynchronous work -> `{{artifacts.schedulingArchitectureFile}}`", "")
    .replaceAll("- scheduling or asynchronous work → `{{artifacts.schedulingArchitectureFile}}`\n", "")
    .replaceAll("- scheduling or asynchronous work → `{{artifacts.schedulingArchitectureFile}}`", "")
    .replaceAll("- scheduling or asynchronous work -> `docs/ARCHITECTURE_SCHEDULING.md`\n", "")
    .replaceAll("When the task touches the active runtime, consider configured runtime and pack-contributed attack surfaces:", "When the task touches the active runtime, consider:")
    .replaceAll("When relevant, evaluate the current repository's configured runtime and pack-contributed performance constraints:", "When relevant, evaluate the current repository’s active runtime constraints:")
    .replaceAll("{{packs.deploymentImpactSurfaces}}", "- configured runtime and pack-contributed review surfaces")
    .replaceAll("- Worker endpoint exposure", "- configured runtime and pack-contributed review surfaces")
    .replaceAll("- D1 query boundaries", "")
    .replaceAll("- R2 path access and object naming safety", "")
    .replaceAll("- Telegram/webhook entrypoint validation", "")
    .replaceAll("- external callback authenticity and replay safety", "- webhook authenticity and replay safety")
    .replaceAll("## Project Context", "## Repo Context")
    .replaceAll("When the task touches the active runtime or delivery surface, consider configured runtime and pack-contributed attack surfaces:", "When the task touches the active runtime, consider:")
    .replaceAll("- Cloudflare Worker execution limits", "- configured runtime and pack-contributed review surfaces")
    .replaceAll("- D1 query behavior and migration implications", "")
    .replaceAll("- R2 asset fetch/generation costs", "")
    .replaceAll("- provider rate limits and retry behavior", "")
    .replaceAll("- keep runtime/resource constraints visible", "- keep serverless/runtime constraints visible")
    .replaceAll("- data access query count and shape", "- database query count and shape")
    .replaceAll("- unnecessary external provider or tool calls", "- unnecessary provider calls")
    .replaceAll("When relevant, evaluate the current project's configured runtime and pack-contributed performance constraints:", "When relevant, evaluate the current repository’s active runtime constraints:")
    .replaceAll("Use current project conventions under:", "Use current repo conventions under:")
    .replaceAll("- keep task status and backlog structure compatible with the configured backlog/task contract", "- keep task status and backlog structure compatible with the repo `tasks.md` contract")
    .replaceAll("- `RED` -> boundary, data model, access control, external dependency, or runtime/system architecture changes", "- `RED` -> boundary, schema, auth, provider, or runtime architecture changes")
    .replaceAll("- `RED` → boundary, data model, access control, external dependency, or runtime/system architecture changes", "- `RED` → boundary, schema, auth, provider, or runtime architecture changes")
    .replaceAll("- revise in product voice if needed — no task IDs, no internal phase slang, no internal implementation identifiers", "- revise in product voice if needed — no task IDs, no internal phase slang, no code identifiers")
    .replaceAll("project guidelines in the root agent instructions", "project guidelines in CLAUDE.md")
    .replaceAll("review the current change set or configured diff", "review unstaged changes from `git diff`")
    .replaceAll("the root agent instructions or equivalent", "CLAUDE.md or equivalent")
    .replaceAll("Minor nitpick not explicitly covered by project instructions", "Minor nitpick not explicitly in CLAUDE.md")
    .replaceAll("Critical bug or explicit project instruction violation", "Critical bug or explicit CLAUDE.md violation")
    .replaceAll("Specific project instruction or bug explanation", "Specific CLAUDE.md rule or bug explanation")
    .replaceAll("2. **Apply Project Standards**: Follow the established coding standards from the root agent instructions, language/framework docs, and installed packs, including:", "2. **Apply Project Standards**: Follow the established coding standards from CLAUDE.md including:")
    .replaceAll("   - import/module conventions and dependency boundaries", "   - Use ES modules with proper import sorting and extensions")
    .replaceAll("   - function or module declaration patterns", "   - Prefer `function` keyword over arrow functions")
    .replaceAll("   - explicit public API, type, or interface annotations where the project expects them", "   - Use explicit return type annotations for top-level functions")
    .replaceAll("   - component or interface patterns with explicit types where applicable", "   - Follow proper React component patterns with explicit Props types")
    .replaceAll("   - project error handling and observability patterns", "   - Use proper error handling patterns (avoid try/catch when possible)")
    .replaceAll("   - consistent naming conventions", "   - Maintain consistent naming conventions")
    .replaceAll("   - IMPORTANT: Avoid dense nested conditional expressions - prefer explicit branching for multiple conditions", "   - IMPORTANT: Avoid nested ternary operators - prefer switch statements or if/else chains for multiple conditions")
    .replaceAll("specializing in change-set review", "specializing in pull request review")
    .replaceAll("reviewed changes have adequate test coverage", "PRs have adequate test coverage")
    .replaceAll("examine the reviewed changes", "examine the PR's changes")
    .replaceAll("root agent instructions if available", "CLAUDE.md if available")
    .replaceAll("Uncovered critical domain or workflow branches", "Uncovered critical business logic branches")
    .replaceAll("Use descriptive and meaningful test names for clarity", "Follow DAMP principles (Descriptive and Meaningful Phrases) for clarity")
    .replaceAll("critical paths that could cause released or user-visible issues if broken", "critical paths that could cause production issues if broken")
    .replaceAll("Important domain or workflow logic that could cause user-facing errors", "Important business logic that could cause user-facing errors")
    .replaceAll("trivial accessors unless they contain logic", "trivial getters/setters unless they contain logic")
    .replaceAll("security or isolation patterns specific to this project's configured runtime and packs", "security or isolation patterns specific to this Worker/D1/Telegram stack")
    .replaceAll("user/account isolation", "user/tenant isolation")
    .replaceAll("performance patterns in this project's configured runtime and packs", "performance patterns in this Worker/D1/R2 stack")
    .replaceAll("properly surfaced, recorded, and actionable.", "properly surfaced, logged, and actionable.")
    .replaceAll("without proper diagnostics and user feedback", "without proper logging and user feedback")
    .replaceAll("Released code falling back to mocks", "Production code falling back to mocks")
    .replaceAll("When examining a change set, you will:", "When examining a PR, you will:")
    .replaceAll("All try-catch blocks (or equivalent exception/result handling patterns)", "All try-catch blocks (or try-except in Python, Result types in Rust, etc.)")
    .replaceAll("All places where errors are recorded but execution continues", "All places where errors are logged but execution continues")
    .replaceAll("All null-safe or absence-tolerant access patterns that might hide errors", "All optional chaining or null coalescing that might hide errors")
    .replaceAll("**Diagnostic Quality:**", "**Logging Quality:**")
    .replaceAll("Is the error recorded with appropriate severity for released or user-visible issues?", "Is the error logged with appropriate severity (logError for production issues)?")
    .replaceAll("Does the diagnostic record include sufficient context", "Does the log include sufficient context")
    .replaceAll("Is there a project-standard error identifier or tracking key when the project uses one?", "Is there an error ID from constants/errorIds.ts for Sentry tracking?")
    .replaceAll("Would this diagnostic record help", "Would this log help")
    .replaceAll("Catch blocks that only record and continue", "Catch blocks that only log and continue")
    .replaceAll("Returning null/undefined/default values on error without diagnostics", "Returning null/undefined/default values on error without logging")
    .replaceAll("Using null-safe access to silently skip", "Using optional chaining (?.) to silently skip")
    .replaceAll("Never silently fail in released or user-visible code", "Never silently fail in production code")
    .replaceAll("Always record errors using appropriate project diagnostic functions", "Always log errors using appropriate logging functions")
    .replaceAll("Use proper error identifiers when the project has an error tracking convention", "Use proper error IDs for Sentry tracking")
    .replaceAll("Explain the debugging problems", "Explain the debugging nightmares")
    .replaceAll("Be aware of project-specific patterns from root agent instructions:", "Be aware of project-specific patterns from CLAUDE.md:")
    .replaceAll("Check for project-specific diagnostic functions and error tracking", "Check for project-specific logging functions and error tracking")
    .replaceAll("The project may explicitly forbid silent failures in released code", "The project explicitly forbids silent failures in production code")
    .replaceAll("Domain or workflow rules encoded in the type", "Business logic rules encoded in the type")
    .replaceAll("appropriate access controls or visibility boundaries", "appropriate access modifiers")
    .replaceAll("invariants enforced as early and locally as the language/project allows?", "invariants enforced at compile-time where possible?")
    .replaceAll("enforced as early and locally as the language/project allows where possible", "enforced at compile-time where possible")
    .replaceAll("as early and locally as the language/project allows", "compile-time where possible")
    .replaceAll("domain or workflow requirements", "business requirements")
    .replaceAll("construction or initialization time", "construction time")
    .replaceAll("impossible or difficult to create invalid instances", "impossible to create invalid instances")
    .replaceAll("```markdown", "```")
    .replaceAll("Prefer language-native guarantees over later runtime checks when feasible", "Prefer compile-time guarantees over runtime checks when feasible")
    .replaceAll("Types should make invalid states difficult or impossible to represent", "Types should make illegal states unrepresentable")
    .replaceAll("Construction or initialization validation is crucial", "Constructor validation is crucial")
    .replaceAll("Cloudflare Worker endpoint exposure", "Worker endpoint exposure")
    .replaceAll("R2 path access and object naming safety", "R2 path access and object naming safety")
    .replaceAll("Use the configured project context when evaluating options:", "The active stack in this repository is centered on:")
    .replaceAll("- application runtime and deployment surfaces from project config and installed packs", "- Cloudflare Workers runtime")
    .replaceAll("- primary storage surfaces from project docs, config, and installed packs", "- D1 for primary relational storage")
    .replaceAll("- generated asset storage surfaces from project docs, config, and installed packs", "- R2 for generated chart and asset storage")
    .replaceAll("- user-facing flows and copy constraints from the Design Document and installed packs", "- Telegram-first user flows")
    .replaceAll("Keep the document focused on this task rather than restating the whole system.", "Use that context when evaluating options, but keep the document focused on this task rather than restating the whole system.")
    .replaceAll("configured domain correctness", "financial correctness")
    .replaceAll("configured domain-correctness", "financial correctness")
    .replaceAll("domain-correctness", "financial-math")
    .replaceAll("`math-genius` is a finance pack extension, not part of generic core review.", "`math-genius` is an intentional FinAI extension, not accidental drift from ZNAI.")
    .replaceAll("code \"works\"", "code “works”")
    .replaceAll("\"temporary\"", "“temporary”")
    .replaceAll("Preferred path:", "Preferred path in FinAI:")
    .replaceAll("commit work, open PR to the configured integration branch with the standard body template, squash merge, delete branch, sync worktrees", "commit work, open PR to `develop` with the standard body template, squash merge, delete branch, sync worktrees")
    .replaceAll("on configured release-sync deliveries, prepend a new block to `RELEASES.md` from per-PR user-facing lines", "on `develop -> master` release-sync deliveries, prepend a new block to `RELEASES.md` from per-PR user-facing lines")
    .replaceAll("report configured integration-branch delivery, configured release-branch status, and local worktree parking as separate facts", "report `develop` delivery, `master` release status, and local worktree parking as separate facts")
    .replaceAll("Runtime bindings (`cf/wrangler.toml` configured binding changes)", "Bindings (`cf/wrangler.toml` D1/R2/KV changes)")
    .replaceAll("Secrets (new configured secret references without existing secret provisioning history)", "Secrets (new `env.<NAME>` references without existing `wrangler secret put` history)")
    .replaceAll("Cron (configured scheduled triggers and handlers)", "Cron (`[triggers]` in wrangler.toml; `scheduled()` handlers)")
    .replaceAll("scheduled-task or cron handlers", "`scheduled()` / cron handlers")
    .replaceAll("configured release-notes aggregation", "`RELEASES.md` aggregation")
    .replaceAll("Release-notes aggregation skips these entries.", "`RELEASES.md` aggregation skips these entries.")
    .replaceAll("configured operator/admin release-announcement destination", "`release_notes_admins` workflow input")
    .replaceAll("configured user-facing release-announcement destination", "`release_notes_users` workflow input")
    .replaceAll("for the `release_notes_admins` workflow input", "for `release_notes_admins` workflow input")
    .replaceAll("## Copy into configured admin release announcement destination", "## ⤵ Copy into deploy.yml release_notes_admins input")
    .replaceAll("## Copy into configured user release announcement destination", "## ⤵ Copy into deploy.yml release_notes_users input")
    .replaceAll("write directly to the configured release-notes artifact", "write to `RELEASES.md` directly")
    .replaceAll("new configured release-notes block", "new `RELEASES.md` block")
    .replaceAll("to the configured release-notes artifact", "to `RELEASES.md`")
    .replaceAll("release-notes aggregation only", "`RELEASES.md` aggregation only")
    .replaceAll("updated the configured release-notes artifact", "updated `RELEASES.md`")
    .replaceAll("diff touches configured high-risk prompt or agent assembly surfaces, configured messaging copy changed, or approval/registration flow semantics changed", "diff touches `cf/src/agents/*/SOUL.md`|`RULES.md`|tier-1 prompt assembly, Telegram copy changed (including the `pending` command, notifier fan-out), or approval/registration flow semantics changed")
    .replaceAll("📢 Deploy <YYYY-MM-DD>", "📢 FinAI deploy <YYYY-MM-DD>")
    .replaceAll("Reference the current Design Document or ADD/ADR for full architectural rationale when the release-announcement contract changed.", "Reference: `docs/phases/phase-observe/design/FINAI-PLAN-OBSERVE-T0-ADR.md` (delivery-agent Contract Delta section) for full architectural rationale.")
    .replaceAll("Enumerate squashed commits between the prior release branch tip and the new release branch tip", "Enumerate squashed commits between prior master tip and new master tip");
}

function normalizeAllowedMigrationText(value: string): string {
  return value
    .replaceAll(
      [
        "## FinAI-Specific Guardrails",
        "",
        "Implementation must preserve:",
        "",
        "- `userId` scoping on all D1 access for user-owned data",
        "- input validation on user-facing inputs",
        "- UTC handling for timestamps",
        "- financial correctness invariants: financial correctness, user isolation, UTC handling, and no-look-ahead",
        "- Worker runtime constraints"
      ].join("\n"),
      [
        "## FinAI-Specific Guardrails",
        "",
        "Implementation must preserve:",
        "",
        "- `userId` scoping on all D1 access for user-owned data",
        "- input validation on user-facing inputs",
        "- UTC handling for timestamps",
        "- fixed-point or integer-safe math for monetary values",
        "- Cloudflare Worker runtime constraints"
      ].join("\n")
    )
    .replaceAll(
      [
        "Default checks for code changes:",
        "",
        "```bash",
        "cd cf && npm test",
        "cd cf && npm run type-check",
        "```"
      ].join("\n"),
      [
        "Default checks for code changes:",
        "",
        "1. `cd cf && npm test`",
        "2. `cd cf && npm run type-check`"
      ].join("\n")
    )
    .replaceAll(
      [
        "FinAI guardrails remain in force:",
        "",
        "- `userId` scoping",
        "- input validation",
        "- UTC handling",
        "- financial correctness invariants: financial correctness, user isolation, UTC handling, and no-look-ahead",
        "- Worker runtime constraints"
      ].join("\n"),
      [
        "FinAI guardrails remain in force:",
        "",
        "- `userId` scoping",
        "- input validation",
        "- UTC handling",
        "- fixed-point or integer-safe financial math",
        "- Worker runtime constraints"
      ].join("\n")
    )
    .replaceAll(
      [
        "FinAI-specific checklist:",
        "",
        "- `userId` scoping",
        "- UTC handling for timestamps",
        "- fixed-point or integer-safe financial math where relevant",
        "- Cloudflare Worker constraints"
      ].join("\n"),
      [
        "FinAI-specific checklist:",
        "",
        "- `userId` scoping on user-owned D1 data",
        "- UTC handling for timestamps",
        "- no look-ahead assumptions in historical projections",
        "- fixed-point or integer-safe financial math where relevant",
        "- Cloudflare Worker constraints"
      ].join("\n")
    )
    .replaceAll(
      "  - financial correctness invariants: financial correctness, user isolation, UTC handling, and no-look-ahead",
      "  - Integer/fixed-point math for monetary values"
    )
    .replaceAll(
      [
        "### math-genius",
        "",
        "Must focus on:",
        "",
        "- financial correctness invariants: financial correctness, user isolation, UTC handling, and no-look-ahead"
      ].join("\n"),
      [
        "### math-genius",
        "",
        "Must focus on:",
        "",
        "- fixed-point / integer-safe money math"
      ].join("\n")
    )
    .replaceAll(
      [
        "- Проходить configured checks:",
        "",
        "```bash",
        "cd cf && npm test",
        "cd cf && npm run type-check",
        "```"
      ].join("\n"),
      [
        "- Компилироваться (`npm run type-check`)",
        "- Проходить тесты (`npm test`)"
      ].join("\n")
    )
    .replaceAll(
      [
        "- running configured checks:",
        "",
        "```bash",
        "cd cf && npm test",
        "cd cf && npm run type-check",
        "```"
      ].join("\n"),
      [
        "- `cd cf && npm test`",
        "- `cd cf && npm run type-check`"
      ].join("\n")
    );
}

function tokenize(value: string): string[] {
  return value.match(/\S+/g) ?? [];
}

function sequenceSimilarity(left: string[], right: string[]): number {
  if (left.length === 0 && right.length === 0) {
    return 1;
  }

  if (left.length * right.length > MAX_EXACT_LCS_CELLS) {
    return positionalSimilarity(left, right);
  }

  const lcs = lcsTable(left, right)[left.length]?.[right.length] ?? 0;
  return (2 * lcs) / (left.length + right.length);
}

function lineDiff(source: string[], target: string[]): DiffLine[] {
  if (source.length * target.length > MAX_EXACT_LCS_CELLS) {
    return positionalDiff(source, target);
  }

  const table = lcsTable(source, target);
  const diff: DiffLine[] = [];
  let i = source.length;
  let j = target.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && source[i - 1] === target[j - 1]) {
      diff.push({ kind: "same", value: source[i - 1] ?? "" });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || (table[i]?.[j - 1] ?? 0) >= (table[i - 1]?.[j] ?? 0))) {
      diff.push({ kind: "added", value: target[j - 1] ?? "" });
      j -= 1;
    } else if (i > 0) {
      diff.push({ kind: "missing", value: source[i - 1] ?? "" });
      i -= 1;
    }
  }

  return diff.reverse();
}

function positionalSimilarity(left: string[], right: string[]): number {
  const maxLength = Math.max(left.length, right.length);
  if (maxLength === 0) {
    return 1;
  }

  let same = 0;
  const minLength = Math.min(left.length, right.length);
  for (let index = 0; index < minLength; index += 1) {
    if (left[index] === right[index]) {
      same += 1;
    }
  }

  return same / maxLength;
}

function positionalDiff(source: string[], target: string[]): DiffLine[] {
  const diff: DiffLine[] = [];
  const maxLength = Math.max(source.length, target.length);

  for (let index = 0; index < maxLength; index += 1) {
    const sourceLine = source[index];
    const targetLine = target[index];

    if (sourceLine === targetLine) {
      diff.push({ kind: "same", value: sourceLine ?? "" });
      continue;
    }

    if (sourceLine !== undefined) {
      diff.push({ kind: "missing", value: sourceLine });
    }

    if (targetLine !== undefined) {
      diff.push({ kind: "added", value: targetLine });
    }
  }

  return diff;
}

function lcsTable(left: string[], right: string[]): number[][] {
  const table = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      table[i][j] = left[i - 1] === right[j - 1]
        ? (table[i - 1]?.[j - 1] ?? 0) + 1
        : Math.max(table[i - 1]?.[j] ?? 0, table[i]?.[j - 1] ?? 0);
    }
  }

  return table;
}

function formatDiffExamples(prefix: string, values: string[]): string[] {
  if (values.length === 0) {
    return [`    ${prefix} <none>`];
  }

  return values.map((value) => `    ${prefix} ${value}`);
}
