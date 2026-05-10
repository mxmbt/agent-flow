import { access, readFile } from "node:fs/promises";
import path from "node:path";
import type { RenderedFile } from "../renderer/conflict-policy.js";

export type MirrorParityIssueKind = "missing-pair" | "content-drift" | "missing-installed" | "stale-installed";

export interface MirrorParityIssue {
  kind: MirrorParityIssueKind;
  path: string;
  counterpart?: string;
  message: string;
}

export interface MirrorParityResult {
  passed: boolean;
  checkedPairs: number;
  issues: MirrorParityIssue[];
}

interface MirrorPair {
  left: string;
  right: string;
}

const ROOT_PAIRS: MirrorPair[] = [
  { left: "CLAUDE.md", right: "AGENTS.md" },
  { left: ".claude/CLAUDE.md", right: ".codex/orchestration-policy.md" },
  { left: ".claude/CLAUDE.md", right: ".codex/claude-interop.md" }
];

const CLAUDE_MIRROR_PREFIXES = [
  ".claude/agents/",
  ".claude/guides/",
  ".claude/skills/"
];

export function validateRenderedMirrorParity(files: RenderedFile[]): MirrorParityResult {
  const byPath = new Map(files.map((file) => [toPortablePath(file.path), file.content]));
  const pairs = collectMirrorPairs([...byPath.keys()]);
  const issues: MirrorParityIssue[] = [];

  for (const pair of pairs) {
    const left = byPath.get(pair.left);
    const right = byPath.get(pair.right);

    if (left === undefined || right === undefined) {
      issues.push({
        kind: "missing-pair",
        path: left === undefined ? pair.left : pair.right,
        counterpart: left === undefined ? pair.right : pair.left,
        message: `Missing mirror file for ${left === undefined ? pair.right : pair.left}.`
      });
      continue;
    }

    const normalizedLeft = normalizeMirrorContent(left);
    const normalizedRight = normalizeMirrorContent(right);

    if (normalizedLeft !== normalizedRight) {
      const line = firstDifferentLine(normalizedLeft, normalizedRight);
      issues.push({
        kind: "content-drift",
        path: pair.left,
        counterpart: pair.right,
        message: `Mirror drift between ${pair.left} and ${pair.right} at normalized line ${line}.`
      });
    }
  }

  return {
    passed: issues.length === 0,
    checkedPairs: pairs.length,
    issues
  };
}

export async function validateInstalledMirrorParity(root: string, expectedFiles: RenderedFile[]): Promise<MirrorParityResult> {
  const issues: MirrorParityIssue[] = [];
  const installedFiles: RenderedFile[] = [];

  for (const expected of expectedFiles) {
    const content = await readOptional(path.join(root, expected.path));

    if (content === null) {
      issues.push({
        kind: "missing-installed",
        path: toPortablePath(expected.path),
        message: `Expected managed file is missing: ${toPortablePath(expected.path)}.`
      });
      continue;
    }

    if (content !== expected.content) {
      issues.push({
        kind: "stale-installed",
        path: toPortablePath(expected.path),
        message: `Installed managed file differs from rendered output: ${toPortablePath(expected.path)}.`
      });
    }

    installedFiles.push({ path: expected.path, content });
  }

  const mirrorResult = validateRenderedMirrorParity(installedFiles);
  issues.push(...mirrorResult.issues);

  return {
    passed: issues.length === 0,
    checkedPairs: mirrorResult.checkedPairs,
    issues
  };
}

export function formatMirrorParityReport(result: MirrorParityResult): string {
  const lines = [
    `Mirror parity: ${result.passed ? "PASS" : "FAIL"}`,
    `Checked pairs: ${result.checkedPairs}`
  ];

  if (result.issues.length > 0) {
    lines.push("", "Issues:");
    for (const issue of result.issues) {
      const counterpart = issue.counterpart ? ` <-> ${issue.counterpart}` : "";
      lines.push(`- ${issue.kind}: ${issue.path}${counterpart}`);
      lines.push(`  ${issue.message}`);
    }
  }

  return [...lines, ""].join("\n");
}

