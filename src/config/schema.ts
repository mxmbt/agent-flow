import type { AgentFlowConfig } from "./defaults.js";
import path from "node:path";

export interface ConfigIssue {
  path: string;
  message: string;
}

export class ConfigValidationError extends Error {
  readonly issues: ConfigIssue[];

  constructor(issues: ConfigIssue[]) {
    super(formatConfigIssues(issues));
    this.name = "ConfigValidationError";
    this.issues = issues;
  }
}

export function validateAgentFlowConfig(value: unknown): AgentFlowConfig {
  const issues: ConfigIssue[] = [];
  const config = expectRecord(value, "$", issues);

  validateProject(config, issues);
  validateArtifacts(config, issues);
  validateGit(config, issues);
  validateChecks(config, issues);
  validateDev(config, issues);
  validateRuntime(config, issues);
  validateDiscovery(config, issues);
  validateQuality(config, issues);
  validatePacks(config, issues);
  validateMcp(config, issues);
  validateFeatures(config, issues);
  validateNeedsReview(config, issues);

  if (issues.length > 0) {
    throw new ConfigValidationError(issues);
  }

  return value as AgentFlowConfig;
}

function validateNeedsReview(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  if (config.needsReview !== undefined) {
    expectStringArray(config.needsReview, "needsReview", issues);
  }
}

function validateProject(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const project = expectRecord(config.project, "project", issues);
  expectNonEmptyString(project.name, "project.name", issues);
  const taskPrefix = expectNonEmptyString(project.taskPrefix, "project.taskPrefix", issues);
  expectNonEmptyString(project.taskIdPattern, "project.taskIdPattern", issues);

  if (typeof taskPrefix === "string" && !/^[A-Z][A-Z0-9_]*$/.test(taskPrefix)) {
    issues.push({
      path: "project.taskPrefix",
      message: "must start with an uppercase letter and contain only uppercase letters, numbers, or underscores"
    });
  }
}

function validateArtifacts(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const artifacts = expectRecord(config.artifacts, "artifacts", issues);

  for (const key of [
    "statusFile",
    "roadmapFile",
    "productFile",
    "architectureFile",
    "userIsolationArchitectureFile",
    "schedulingArchitectureFile",
    "backlogFile",
    "uiUxSpecificationFile",
    "designSystemFile",
    "uxWritingGuideFile",
    "phaseRoot",
    "walkthroughRoot"
  ]) {
    expectRelativePath(artifacts[key], `artifacts.${key}`, issues);
  }

  if (artifacts.qaSharedAccountFile !== undefined) {
    expectRelativePath(artifacts.qaSharedAccountFile, "artifacts.qaSharedAccountFile", issues);
  }
}

function validateGit(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const git = expectRecord(config.git, "git", issues);
  expectNonEmptyString(git.remoteName, "git.remoteName", issues);

  if (git.repository !== null) {
    expectRepositoryRef(git.repository, "git.repository", issues);
  }

  expectBranchName(git.integrationBranch, "git.integrationBranch", issues);

  if (git.releaseBranch !== null) {
    expectBranchName(git.releaseBranch, "git.releaseBranch", issues);
  }

  expectStringArray(git.branchPrefixes, "git.branchPrefixes", issues);
  expectBoolean(git.worktreeParking, "git.worktreeParking", issues);
}

function expectRepositoryRef(value: unknown, path: string, issues: ConfigIssue[]): string | undefined {
  const repository = expectNonEmptyString(value, path, issues);

  if (typeof repository === "string" && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    issues.push({ path, message: "must be a GitHub-style owner/repo reference" });
  }

  return repository;
}

function validateChecks(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const checks = expectRecord(config.checks, "checks", issues);
  expectCommandArray(checks.default, "checks.default", issues);

  if (checks.focusedTestCommand !== null && checks.focusedTestCommand !== undefined) {
    expectCommand(checks.focusedTestCommand, "checks.focusedTestCommand", issues);
  }

  const optional = expectRecord(checks.optional, "checks.optional", issues);
  for (const [key, command] of Object.entries(optional)) {
    expectCommand(command, `checks.optional.${key}`, issues);
  }

  const changed = expectRecord(checks.changed, "checks.changed", issues);
  for (const [key, commands] of Object.entries(changed)) {
    expectCommandArray(commands, `checks.changed.${key}`, issues);
  }
}

function validateDev(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const dev = expectRecord(config.dev, "dev", issues);
  const start = expectRecord(dev.start, "dev.start", issues);

  if (start.command !== null) {
    expectCommand(start.command, "dev.start.command", issues);
  }

  if (start.url !== null) {
    const url = expectNonEmptyString(start.url, "dev.start.url", issues);
    if (typeof url === "string" && !isLikelyUrl(url)) {
      issues.push({ path: "dev.start.url", message: "must be a URL such as http://localhost:3000" });
    }
  }
}

function validateRuntime(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const runtime = expectRecord(config.runtime, "runtime", issues);
  expectRelativePath(runtime.appRoot, "runtime.appRoot", issues);
  expectStringArray(runtime.deploymentImpactSurfaces, "runtime.deploymentImpactSurfaces", issues);
}

