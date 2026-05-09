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
    .replaceAll("{{artifacts.phaseRoot}}", "docs/phases")
    .replaceAll("{{artifacts.roadmapFile}}", "docs/ROADMAP.md")
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
