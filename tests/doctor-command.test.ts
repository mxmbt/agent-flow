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

test("doctor explains missing planning discovery provider", async () => {
  const cwd = await tempDir();

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd });

  assert.match(stdout, /Planning discovery provider: none; fallback=filesystem-search/);
  assert.match(stdout, /No code graph provider configured/);
  assert.match(stdout, /enable code-review-graph or configure a custom provider/);
});

test("doctor accepts configured code-review-graph provider when pack is enabled", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Doctor Fixture");
  config.discovery.codeGraphProvider = "code-review-graph";
  config.packs = ["code-review-graph"];
  await writeConfig(cwd, config);

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd });

  assert.match(stdout, /Planning discovery provider: code-review-graph/);
  assert.match(stdout, /Enabled packs: code-review-graph/);
  assert.match(stdout, /No doctor warnings/);
});

test("doctor warns when code-review-graph provider lacks the pack", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Doctor Warning");
  config.discovery.codeGraphProvider = "code-review-graph";
  await writeConfig(cwd, config);

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd });

  assert.match(stdout, /code-review-graph pack is not enabled/);
});

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-flow-doctor-"));
}

async function writeConfig(cwd: string, value: unknown): Promise<void> {
  const configDir = path.join(cwd, ".agent-flow");
  await mkdir(configDir, { recursive: true });
  await writeFile(path.join(configDir, "config.json"), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
