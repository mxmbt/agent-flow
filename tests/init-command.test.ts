import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("init creates config, starter docs, and target agent files in a bare project", async () => {
  const cwd = await tempDir();

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  assert.match(stdout, /Initialized Agent Flow/);
  assert.match(stdout, /\.agent-flow\/config\.json/);
  assert.match(stdout, /docs\/ARCHITECTURE\.md/);
  assert.match(stdout, /docs\/ARCHITECTURE_MULTI_USER\.md/);
  assert.match(stdout, /docs\/ARCHITECTURE_SCHEDULING\.md/);
  assert.match(stdout, /\.claude\/agents\/architect\.md/);
  assert.match(stdout, /\.codex\/agents\/architect\.md/);
  assert.match(stdout, /\.codex\/agents\/code-simplifier\.md/);
  assert.match(stdout, /\.codex\/agents\/deep-reviewer\.md/);
  assert.match(stdout, /\.codex\/agents\/findings-arbiter\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/math-genius\.md/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.equal(config.artifacts.architectureFile, "docs/ARCHITECTURE.md");
  assert.equal(config.artifacts.userIsolationArchitectureFile, "docs/ARCHITECTURE_MULTI_USER.md");
  assert.equal(config.artifacts.schedulingArchitectureFile, "docs/ARCHITECTURE_SCHEDULING.md");

  const architecture = await readFile(path.join(cwd, "docs", "ARCHITECTURE.md"), "utf8");
  assert.match(architecture, /# Architecture/);
  assert.match(architecture, /@agent-flow managed/);

  const architectAgent = await readFile(path.join(cwd, ".codex", "agents", "architect.md"), "utf8");
  assert.match(architectAgent, /`docs\/ARCHITECTURE\.md`/);
  assert.match(architectAgent, /user-isolation work -> `docs\/ARCHITECTURE_MULTI_USER\.md`/);
  assert.match(architectAgent, /scheduling or asynchronous work -> `docs\/ARCHITECTURE_SCHEDULING\.md`/);
});

test("init dry-run does not write files", async () => {
  const cwd = await tempDir();

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init", "--dry-run"], { cwd });

  assert.match(stdout, /No files were written/);
  await assert.rejects(() => readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
});

test("init reports unmanaged conflicts without overwriting user files", async () => {
  const cwd = await tempDir();
  await writeFile(path.join(cwd, "AGENTS.md"), "user agents entrypoint\n", "utf8");

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  assert.match(stdout, /existing unmanaged files/);
  assert.match(stdout, /conflict\s+AGENTS\.md/);
  assert.equal(await readFile(path.join(cwd, "AGENTS.md"), "utf8"), "user agents entrypoint\n");
  await assert.rejects(() => readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
});

test("init reuses existing project documents instead of creating duplicate artifact paths", async () => {
  const cwd = await tempDir();
  await mkdir(path.join(cwd, "docs", "architecture"), { recursive: true });
  await mkdir(path.join(cwd, "docs", "product"), { recursive: true });
  await writeFile(path.join(cwd, "STATUS.md"), "status\n", "utf8");
  await writeFile(path.join(cwd, "ROADMAP.md"), "roadmap\n", "utf8");
  await writeFile(path.join(cwd, "docs", "product", "README.md"), "product\n", "utf8");
  await writeFile(path.join(cwd, "docs", "architecture", "README.md"), "architecture\n", "utf8");
  await writeFile(path.join(cwd, "docs", "SECURITY.md"), "security\n", "utf8");
  await writeFile(path.join(cwd, "docs", "JOBS.md"), "jobs\n", "utf8");

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  assert.match(stdout, /Detected existing artifact for artifacts\.statusFile: STATUS\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.roadmapFile: ROADMAP\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.productFile: docs\/product\/README\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.architectureFile: docs\/architecture\/README\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.userIsolationArchitectureFile: docs\/SECURITY\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.schedulingArchitectureFile: docs\/JOBS\.md/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.equal(config.artifacts.statusFile, "STATUS.md");
  assert.equal(config.artifacts.roadmapFile, "ROADMAP.md");
  assert.equal(config.artifacts.productFile, "docs/product/README.md");
  assert.equal(config.artifacts.architectureFile, "docs/architecture/README.md");
  assert.equal(config.artifacts.userIsolationArchitectureFile, "docs/SECURITY.md");
  assert.equal(config.artifacts.schedulingArchitectureFile, "docs/JOBS.md");

  const architectAgent = await readFile(path.join(cwd, ".codex", "agents", "architect.md"), "utf8");
  assert.match(architectAgent, /`docs\/architecture\/README\.md`/);
  assert.match(architectAgent, /user-isolation work -> `docs\/SECURITY\.md`/);
  assert.match(architectAgent, /scheduling or asynchronous work -> `docs\/JOBS\.md`/);

  await assert.rejects(() => readFile(path.join(cwd, "docs", "ARCHITECTURE.md"), "utf8"));
  assert.equal(await readFile(path.join(cwd, "STATUS.md"), "utf8"), "status\n");
});

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-flow-init-"));
}
