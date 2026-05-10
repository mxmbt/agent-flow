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
  assert.match(stdout, /MCP config file is missing: \.mcp\.json/);
});

test("doctor warns when code-review-graph provider lacks the pack", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Doctor Warning");
  config.discovery.codeGraphProvider = "code-review-graph";
  await writeConfig(cwd, config);

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd });

  assert.match(stdout, /code-review-graph pack is not enabled/);
});

test("doctor summarizes config fields that still need review", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Needs Review");
  config.needsReview = ["checks.default", "dev.start.url"];
  await writeConfig(cwd, config);

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd });

  assert.match(stdout, /Needs review: checks\.default, dev\.start\.url/);
  assert.match(stdout, /Config needs review: checks\.default/);
  assert.match(stdout, /Config needs review: dev\.start\.url/);
});

test("doctor reports pack configuration errors", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Unknown Pack");
  config.packs = ["not-a-pack"];
  await writeConfig(cwd, config);

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd });

  assert.match(stdout, /Pack config issue at packs: not-a-pack unknown pack/);
});

test("doctor warns for optional MCP setup but exits successfully", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Optional MCP");
  config.mcp.servers.playwright = { enabled: true, required: false };
  await writeConfig(cwd, config);

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "doctor"], { cwd });

  assert.match(stdout, /Warnings:/);
  assert.match(stdout, /MCP config file is missing: \.mcp\.json/);
});

test("doctor --strict fails required MCP setup when command is missing", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Required MCP");
  config.mcp.servers.playwright = { enabled: true, required: true };
  await writeConfig(cwd, config);

  let stdout = "";
  try {
    await execFileAsync(process.execPath, [cliPath, "doctor", "--strict"], {
      cwd,
      env: {
        ...process.env,
        PATH: ""
      }
    });
    assert.fail("doctor --strict should fail when a required MCP command is missing");
  } catch (error) {
    stdout = String((error as NodeJS.ErrnoException & { stdout?: string }).stdout);
  }

  assert.match(stdout, /MCP server 'playwright' command is missing from PATH: npx/);
});

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-flow-doctor-"));
}

async function writeConfig(cwd: string, value: unknown): Promise<void> {
  const configDir = path.join(cwd, ".agent-flow");
  await mkdir(configDir, { recursive: true });
  await writeFile(path.join(configDir, "config.json"), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
