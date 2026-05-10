import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("sync --diff previews generated target files without writing", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-sync-command-"));

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "sync", "--diff"], { cwd });

  assert.match(stdout, /Agent Flow sync preview\. No files were written\./);
  assert.match(stdout, /Plan:/);
  assert.match(stdout, /create\s+AGENTS\.md/);
  assert.match(stdout, /create\s+\.claude\/agents\/feature-developer\.md/);
  assert.match(stdout, /Diff preview:/);
  assert.match(stdout, /\+ <!-- @agent-flow managed/);

  await assert.rejects(
    () => access(path.join(cwd, "AGENTS.md")),
    /ENOENT/
  );
});
