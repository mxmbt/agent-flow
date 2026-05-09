import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createDefaultConfig, type AgentFlowConfig } from "../src/config/defaults.js";
import { detectProjectConfig } from "../src/config/detect.js";
import { loadProjectConfig } from "../src/config/load.js";
import { ConfigValidationError } from "../src/config/schema.js";

test("loadProjectConfig returns defaults when config is missing", async () => {
  const cwd = await tempDir();
  const loaded = await loadProjectConfig(cwd);

  assert.equal(loaded.source, "defaults");
  assert.equal(loaded.config.project.name, path.basename(cwd));
  assert.equal(loaded.config.artifacts.architectureFile, "docs/ARCHITECTURE.md");
  assert.equal(loaded.config.artifacts.userIsolationArchitectureFile, "docs/ARCHITECTURE_MULTI_USER.md");
  assert.equal(loaded.config.artifacts.schedulingArchitectureFile, "docs/ARCHITECTURE_SCHEDULING.md");
  assert.deepEqual(loaded.config.checks.default, ["npm test"]);
});

test("loadProjectConfig validates a complete config file", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Config Fixture");
  config.git.integrationBranch = "develop";
  config.checks.default = ["npm test", "npm run type-check"];

  await writeConfig(cwd, config);

  const loaded = await loadProjectConfig(cwd);

  assert.equal(loaded.source, path.join(".agent-flow", "config.json"));
  assert.equal(loaded.config.project.name, "Config Fixture");
  assert.deepEqual(loaded.config.checks.default, ["npm test", "npm run type-check"]);
});

test("loadProjectConfig reports invalid branch names with issue paths", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Invalid Branch");
  config.git.integrationBranch = "bad branch";

  await writeConfig(cwd, config);

  await assert.rejects(
    () => loadProjectConfig(cwd),
    (error: unknown) => {
      assert.ok(error instanceof ConfigValidationError);
      assert.match(error.message, /git\.integrationBranch/);
      assert.match(error.message, /valid git branch/);
      return true;
    }
  );
});

test("loadProjectConfig reports invalid commands with issue paths", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Invalid Command");
  config.checks.default = ["npm test\nnpm run type-check"];

  await writeConfig(cwd, config);

  await assert.rejects(
    () => loadProjectConfig(cwd),
    (error: unknown) => {
      assert.ok(error instanceof ConfigValidationError);
      assert.match(error.message, /checks\.default\[0\]/);
      assert.match(error.message, /single-line shell command/);
      return true;
    }
  );
});

test("loadProjectConfig rejects artifact paths outside the project", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Invalid Path");
  config.artifacts.statusFile = "../outside.md";

  await writeConfig(cwd, config);

  await assert.rejects(
    () => loadProjectConfig(cwd),
    (error: unknown) => {
      assert.ok(error instanceof ConfigValidationError);
      assert.match(error.message, /artifacts\.statusFile/);
      assert.match(error.message, /inside the project/);
      return true;
    }
  );
});

test("detectProjectConfig proposes npm script checks and review markers", async () => {
  const cwd = await tempDir();
  await writeJson(path.join(cwd, "package.json"), {
    name: "detected-app",
    scripts: {
      dev: "vite",
      test: "vitest run",
      "type-check": "tsc --noEmit",
      lint: "eslint .",
      build: "vite build",
      generate: "drizzle-kit generate",
      "migrate:local": "wrangler d1 migrations apply --local"
    }
  });
  await writeFile(path.join(cwd, "package-lock.json"), "{}\n", "utf8");

  const detected = await detectProjectConfig(cwd);

  assert.equal(detected.packageManager, "npm");
  assert.equal(detected.config.project.name, "detected-app");
  assert.deepEqual(detected.config.checks.default, ["npm run test", "npm run type-check"]);
  assert.equal(detected.config.checks.optional.lint, "npm run lint");
  assert.equal(detected.config.checks.optional.build, "npm run build");
  assert.deepEqual(detected.config.checks.changed.schema, ["npm run generate", "npm run migrate:local"]);
  assert.equal(detected.config.dev.start.command, "npm run dev");
  assert.equal(detected.config.dev.start.url, "http://localhost:3000");
  assert.ok(detected.needsReview.includes("project.taskPrefix"));
  assert.ok(detected.needsReview.includes("git.integrationBranch"));
  assert.ok(detected.needsReview.includes("dev.start.url"));
});

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-flow-config-"));
}

async function writeConfig(cwd: string, config: AgentFlowConfig): Promise<void> {
  const configDir = path.join(cwd, ".agent-flow");
  await mkdir(configDir, { recursive: true });
  await writeJson(path.join(configDir, "config.json"), config);
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
