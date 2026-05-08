import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createDefaultConfig } from "../src/config/defaults.js";
import { builtinPacks } from "../src/packs/builtin.js";
import { composePacks } from "../src/packs/manifest.js";
import { buildCanonicalContext } from "../src/renderer/canonical-context.js";
import { renderTemplate } from "../src/renderer/render-template.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");
const canonicalRoot = path.join(repoRoot, "templates", "canonical");

test("canonical lifecycle contract renders from config and pack composition", async () => {
  const config = createDefaultConfig("Portable App");
  config.project.taskPrefix = "APP";
  config.project.taskIdPattern = "APP-[0-9]+";
  config.git.integrationBranch = "main";
  config.checks.default = ["npm test", "npm run type-check"];
  config.dev.start.command = "npm run dev";
  config.dev.start.url = "http://localhost:3000";

  const packs = composePacks(builtinPacks, ["finance", "cloudflare-worker", "telegram"]);
  const rendered = renderTemplate(
    await template("index"),
    buildCanonicalContext(config, packs),
    {
      lifecycle: await template("lifecycle"),
      "artifact-contracts": await template("artifact-contracts"),
      "quality-gates": await template("quality-gates"),
      "qa-delivery": await template("qa-delivery"),
      "state-report-contracts": await template("state-report-contracts")
    }
  );

  assert.match(rendered, /PLAN -> \[ARCHITECTURE if RED\] -> IMPLEMENTATION -> SIMPLIFY -> REVIEW/);
  assert.match(rendered, /## Phase Contracts/);
  assert.match(rendered, /Status snapshot/);
  assert.match(rendered, /PROJECT_STATUS\.md/);
  assert.match(rendered, /## Canonical Quality Gates|# Canonical Quality Gates/);
  assert.match(rendered, /math-genius/);
  assert.match(rendered, /finance-invariants/);
  assert.match(rendered, /cloudflare-bindings/);
  assert.match(rendered, /telegram-copy/);
  assert.match(rendered, /schema\s+- `npm run generate`\s+- `npm run migrate:local`/s);
  assert.match(rendered, /Start command: `npm run dev`/);
  assert.match(rendered, /Runtime URL: `http:\/\/localhost:3000`/);
  assert.match(rendered, /State Fields By Phase/);
  assert.match(rendered, /Agent Report Fields/);
  assert.match(rendered, /DELIVERY \| `commit`, `pr`, `walkthroughFile`/);
  assert.doesNotMatch(rendered, /FinAI|FINAI|ZNAI|cf &&|docs\/sprints|organizationId/);
});

test("canonical context includes pack-contributed checks", async () => {
  const config = createDefaultConfig("Pack Checks");
  const packs = composePacks(builtinPacks, ["cloudflare-worker"]);
  const rendered = renderTemplate(
    await template("lifecycle"),
    buildCanonicalContext(config, packs)
  );

  assert.match(rendered, /## Changed-Scope Checks/);
  assert.match(rendered, /schema\s+- `npm run generate`\s+- `npm run migrate:local`/s);
});

test("canonical contract renders with zero packs", async () => {
  const config = createDefaultConfig("Core Only");
  const packs = composePacks(builtinPacks, []);
  const rendered = renderTemplate(
    await template("quality-gates"),
    buildCanonicalContext(config, packs)
  );

  assert.match(rendered, /Domain Expert\s+none configured/s);
  assert.match(rendered, /Pack Validators\s+- none configured/s);
});

async function template(name: string): Promise<string> {
  return readFile(path.join(canonicalRoot, `${name}.md.hbs`), "utf8");
}
