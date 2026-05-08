import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  ManagedFileConflictError,
  ManagedFilePathError,
  planManagedFiles,
  writeManagedFiles
} from "../src/renderer/conflict-policy.js";
import { parseManagedMetadata, renderManagedFile } from "../src/renderer/managed-blocks.js";
import { renderTemplate, TemplateRenderError } from "../src/renderer/render-template.js";

test("renderTemplate resolves dotted values and canonical partials", () => {
  const rendered = renderTemplate(
    "# {{ project.name }}\n\n{{> lifecycle}}\nChecks:\n{{ checks.default }}",
    {
      project: { name: "Example App" },
      lifecycle: { name: "PLAN -> IMPLEMENT" },
      checks: { default: ["npm test", "npm run type-check"] }
    },
    {
      lifecycle: "Lifecycle: {{ lifecycle.name }}"
    }
  );

  assert.equal(
    rendered,
    "# Example App\n\nLifecycle: PLAN -> IMPLEMENT\nChecks:\nnpm test\nnpm run type-check"
  );
});

test("renderTemplate reports missing values", () => {
  assert.throws(
    () => renderTemplate("Hello {{ project.name }}", { project: {} }),
    (error: unknown) => {
      assert.ok(error instanceof TemplateRenderError);
      assert.match(error.message, /project\.name/);
      return true;
    }
  );
});

test("renderManagedFile writes parseable metadata", () => {
  const content = renderManagedFile(
    { id: "root-agents", version: 1, source: "templates/targets/codex/AGENTS.md.hbs" },
    "# AGENTS\n"
  );

  assert.deepEqual(parseManagedMetadata(content), {
    id: "root-agents",
    version: 1,
    source: "templates/targets/codex/AGENTS.md.hbs"
  });
  assert.match(content, /^<!-- @agent-flow managed /);
});

test("planManagedFiles detects create, noop, managed update, and unmanaged conflict", async () => {
  const root = await tempDir();
  const managedSame = renderManagedFile({ id: "same", version: 1 }, "same\n");
  const managedOld = renderManagedFile({ id: "old", version: 1 }, "old\n");

  await writeText(root, "same.md", managedSame);
  await writeText(root, "update.md", managedOld);
  await writeText(root, "manual.md", "manual instructions\n");

  const plan = await planManagedFiles(root, [
    { path: "new.md", content: renderManagedFile({ id: "new", version: 1 }, "new\n") },
    { path: "same.md", content: managedSame },
    { path: "update.md", content: renderManagedFile({ id: "old", version: 1 }, "new\n") },
    { path: "manual.md", content: renderManagedFile({ id: "manual", version: 1 }, "generated\n") }
  ]);

  assert.deepEqual(plan.map((change) => [change.path, change.action]), [
    ["new.md", "create"],
    ["same.md", "noop"],
    ["update.md", "update"],
    ["manual.md", "conflict"]
  ]);
});

test("writeManagedFiles backs up unmanaged files before overwrite", async () => {
  const root = await tempDir();
  await writeText(root, "AGENTS.md", "manual instructions\n");

  const rendered = renderManagedFile({ id: "codex-root", version: 1 }, "# Generated\n");
  const plan = await writeManagedFiles(
    root,
    [{ path: "AGENTS.md", content: rendered }],
    { conflictMode: "backup", backupSuffix: ".agent-flow-backup" }
  );

  assert.equal(plan[0]?.action, "overwrite");
  assert.equal(await readFile(path.join(root, "AGENTS.md"), "utf8"), rendered);
  assert.equal(await readFile(path.join(root, "AGENTS.md.agent-flow-backup"), "utf8"), "manual instructions\n");
});

test("writeManagedFiles aborts all writes when unmanaged conflicts exist", async () => {
  const root = await tempDir();
  await writeText(root, "manual.md", "manual instructions\n");

  await assert.rejects(
    () => writeManagedFiles(root, [
      { path: "new.md", content: renderManagedFile({ id: "new", version: 1 }, "new\n") },
      { path: "manual.md", content: renderManagedFile({ id: "manual", version: 1 }, "generated\n") }
    ]),
    (error: unknown) => {
      assert.ok(error instanceof ManagedFileConflictError);
      assert.equal(error.conflicts[0]?.path, "manual.md");
      return true;
    }
  );

  await assert.rejects(
    () => readFile(path.join(root, "new.md"), "utf8"),
    /ENOENT/
  );
  assert.equal(await readFile(path.join(root, "manual.md"), "utf8"), "manual instructions\n");
});

test("managed file planning rejects paths outside the install root", async () => {
  const root = await tempDir();

  await assert.rejects(
    () => planManagedFiles(root, [
      { path: "../outside.md", content: renderManagedFile({ id: "outside", version: 1 }, "outside\n") }
    ]),
    (error: unknown) => {
      assert.ok(error instanceof ManagedFilePathError);
      assert.match(error.message, /\.\.\/outside\.md/);
      return true;
    }
  );
});

async function tempDir(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "agent-flow-renderer-"));
}

async function writeText(root: string, relativePath: string, content: string): Promise<void> {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}
