import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("render --json prints generated files without writing", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-render-command-"));

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "render", "--json"], { cwd });
  const rendered = JSON.parse(stdout) as { files: Array<{ path: string; content: string }> };

  assert.ok(rendered.files.some((file) => file.path === "AGENTS.md"));
  assert.ok(rendered.files.some((file) => file.path === path.join(".codex", "agents", "feature-developer.md")));
  await assert.rejects(() => readFile(path.join(cwd, "AGENTS.md"), "utf8"));
});

test("update restores stale managed files", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-update-command-"));
  await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  const agentsPath = path.join(cwd, "AGENTS.md");
  const original = await readFile(agentsPath, "utf8");
  await writeFile(agentsPath, original.replace("Agent Flow Canonical Contract", "Agent Flow Drifted Contract"), "utf8");

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "update"], { cwd });

  assert.match(stdout, /Updated Agent Flow managed files/);
  assert.equal(await readFile(agentsPath, "utf8"), original);
});

test("upgrade --dry-run previews managed file plan", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-upgrade-command-"));

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "upgrade", "--dry-run", "--from", "0.0.0"], {
    cwd
  });

  assert.match(stdout, /Agent Flow upgrade preview from 0\.0\.0\. No files were written/);
  assert.match(stdout, /create\s+AGENTS\.md/);
});
