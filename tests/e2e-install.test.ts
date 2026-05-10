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
const execOptions = { maxBuffer: 16 * 1024 * 1024 };

test("e2e empty repo install validates generated mirrors", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-e2e-empty-"));

  const init = await execFileAsync(process.execPath, [cliPath, "init"], { cwd, ...execOptions });
  assert.match(init.stdout, /Initialized Agent Flow/);
  assert.match(init.stdout, /package\.json/);
  assert.match(init.stdout, /code-review-graph pack as the default planning discovery provider/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.deepEqual(config.needsReview, []);
  assert.equal(config.discovery.codeGraphProvider, "code-review-graph");
  assert.deepEqual(config.packs, ["code-review-graph", "code-review-toolkit"]);
  assert.match(init.stdout, /\.codex\/agents\/prt-code-reviewer\.md/);
  const packageJson = JSON.parse(await readFile(path.join(cwd, "package.json"), "utf8"));
  assert.equal(packageJson.scripts.test, "node -e \"console.log('No project tests configured yet')\"");

  const validate = await execFileAsync(process.execPath, [cliPath, "validate", "--strict"], { cwd, ...execOptions });
  assert.match(validate.stdout, /Mirror parity: PASS/);

  const doctor = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd, ...execOptions });
  assert.match(doctor.stdout, /Needs review: none/);
  assert.match(doctor.stdout, /Planning discovery provider: code-review-graph/);
  assert.match(doctor.stdout, /No doctor warnings/);
  assert.doesNotMatch(doctor.stdout, /No code graph provider configured/);
});

test("e2e JS app install enables code project packs and validates", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-e2e-js-"));
  await writeFile(path.join(cwd, "package.json"), JSON.stringify({
    name: "agent-flow-e2e-js",
    scripts: {
      dev: "vite",
      test: "vitest run",
      "type-check": "tsc --noEmit"
    },
    devDependencies: {
      vite: "^6.0.0"
    }
  }, null, 2), "utf8");

  const init = await execFileAsync(process.execPath, [cliPath, "init"], { cwd, ...execOptions });
  assert.match(init.stdout, /code-review-graph pack as the default planning discovery provider/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.deepEqual(config.packs, ["code-review-graph", "code-review-toolkit"]);
  assert.equal(config.dev.start.url, "http://localhost:5173");

  const validate = await execFileAsync(process.execPath, [cliPath, "validate", "--strict"], { cwd, ...execOptions });
  assert.match(validate.stdout, /Mirror parity: PASS/);
});

test("e2e unmanaged conflict leaves user files untouched", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-e2e-conflict-"));
  await writeFile(path.join(cwd, "AGENTS.md"), "user-owned entrypoint\n", "utf8");

  const init = await execFileAsync(process.execPath, [cliPath, "init"], { cwd, ...execOptions });

  assert.match(init.stdout, /existing unmanaged files/);
  assert.equal(await readFile(path.join(cwd, "AGENTS.md"), "utf8"), "user-owned entrypoint\n");
});

test("e2e finai example profile installs as adapter config", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-e2e-finai-"));

  const init = await execFileAsync(process.execPath, [cliPath, "init", "--profile", "finai.example"], {
    cwd,
    ...execOptions
  });
  assert.match(init.stdout, /Applied finai\.example profile/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.deepEqual(config.packs, [
    "code-review-graph",
    "code-review-toolkit",
    "finance",
    "cloudflare-worker",
    "telegram",
    "webapp"
  ]);
  assert.equal(config.git.integrationBranch, "develop");
  assert.equal(config.git.releaseBranch, "master");

  const validate = await execFileAsync(process.execPath, [cliPath, "validate", "--strict"], { cwd, ...execOptions });
  assert.match(validate.stdout, /Mirror parity: PASS/);
});