function collectMirrorPairs(paths: string[]): MirrorPair[] {
  const pathSet = new Set(paths);
  const pairs: MirrorPair[] = [];

  for (const pair of ROOT_PAIRS) {
    if (pathSet.has(pair.left) || pathSet.has(pair.right)) {
      pairs.push(pair);
    }
  }

  for (const filePath of paths) {
    for (const prefix of CLAUDE_MIRROR_PREFIXES) {
      if (!filePath.startsWith(prefix)) {
        continue;
      }

      pairs.push({
        left: filePath,
        right: filePath.replace(/^\.claude\//, ".codex/")
      });
    }
  }

  return pairs;
}

function normalizeMirrorContent(content: string): string {
  return normalizeAllowedTargetDifferences(sliceCanonicalRoot(stripManagedHeaders(stripFrontmatter(stripManagedHeaders(content))))).trimEnd();
}

function stripManagedHeaders(content: string): string {
  return content
    .split("\n")
    .filter((line) => !isManagedMetadataLine(line))
    .join("\n")
    .replace(/^\n+/, "");
}

function isManagedMetadataLine(line: string): boolean {
  return /^<!-- @agent-flow managed .* -->$/.test(line)
    || /^# @agent-flow managed /.test(line)
    || /^\/\/ @agent-flow managed /.test(line);
}

function stripFrontmatter(content: string): string {
  if (!content.startsWith("---\n")) {
    return content;
  }

  const end = content.indexOf("\n---\n", 4);
  if (end === -1) {
    return content;
  }

  return content.slice(end + "\n---\n".length);
}

function sliceCanonicalRoot(content: string): string {
  const marker = "# Agent Flow Canonical Contract";
  const index = content.indexOf(marker);
  return index === -1 ? content : content.slice(index);
}

function normalizeAllowedTargetDifferences(content: string): string {
  return content
    .replaceAll("\r\n", "\n")
    .replaceAll("~/.claude", "~/.agent-tool")
    .replaceAll("~/.codex", "~/.agent-tool")
    .replaceAll(".claude/guides/", ".agent-tool/guides/")
    .replaceAll(".codex/guides/", ".agent-tool/guides/")
    .replaceAll(".claude/skills/", ".agent-tool/skills/")
    .replaceAll(".codex/skills/", ".agent-tool/skills/")
    .replaceAll(".claude/agents/", ".agent-tool/agents/")
    .replaceAll(".codex/agents/", ".agent-tool/agents/")
    .replaceAll("`.claude/settings.json`", "`.agent-tool/settings.json`")
    .replaceAll("`.codex/settings.json`", "`.agent-tool/settings.json`")
    .replaceAll("`.claude", "`.agent-tool")
    .replaceAll("`.codex", "`.agent-tool")
    .replaceAll(".claude", ".agent-tool")
    .replaceAll(".codex", ".agent-tool")
    .replaceAll("Claude/OpenBrowser", "agent/browser")
    .replaceAll("OpenBrowser", "browser automation")
    .replaceAll("AskUserQuestion", "ask the user directly")
    .replaceAll("Claude-native", "runtime-native")
    .replaceAll("Claude consumption", "agent consumption")
    .replaceAll("Claude Code", "Agent Tool")
    .replaceAll("Codex", "Agent Tool")
    .replaceAll("`/ckm:brand`", "`brand-uupm`")
    .replaceAll("`/ckm:design-system`", "`design-system-uupm`")
    .replaceAll("`/ck:ui-ux-pro-max`", "`ui-ux-pro-max`")
    .replaceAll("`/ck:frontend-design`", "`frontend-design`")
    .replaceAll("`/ui-ux-pro-max`", "`ui-ux-pro-max`");
}

function firstDifferentLine(left: string, right: string): number {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");
  const length = Math.max(leftLines.length, rightLines.length);

  for (let index = 0; index < length; index += 1) {
    if (leftLines[index] !== rightLines[index]) {
      return index + 1;
    }
  }

  return 1;
}

function toPortablePath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    await access(filePath);
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}
