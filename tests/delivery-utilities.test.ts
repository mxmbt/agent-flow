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

test("delivery state helper supports a main-only project with worktree parking disabled", async () => {
  const fixture = await mkdtemp(path.join(os.tmpdir(), "agent-flow-delivery-utilities-"));
  const remote = path.join(fixture, "remote.git");
  const cwd = path.join(fixture, "work");

  await execFileAsync("git", ["init", "--bare", remote]);
  await execFileAsync("git", ["init", cwd]);
  await execFileAsync("git", ["-C", cwd, "config", "user.email", "agent-flow@example.test"]);
  await execFileAsync("git", ["-C", cwd, "config", "user.name", "Agent Flow Test"]);
  await writeFile(path.join(cwd, "README.md"), "# Fixture\n", "utf8");
  await execFileAsync("git", ["-C", cwd, "add", "README.md"]);
  await execFileAsync("git", ["-C", cwd, "commit", "-m", "initial"]);
  await execFileAsync("git", ["-C", cwd, "branch", "-M", "main"]);
  await execFileAsync("git", ["-C", cwd, "remote", "add", "origin", remote]);
  await execFileAsync("git", ["-C", cwd, "push", "-u", "origin", "main"]);

  const config = createDefaultConfig("Main Only Fixture");
  config.git.integrationBranch = "main";
  config.git.releaseBranch = null;
  config.git.worktreeParking = false;
  await mkdir(path.join(cwd, ".agent-flow"), { recursive: true });
  await writeFile(path.join(cwd, ".agent-flow", "config.json"), JSON.stringify(config, null, 2), "utf8");

  await execFileAsync(process.execPath, [cliPath, "sync"], { cwd });

  const report = await execFileAsync("bash", [path.join(cwd, "scripts", "report-delivery-state.sh"), "--ref", "HEAD"], {
    cwd
  });
  assert.match(report.stdout, /Integration \(main\): merged/);
  assert.match(report.stdout, /Release \(none configured\): not configured/);
  assert.match(report.stdout, /Local worktree hygiene: skipped/);

  const parking = await execFileAsync("bash", [path.join(cwd, "scripts", "park-worktrees.sh")], { cwd });
  assert.match(parking.stdout, /Worktree parking is disabled by Agent Flow config/);
});
