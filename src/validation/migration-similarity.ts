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

  return body
    .map((line) => line.trimEnd())
    .map(normalizeAllowedMigrationDifferences)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
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
    || /^<!--\s*@agent-flow managed\b/.test(trimmed);
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
    .replaceAll("{{artifacts.phaseRoot}}", "docs/phases")
    .replaceAll("{{artifacts.statusFile}}", "PROGRESS.md")
    .replaceAll("{{artifacts.productFile}}", "docs/PRODUCT.md")
    .replaceAll("{{artifacts.roadmapFile}}", "docs/ROADMAP.md")
    .replaceAll("{{artifacts.backlogFile}}", "docs/tasks.md")
    .replaceAll("{{artifacts.uiUxSpecificationFile}}", "docs/UI-UX-SPECIFICATION.md")
    .replaceAll("{{artifacts.designSystemFile}}", "docs/design/DESIGN-SYSTEM.md")
    .replaceAll("{{artifacts.uxWritingGuideFile}}", "docs/design/UX-WRITING-GUIDE.md")
    .replaceAll("{{runtime.appRoot}}", "cf")
    .replaceAll("{{runtime.migrationsGlob}}", "cf/migrations/**")
    .replaceAll("{{runtime.bindingConfigFile}}", "cf/wrangler.toml")
    .replaceAll("{{runtime.routeEntrypoint}}", "cf/src/index.ts")
    .replaceAll("{{quality.invariantSummary}}", "financial correctness, user isolation, UTC handling, and no-look-ahead")
    .replaceAll("{{checks.defaultShellBlock}}", "cd cf && npm test\ncd cf && npm run type-check")
    .replaceAll("{{checks.changedSchemaInline}}", "`cd cf && npm run generate` and `cd cf && npm run migrate:local`")
    .replaceAll("{{checks.changedSchemaIndented}}", "  - `cd cf && npm run generate`\n  - `cd cf && npm run migrate:local`")
    .replaceAll("{{dev.startCommand}}", "cd cf && npm run dev")
    .replaceAll("{{git.integrationBranch}}", "develop")
    .replaceAll("{{git.releaseBranch}}", "master")
    .replaceAll("{{git.defaultDeliveryDiffCommand}}", "git diff --name-only origin/develop...HEAD")
    .replaceAll("{{git.releaseSyncDiffCommand}}", "git diff --name-only origin/master...origin/develop")
    .replaceAll("{{git.releaseFlow}}", "develop -> master")
    .replaceAll("{{git.prBaseFlag}}", "--base develop")
    .replaceAll("{{git.remoteBranchDeleteCommand}}", "gh api repos/id-bu/AI_Finance_Manager/git/refs/heads/<branch> -X DELETE")
    .replaceAll("{{git.deliveryStateRef}}", "<merged-commit-or-origin/develop>")
    .replaceAll("`{{artifacts.architectureFile}}`", "`docs/ARCHITECTURE.md`")
    .replaceAll("- user-isolation work -> `{{artifacts.userIsolationArchitectureFile}}`", "- `ARCHITECTURE_MULTI_USER.md` when user isolation or scheduling is involved")
    .replaceAll("- scheduling or asynchronous work -> `{{artifacts.schedulingArchitectureFile}}`\n", "")
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
    .replaceAll("diff touches configured high-risk prompt or agent assembly surfaces, configured messaging copy changed, or approval/registration flow semantics changed", "diff touches `cf/src/agents/*/SOUL.md`|`RULES.md`|tier-1 prompt assembly, Telegram copy changed (including the `pending` command, notifier fan-out), or approval/registration flow semantics changed")
    .replaceAll("📢 Deploy <YYYY-MM-DD>", "📢 FinAI deploy <YYYY-MM-DD>")
    .replaceAll("Reference the current Design Document or ADD/ADR for full architectural rationale when the release-announcement contract changed.", "Reference: `docs/phases/phase-observe/design/FINAI-PLAN-OBSERVE-T0-ADR.md` (delivery-agent Contract Delta section) for full architectural rationale.")
    .replaceAll("Enumerate squashed commits between the prior release branch tip and the new release branch tip", "Enumerate squashed commits between prior master tip and new master tip");
}

function tokenize(value: string): string[] {
  return value.match(/\S+/g) ?? [];
}

function sequenceSimilarity(left: string[], right: string[]): number {
  if (left.length === 0 && right.length === 0) {
    return 1;
  }

  const lcs = lcsTable(left, right)[left.length]?.[right.length] ?? 0;
  return (2 * lcs) / (left.length + right.length);
}

function lineDiff(source: string[], target: string[]): DiffLine[] {
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
