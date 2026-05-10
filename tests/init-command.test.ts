import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("init creates config, starter docs, and target agent files in a bare project", async () => {
  const cwd = await tempDir();

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  assert.match(stdout, /Initialized Agent Flow/);
  assert.match(stdout, /\.agent-flow\/config\.json/);
  assert.match(stdout, /docs\/ARCHITECTURE\.md/);
  assert.match(stdout, /docs\/ARCHITECTURE_MULTI_USER\.md/);
  assert.match(stdout, /docs\/ARCHITECTURE_SCHEDULING\.md/);
  assert.match(stdout, /docs\/tasks\.md/);
  assert.match(stdout, /docs\/UI-UX-SPECIFICATION\.md/);
  assert.match(stdout, /docs\/design\/DESIGN-SYSTEM\.md/);
  assert.match(stdout, /docs\/design\/UX-WRITING-GUIDE\.md/);
  assert.match(stdout, /docs\/testing\/QA-SHARED-ACCOUNT\.md/);
  assert.match(stdout, /docs\/templates\/agent-report-template\.md/);
  assert.match(stdout, /docs\/templates\/design-document-template\.md/);
  assert.match(stdout, /docs\/templates\/qa-report-template\.md/);
  assert.match(stdout, /docs\/templates\/state-template\.json/);
  assert.match(stdout, /docs\/templates\/walkthrough-template\.md/);
  assert.match(stdout, /\.claude\/agents\/architect\.md/);
  assert.match(stdout, /\.codex\/README\.md/);
  assert.match(stdout, /\.codex\/agents\/architect\.md/);
  assert.match(stdout, /\.codex\/agents\/code-simplifier\.md/);
  assert.match(stdout, /\.codex\/agents\/deep-reviewer\.md/);
  assert.match(stdout, /\.codex\/agents\/findings-arbiter\.md/);
  assert.match(stdout, /\.codex\/agents\/paranoid-architect\.md/);
  assert.match(stdout, /\.codex\/agents\/performance-expert\.md/);
  assert.match(stdout, /\.codex\/agents\/product-manager\.md/);
  assert.match(stdout, /\.codex\/agents\/ux-expert\.md/);
  assert.match(stdout, /\.codex\/guides\/gan-protocol\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/math-genius\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/prt-code-reviewer\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/prt-code-simplifier\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/prt-comment-analyzer\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/prt-pr-test-analyzer\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/prt-silent-failure-hunter\.md/);
  assert.doesNotMatch(stdout, /\.codex\/agents\/prt-type-design-analyzer\.md/);
  assert.doesNotMatch(stdout, /\.codex\/guides\/code-review-graph-usage\.md/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.ok(config.needsReview.includes("project.taskPrefix"));
  assert.ok(config.needsReview.includes("git.integrationBranch"));
  assert.equal(config.artifacts.architectureFile, "docs/ARCHITECTURE.md");
  assert.equal(config.artifacts.userIsolationArchitectureFile, "docs/ARCHITECTURE_MULTI_USER.md");
  assert.equal(config.artifacts.schedulingArchitectureFile, "docs/ARCHITECTURE_SCHEDULING.md");
  assert.equal(config.artifacts.backlogFile, "docs/tasks.md");
  assert.equal(config.artifacts.uiUxSpecificationFile, "docs/UI-UX-SPECIFICATION.md");
  assert.equal(config.artifacts.designSystemFile, "docs/design/DESIGN-SYSTEM.md");
  assert.equal(config.artifacts.uxWritingGuideFile, "docs/design/UX-WRITING-GUIDE.md");
  assert.equal(config.artifacts.qaSharedAccountFile, "docs/testing/QA-SHARED-ACCOUNT.md");

  const architecture = await readFile(path.join(cwd, "docs", "ARCHITECTURE.md"), "utf8");
  assert.match(architecture, /# Architecture/);
  assert.match(architecture, /@agent-flow managed/);

  const architectAgent = await readFile(path.join(cwd, ".codex", "agents", "architect.md"), "utf8");
  assert.match(architectAgent, /`docs\/ARCHITECTURE\.md`/);
  assert.match(architectAgent, /user-isolation work -> `docs\/ARCHITECTURE_MULTI_USER\.md`/);
  assert.match(architectAgent, /scheduling or asynchronous work -> `docs\/ARCHITECTURE_SCHEDULING\.md`/);

  const productManager = await readFile(path.join(cwd, ".codex", "agents", "product-manager.md"), "utf8");
  assert.match(productManager, /`docs\/tasks\.md`/);

  const uxExpert = await readFile(path.join(cwd, ".codex", "agents", "ux-expert.md"), "utf8");
  assert.match(uxExpert, /`docs\/UI-UX-SPECIFICATION\.md`/);
  assert.match(uxExpert, /`docs\/design\/DESIGN-SYSTEM\.md`/);
  assert.match(uxExpert, /`docs\/design\/UX-WRITING-GUIDE\.md`/);

  const qaExpert = await readFile(path.join(cwd, ".codex", "agents", "qa-expert.md"), "utf8");
  assert.match(qaExpert, /`docs\/testing\/QA-SHARED-ACCOUNT\.md`/);
  assert.match(qaExpert, /Use the configured local runtime URL/);

  const codexReadme = await readFile(path.join(cwd, ".codex", "README.md"), "utf8");
  assert.match(codexReadme, /Codex-side target layer generated by Agent Flow/);
  assert.doesNotMatch(codexReadme, /FinAI|semantic source of truth/);

  const qaReportTemplate = await readFile(path.join(cwd, "docs", "templates", "qa-report-template.md"), "utf8");
  assert.match(qaReportTemplate, /npm test/);
  assert.doesNotMatch(qaReportTemplate, /cd cf/);

  const designDocumentTemplate = await readFile(path.join(cwd, "docs", "templates", "design-document-template.md"), "utf8");
  assert.match(designDocumentTemplate, /### Domain Correctness/);
  assert.doesNotMatch(designDocumentTemplate, /Financial Correctness/);

  const stateTemplate = JSON.parse(await readFile(path.join(cwd, "docs", "templates", "state-template.json"), "utf8"));
  assert.equal(stateTemplate.project, config.project.name);
  assert.equal(stateTemplate.diffBase, "main");
  assert.equal(stateTemplate.reports.delivery.walkthroughFile, "docs/walkthroughs/agents/<taskId>.md");
  assert.equal(stateTemplate.reports.delivery.releaseAnnouncementAdmins, "");
  assert.equal(stateTemplate.reports.delivery.releaseAnnouncementUsers, "");
  assert.equal("releaseAnnouncementInternal" in stateTemplate.reports.delivery, false);
  assert.equal("releaseAnnouncementExternal" in stateTemplate.reports.delivery, false);
});

test("init enables code-review-graph as default discovery provider for detected code projects", async () => {
  const cwd = await tempDir();
  await writeFile(path.join(cwd, "package.json"), JSON.stringify({
    name: "code-project",
    scripts: {
      test: "vitest run"
    }
  }, null, 2), "utf8");

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  assert.match(stdout, /Detected a code project and no existing Agent Flow config; enabled the code-review-graph pack/);
  assert.match(stdout, /Enabled the code-review-toolkit pack as recommended manual review tooling/);
  assert.match(stdout, /\.codex\/guides\/code-review-graph-usage\.md/);
  assert.match(stdout, /\.codex\/agents\/prt-code-reviewer\.md/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.equal(config.discovery.codeGraphProvider, "code-review-graph");
  assert.deepEqual(config.packs, ["code-review-graph", "code-review-toolkit"]);

  const guide = await readFile(path.join(cwd, ".codex", "guides", "code-review-graph-usage.md"), "utf8");
  assert.match(guide, /Graph-First/);
});

test("init dry-run does not write files", async () => {
  const cwd = await tempDir();

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init", "--dry-run"], { cwd });

  assert.match(stdout, /No files were written/);
  await assert.rejects(() => readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
});

test("init reports unmanaged conflicts without overwriting user files", async () => {
  const cwd = await tempDir();
  await writeFile(path.join(cwd, "AGENTS.md"), "user agents entrypoint\n", "utf8");

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  assert.match(stdout, /existing unmanaged files/);
  assert.match(stdout, /conflict\s+AGENTS\.md/);
  assert.equal(await readFile(path.join(cwd, "AGENTS.md"), "utf8"), "user agents entrypoint\n");
  await assert.rejects(() => readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
});

test("init reuses existing project documents instead of creating duplicate artifact paths", async () => {
  const cwd = await tempDir();
  await mkdir(path.join(cwd, "docs", "architecture"), { recursive: true });
  await mkdir(path.join(cwd, "docs", "design"), { recursive: true });
  await mkdir(path.join(cwd, "docs", "product"), { recursive: true });
  await writeFile(path.join(cwd, "STATUS.md"), "status\n", "utf8");
  await writeFile(path.join(cwd, "ROADMAP.md"), "roadmap\n", "utf8");
  await writeFile(path.join(cwd, "docs", "product", "README.md"), "product\n", "utf8");
  await writeFile(path.join(cwd, "docs", "architecture", "README.md"), "architecture\n", "utf8");
  await writeFile(path.join(cwd, "docs", "SECURITY.md"), "security\n", "utf8");
  await writeFile(path.join(cwd, "docs", "JOBS.md"), "jobs\n", "utf8");
  await writeFile(path.join(cwd, "docs", "backlog.md"), "backlog\n", "utf8");
  await writeFile(path.join(cwd, "docs", "UX.md"), "ux\n", "utf8");
  await writeFile(path.join(cwd, "docs", "design", "README.md"), "design system\n", "utf8");
  await mkdir(path.join(cwd, "docs", "content"), { recursive: true });
  await mkdir(path.join(cwd, "docs", "qa"), { recursive: true });
  await writeFile(path.join(cwd, "docs", "content", "UX-WRITING-GUIDE.md"), "copy\n", "utf8");
  await writeFile(path.join(cwd, "docs", "qa", "shared-account.md"), "qa account\n", "utf8");

  const { stdout } = await execFileAsync(process.execPath, [cliPath, "init"], { cwd });

  assert.match(stdout, /Detected existing artifact for artifacts\.statusFile: STATUS\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.roadmapFile: ROADMAP\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.productFile: docs\/product\/README\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.architectureFile: docs\/architecture\/README\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.userIsolationArchitectureFile: docs\/SECURITY\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.schedulingArchitectureFile: docs\/JOBS\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.backlogFile: docs\/backlog\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.uiUxSpecificationFile: docs\/UX\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.designSystemFile: docs\/design\/README\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.uxWritingGuideFile: docs\/content\/UX-WRITING-GUIDE\.md/);
  assert.match(stdout, /Detected existing artifact for artifacts\.qaSharedAccountFile: docs\/qa\/shared-account\.md/);

  const config = JSON.parse(await readFile(path.join(cwd, ".agent-flow", "config.json"), "utf8"));
  assert.equal(config.artifacts.statusFile, "STATUS.md");
  assert.equal(config.artifacts.roadmapFile, "ROADMAP.md");
  assert.equal(config.artifacts.productFile, "docs/product/README.md");
  assert.equal(config.artifacts.architectureFile, "docs/architecture/README.md");
  assert.equal(config.artifacts.userIsolationArchitectureFile, "docs/SECURITY.md");
  assert.equal(config.artifacts.schedulingArchitectureFile, "docs/JOBS.md");
  assert.equal(config.artifacts.backlogFile, "docs/backlog.md");
  assert.equal(config.artifacts.uiUxSpecificationFile, "docs/UX.md");
  assert.equal(config.artifacts.designSystemFile, "docs/design/README.md");
  assert.equal(config.artifacts.uxWritingGuideFile, "docs/content/UX-WRITING-GUIDE.md");
  assert.equal(config.artifacts.qaSharedAccountFile, "docs/qa/shared-account.md");

  const architectAgent = await readFile(path.join(cwd, ".codex", "agents", "architect.md"), "utf8");
  assert.match(architectAgent, /`docs\/architecture\/README\.md`/);
  assert.match(architectAgent, /user-isolation work -> `docs\/SECURITY\.md`/);
  assert.match(architectAgent, /scheduling or asynchronous work -> `docs\/JOBS\.md`/);

  const uxExpert = await readFile(path.join(cwd, ".codex", "agents", "ux-expert.md"), "utf8");
  assert.match(uxExpert, /`docs\/UX\.md`/);
  assert.match(uxExpert, /`docs\/design\/README\.md`/);
  assert.match(uxExpert, /`docs\/content\/UX-WRITING-GUIDE\.md`/);

  const qaExpert = await readFile(path.join(cwd, ".codex", "agents", "qa-expert.md"), "utf8");
  assert.match(qaExpert, /`docs\/qa\/shared-account\.md`/);

  await assert.rejects(() => readFile(path.join(cwd, "docs", "ARCHITECTURE.md"), "utf8"));
  assert.equal(await readFile(path.join(cwd, "STATUS.md"), "utf8"), "status\n");
});

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-flow-init-"));
}
