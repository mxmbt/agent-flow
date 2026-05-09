import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { createDefaultConfig } from "../src/config/defaults.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("config list shows explainable rendered placeholders", async () => {
  const { stdout } = await execFileAsync(process.execPath, [cliPath, "config", "list"]);

  assert.match(stdout, /agent-flow config/);
  assert.match(stdout, /checks\.defaultShellBlock/);
  assert.match(stdout, /artifacts\.architectureFile/);
  assert.match(stdout, /artifacts\.userIsolationArchitectureFile/);
  assert.match(stdout, /artifacts\.schedulingArchitectureFile/);
  assert.match(stdout, /git\.remoteBranchDeleteCommand/);
});

test("config explain shows current rendered value, sources, and template usage", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Explain Fixture");
  config.git.remoteName = "upstream";
  config.git.repository = "acme/example";
  config.git.integrationBranch = "main";
  config.git.releaseBranch = "stable";
  config.checks.default = ["pnpm test", "pnpm typecheck"];
  config.runtime.appRoot = "apps/site";
  config.artifacts.architectureFile = "docs/architecture/system.md";
  config.artifacts.userIsolationArchitectureFile = "docs/architecture/data-isolation.md";
  config.artifacts.schedulingArchitectureFile = "docs/architecture/jobs.md";
  config.packs = ["cloudflare-worker"];

  await writeConfig(cwd, config);

  const checks = await execFileAsync(process.execPath, [cliPath, "config", "explain", "checks.defaultShellBlock"], { cwd });
  assert.match(checks.stdout, /checks\.defaultShellBlock/);
  assert.match(checks.stdout, /pnpm test\npnpm typecheck/);
  assert.match(checks.stdout, /\.agent-flow\/config\.json -> checks\.default/);
  assert.match(checks.stdout, /templates\/canonical\/agents\/feature-developer\.md\.hbs/);

  const git = await execFileAsync(process.execPath, [cliPath, "config", "explain", "git.remoteBranchDeleteCommand"], { cwd });
  assert.match(git.stdout, /gh api repos\/acme\/example\/git\/refs\/heads\/<branch> -X DELETE/);
  assert.match(git.stdout, /\.agent-flow\/config\.json -> git\.repository/);

  const architecture = await execFileAsync(
    process.execPath,
    [cliPath, "config", "explain", "artifacts.userIsolationArchitectureFile"],
    { cwd }
  );
  assert.match(architecture.stdout, /docs\/architecture\/data-isolation\.md/);
  assert.match(architecture.stdout, /\.agent-flow\/config\.json -> artifacts\.userIsolationArchitectureFile/);
  assert.match(architecture.stdout, /templates\/canonical\/agents\/architect\.md\.hbs/);
});

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-flow-config-command-"));
}

async function writeConfig(cwd: string, value: unknown): Promise<void> {
  const configDir = path.join(cwd, ".agent-flow");
  await mkdir(configDir, { recursive: true });
  await writeFile(path.join(configDir, "config.json"), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
