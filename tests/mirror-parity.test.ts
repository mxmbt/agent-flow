import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { createDefaultConfig } from "../src/config/defaults.js";
import { builtinPacks } from "../src/packs/builtin.js";
import { composePacks } from "../src/packs/manifest.js";
import { renderTargetFiles } from "../src/renderer/target-renderer.js";
import { validateRenderedMirrorParity } from "../src/validation/mirror-parity.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const templateRoot = path.join(repoRoot, "templates");
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("rendered Claude and Codex mirrors stay semantically identical", async () => {
  const config = createDefaultConfig("Parity Fixture");
  config.checks.default = ["npm test", "npm run type-check"];
  config.checks.focusedTestCommand = "npm test -- <test-file>";
  config.dev.start.url = "http://localhost:3000";
  config.discovery.codeGraphProvider = "code-review-graph";
  config.git.integrationBranch = "develop";
  const packs = composePacks(builtinPacks, [
    "finance",
    "cloudflare-worker",
    "code-review-toolkit",
    "nextjs",
    "design",
    "code-review-graph"
  ]);

  const files = await renderTargetFiles(config, packs, { templateRoot, version: 11 });
  const result = validateRenderedMirrorParity(files);

  assert.equal(result.passed, true, result.issues.map((issue) => issue.message).join("\n"));
  assert.ok(result.checkedPairs > 200);
});

test("mirror parity reports drift after an installed managed file is edited", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "agent-flow-mirror-parity-"));

  await execFileAsync(process.execPath, [cliPath, "sync"], { cwd });

  const agentsPath = path.join(cwd, "AGENTS.md");
  const original = await readFile(agentsPath, "utf8");
  await writeFile(agentsPath, original.replace("Agent Flow Canonical Contract", "Agent Flow Diverged Contract"), "utf8");

  let stdout = "";
  try {
    await execFileAsync(process.execPath, [cliPath, "validate", "--strict"], { cwd });
    assert.fail("validate --strict should fail after managed file drift");
  } catch (error) {
    stdout = String((error as NodeJS.ErrnoException & { stdout?: string }).stdout);
  }

  assert.match(stdout, /Mirror parity: FAIL/);
  assert.match(stdout, /stale-installed: AGENTS\.md/);
  assert.match(stdout, /content-drift: CLAUDE\.md <-> AGENTS\.md/);
});
