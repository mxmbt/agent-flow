import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("pack list shows installed and available packs", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-pack-list-"));
  await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "pack", "list"], { cwd });

  assert.match(stdout, /finance \[available\]/);
  assert.match(stdout, /code-review-graph \[installed\]/);
});

test("pack add updates config and renders pack files", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-pack-add-"));
  await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "pack", "add", "finance"], { cwd });

  assert.match(stdout, /Agent Flow pack add finance/);
  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.deepEqual(config.packs, ["code-review-graph", "finance"]);
  assert.match(await readFile(path.join(cwd, ".codex", "agents", "math-genius.md"), "utf8"), /math-genius/);
});

test("pack remove deletes obsolete managed pack files", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-pack-remove-"));
  await execFileAsync(process.execPath, [cliPath, "init"], { cwd });
  await execFileAsync(process.execPath, [cliPath, "pack", "add", "finance"], { cwd });

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "pack", "remove", "finance"], { cwd });

  assert.match(stdout, /Obsolete managed files:/);
  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.deepEqual(config.packs, ["code-review-graph"]);
  await assert.rejects(() => readFile(path.join(cwd, ".codex", "agents", "math-genius.md"), "utf8"));
});
