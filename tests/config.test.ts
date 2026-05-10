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
  assert.equal(loaded.config.artifacts.backlogFile, "docs/tasks.md");
  assert.equal(loaded.config.artifacts.uiUxSpecificationFile, "docs/UI-UX-SPECIFICATION.md");
  assert.equal(loaded.config.artifacts.designSystemFile, "docs/design/DESIGN-SYSTEM.md");
  assert.equal(loaded.config.artifacts.uxWritingGuideFile, "docs/design/UX-WRITING-GUIDE.md");
  assert.equal(loaded.config.artifacts.qaSharedAccountFile, "docs/testing/QA-SHARED-ACCOUNT.md");
  assert.equal(loaded.config.discovery.codeGraphProvider, "none");
  assert.equal(loaded.config.discovery.fallback, "filesystem-search");
  assert.deepEqual(loaded.config.checks.default, ["npm test"]);
  assert.equal(loaded.config.checks.focusedTestCommand, null);
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

test("loadProjectConfig accepts older config files without newly added optional fields", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Legacy Config");
  delete (config.checks as Partial<AgentFlowConfig["checks"]>).focusedTestCommand;
  delete (config.artifacts as Partial<AgentFlowConfig["artifacts"]>).qaSharedAccountFile;

  const configDir = path.join(cwd, ".agent-flow");
  await mkdir(configDir, { recursive: true });
  await writeJson(path.join(configDir, "config.json"), config);

  const loaded = await loadProjectConfig(cwd);

  assert.equal(loaded.config.project.name, "Legacy Config");
  assert.equal(loaded.config.checks.focusedTestCommand, undefined);
  assert.equal(loaded.config.artifacts.qaSharedAccountFile, undefined);
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

test("loadProjectConfig requires a custom discovery provider description", async () => {
  const cwd = await tempDir();
  const config = createDefaultConfig("Invalid Discovery");
  config.discovery.codeGraphProvider = "custom";

  await writeConfig(cwd, config);

  await assert.rejects(
    () => loadProjectConfig(cwd),
    (error: unknown) => {
      assert.ok(error instanceof ConfigValidationError);
      assert.match(error.message, /discovery\.customProvider/);
      return true;
    }
  );
});

test("detectProjectConfig proposes npm script checks without review blockers", async () => {
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
  assert.equal(detected.config.discovery.codeGraphProvider, "code-review-graph");
  assert.deepEqual(detected.config.packs, ["code-review-graph", "code-review-toolkit"]);
  assert.deepEqual(detected.config.checks.default, ["npm run test", "npm run type-check"]);
  assert.equal(detected.config.checks.focusedTestCommand, "npm run test -- <test-file>");
  assert.equal(detected.config.checks.optional.lint, "npm run lint");
  assert.equal(detected.config.checks.optional.build, "npm run build");
  assert.deepEqual(detected.config.checks.changed.schema, ["npm run generate", "npm run migrate:local"]);
  assert.equal(detected.config.dev.start.command, "npm run dev");
  assert.equal(detected.config.dev.start.url, "http://localhost:5173");
  assert.deepEqual(detected.needsReview, []);
  assert.deepEqual(detected.config.needsReview, detected.needsReview);
  assert.ok(detected.evidence.some((line) => /Detected focused test command: npm run test -- <test-file>/.test(line)));
  assert.ok(detected.evidence.some((line) => /code-review-graph pack as the default planning discovery provider/.test(line)));
  assert.ok(detected.evidence.some((line) => /code-review-toolkit pack as core manual review tooling/.test(line)));
});

test("detectProjectConfig enables nextjs pack for Next.js projects", async () => {
  const cwd = await tempDir();
  await writeJson(path.join(cwd, "package.json"), {
    name: "next-app",
    scripts: {
      dev: "next dev",
      test: "vitest run"
    },
    dependencies: {
      next: "^15.0.0",
      react: "^19.0.0"
    }
  });

  const detected = await detectProjectConfig(cwd);

  assert.deepEqual(detected.config.packs, ["code-review-graph", "code-review-toolkit", "nextjs"]);
  assert.equal(detected.config.dev.start.url, "http://localhost:3000");
  assert.ok(detected.evidence.some((line) => /enabled the nextjs pack/.test(line)));
});

test("detectProjectConfig proposes pnpm commands", async () => {
  const cwd = await tempDir();
  await writeJson(path.join(cwd, "package.json"), {
    name: "pnpm-app",
    scripts: {
      dev: "vite --host 0.0.0.0",
      test: "vitest run",
      "check-types": "tsc --noEmit"
    },
    devDependencies: {
      vite: "^6.0.0"
    }
  });
  await writeFile(path.join(cwd, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n", "utf8");

  const detected = await detectProjectConfig(cwd);

  assert.equal(detected.packageManager, "pnpm");
  assert.deepEqual(detected.config.checks.default, ["pnpm run test", "pnpm run check-types"]);
  assert.equal(detected.config.checks.focusedTestCommand, "pnpm run test -- <test-file>");
  assert.equal(detected.config.dev.start.command, "pnpm run dev");
  assert.equal(detected.config.dev.start.url, "http://localhost:5173");
});

test("detectProjectConfig proposes Python checks", async () => {
  const cwd = await tempDir();
  await writeFile(path.join(cwd, "pyproject.toml"), "[project]\nname = \"python-app\"\n", "utf8");

  const detected = await detectProjectConfig(cwd);

  assert.equal(detected.packageManager, "python");
  assert.equal(detected.hasPackageJson, false);
  assert.equal(detected.config.discovery.codeGraphProvider, "code-review-graph");
  assert.deepEqual(detected.config.packs, ["code-review-graph", "code-review-toolkit"]);
  assert.deepEqual(detected.config.checks.default, ["python -m pytest"]);
  assert.equal(detected.config.checks.focusedTestCommand, "python -m pytest <test-file>");
  assert.deepEqual(detected.needsReview, []);
});

test("detectProjectConfig gives empty repositories starter defaults without review blockers", async () => {
  const cwd = await tempDir();

  const detected = await detectProjectConfig(cwd);

  assert.equal(detected.packageManager, null);
  assert.equal(detected.hasPackageJson, false);
  assert.equal(detected.config.discovery.codeGraphProvider, "code-review-graph");
  assert.deepEqual(detected.config.packs, ["code-review-graph", "code-review-toolkit"]);
  assert.deepEqual(detected.config.checks.default, ["npm run test"]);
  assert.equal(detected.config.checks.focusedTestCommand, "npm run test -- <test-file>");
  assert.deepEqual(detected.needsReview, []);
  assert.deepEqual(detected.config.needsReview, detected.needsReview);
});

test("detectProjectConfig ignores npm init placeholder tests", async () => {
  const cwd = await tempDir();
  await writeJson(path.join(cwd, "package.json"), {
    name: "starter-app",
    scripts: {
      test: "echo \"Error: no test specified\" && exit 1"
    }
  });

  const detected = await detectProjectConfig(cwd);

  assert.equal(detected.hasPackageJson, true);
  assert.equal(detected.config.discovery.codeGraphProvider, "code-review-graph");
  assert.deepEqual(detected.config.packs, ["code-review-graph", "code-review-toolkit"]);
  assert.deepEqual(detected.config.checks.default, ["node -e \"console.log('No project tests configured yet')\""]);
  assert.equal(detected.config.checks.focusedTestCommand, null);
  assert.deepEqual(detected.needsReview, []);
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
