import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { createDefaultConfig } from "../src/config/defaults.js";
import { applyProfile } from "../src/config/profiles.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("generic profile is stack-neutral", () => {
  const base = createDefaultConfig("Generic Fixture");
  const profiled = applyProfile(base, "generic").config;

  assert.deepEqual(profiled.packs, []);
  assert.equal(profiled.git.integrationBranch, "main");
  assert.equal(profiled.git.releaseBranch, null);
});

test("webapp profile enables browser QA without a framework assumption", () => {
  const profiled = applyProfile(createDefaultConfig("Web Fixture"), "webapp").config;

  assert.deepEqual(profiled.packs, ["webapp"]);
  assert.match(profiled.quality.invariants.join("\n"), /responsive layout and accessibility/);
  assert.equal(profiled.dev.start.url, "http://localhost:3000");
  assert.deepEqual(profiled.needsReview, []);
});

test("finai example profile keeps project assumptions in adapter config", () => {
  const profiled = applyProfile(createDefaultConfig("Example"), "finai.example").config;

  assert.deepEqual(profiled.packs, [
    "finance",
    "cloudflare-worker",
    "telegram",
    "webapp",
    "code-review-toolkit",
    "code-review-graph"
  ]);
  assert.equal(profiled.git.integrationBranch, "develop");
  assert.equal(profiled.git.releaseBranch, "master");
  assert.equal(profiled.runtime.appRoot, "cf");
  assert.equal(profiled.dev.start.url, "http://localhost:8787");
});

test("init --profile webapp writes profile config and rendered pack outputs", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-profile-webapp-"));

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init", "--profile", "webapp"], { cwd });

  assert.match(stdout, /Applied webapp profile/);
  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.deepEqual(config.packs, ["code-review-graph", "code-review-toolkit", "webapp"]);
  assert.deepEqual(config.needsReview, []);
  assert.match(await readFile(path.join(cwd, ".mcp.json"), "utf8"), /playwright/);
  assert.match(await readFile(path.join(cwd, ".mcp.json"), "utf8"), /codeReviewGraph/);
});

test("render --profile finai.example includes adapter pack contributions without writing", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-profile-finai-"));

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "render", "--profile", "finai.example", "--json"], {
    cwd,
    maxBuffer: 16 * 1024 * 1024
  });
  const rendered = JSON.parse(stdout) as { files: Array<{ path: string; content: string }> };
  const byPath = new Map(rendered.files.map((file) => [file.path, file.content]));

  assert.ok(byPath.has(path.join(".codex", "agents", "math-genius.md")));
  assert.ok(byPath.has(path.join(".codex", "agents", "prt-code-reviewer.md")));
  assert.match(byPath.get("AGENTS.md") ?? "", /develop/);
  await assert.rejects(() => readFile(path.join(cwd, "AGENTS.md"), "utf8"));
});