function validateDiscovery(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const discovery = expectRecord(config.discovery, "discovery", issues);
  expectOneOf(discovery.codeGraphProvider, "discovery.codeGraphProvider", ["none", "code-review-graph", "custom"], issues);
  expectOneOf(discovery.fallback, "discovery.fallback", ["filesystem-search"], issues);

  if (discovery.customProvider !== null) {
    expectNonEmptyString(discovery.customProvider, "discovery.customProvider", issues);
  }

  if (discovery.codeGraphProvider === "custom" && discovery.customProvider === null) {
    issues.push({
      path: "discovery.customProvider",
      message: "must describe the custom provider when discovery.codeGraphProvider is custom"
    });
  }
}

function validateQuality(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const quality = expectRecord(config.quality, "quality", issues);
  expectStringArray(quality.experts, "quality.experts", issues);

  if (quality.domainExpert !== null) {
    expectNonEmptyString(quality.domainExpert, "quality.domainExpert", issues);
  }

  expectStringArray(quality.invariants, "quality.invariants", issues);
}

function validatePacks(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  expectStringArray(config.packs, "packs", issues);
}

function validateMcp(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const mcp = expectRecord(config.mcp, "mcp", issues);
  expectOneOf(mcp.mode, "mcp.mode", ["recommended", "strict", "off"], issues);

  const servers = expectRecord(mcp.servers, "mcp.servers", issues);
  for (const [name, server] of Object.entries(servers)) {
    const serverConfig = expectRecord(server, `mcp.servers.${name}`, issues);
    expectBoolean(serverConfig.enabled, `mcp.servers.${name}.enabled`, issues);
    expectBoolean(serverConfig.required, `mcp.servers.${name}.required`, issues);
  }
}

function validateFeatures(config: Record<string, unknown>, issues: ConfigIssue[]): void {
  const features = expectRecord(config.features, "features", issues);
  expectBoolean(features.claude, "features.claude", issues);
  expectBoolean(features.codex, "features.codex", issues);
  expectOneOf(features.codeReviewGraph, "features.codeReviewGraph", ["optional", "required", "off"], issues);
  expectBoolean(features.releaseSync, "features.releaseSync", issues);
}

function expectRecord(value: unknown, path: string, issues: ConfigIssue[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issues.push({ path, message: "must be an object" });
    return {};
  }

  return value as Record<string, unknown>;
}

function expectBoolean(value: unknown, path: string, issues: ConfigIssue[]): boolean | undefined {
  if (typeof value !== "boolean") {
    issues.push({ path, message: "must be a boolean" });
    return undefined;
  }

  return value;
}

function expectNonEmptyString(value: unknown, path: string, issues: ConfigIssue[]): string | undefined {
  if (typeof value !== "string" || value.trim().length === 0) {
    issues.push({ path, message: "must be a non-empty string" });
    return undefined;
  }

  return value;
}

function expectStringArray(value: unknown, path: string, issues: ConfigIssue[]): string[] {
  if (!Array.isArray(value)) {
    issues.push({ path, message: "must be an array of strings" });
    return [];
  }

  for (const [index, item] of value.entries()) {
    expectNonEmptyString(item, `${path}[${index}]`, issues);
  }

  return value as string[];
}

function expectCommandArray(value: unknown, path: string, issues: ConfigIssue[]): string[] {
  if (!Array.isArray(value)) {
    issues.push({ path, message: "must be an array of commands" });
    return [];
  }

  for (const [index, command] of value.entries()) {
    expectCommand(command, `${path}[${index}]`, issues);
  }

  return value as string[];
}

function expectCommand(value: unknown, path: string, issues: ConfigIssue[]): string | undefined {
  const command = expectNonEmptyString(value, path, issues);

  if (typeof command === "string" && /[\n\r\u0000]/.test(command)) {
    issues.push({ path, message: "must be a single-line shell command" });
  }

  return command;
}

function expectRelativePath(value: unknown, path: string, issues: ConfigIssue[]): string | undefined {
  const pathValue = expectNonEmptyString(value, path, issues);

  if (typeof pathValue === "string" && !isSafeRelativePath(pathValue)) {
    issues.push({ path, message: "must be a relative path inside the project" });
  }

  return pathValue;
}

function isSafeRelativePath(value: string): boolean {
  if (/[\n\r\u0000]/.test(value) || /^[A-Za-z]:[\\/]/.test(value) || path.isAbsolute(value)) {
    return false;
  }

  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return normalized !== ".." && !normalized.startsWith("../");
}

function expectBranchName(value: unknown, path: string, issues: ConfigIssue[]): string | undefined {
  const branch = expectNonEmptyString(value, path, issues);

  if (typeof branch === "string" && !isValidBranchName(branch)) {
    issues.push({ path, message: "must be a valid git branch name without spaces or unsafe characters" });
  }

  return branch;
}

function expectOneOf<T extends string>(value: unknown, path: string, allowed: T[], issues: ConfigIssue[]): T | undefined {
  if (typeof value !== "string" || !(allowed as string[]).includes(value)) {
    issues.push({ path, message: `must be one of: ${allowed.join(", ")}` });
    return undefined;
  }

  return value as T;
}

function isValidBranchName(value: string): boolean {
  return value.length > 0
    && !value.startsWith("/")
    && !value.endsWith("/")
    && !value.endsWith(".")
    && !value.includes("..")
    && !value.includes("@{")
    && !/[\\ ~^:?*[\]\r\n]/.test(value);
}

function isLikelyUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function formatConfigIssues(issues: ConfigIssue[]): string {
  const details = issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n");
  return `Invalid Agent Flow config:\n${details}`;
}
