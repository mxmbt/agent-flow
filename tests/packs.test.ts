import assert from "node:assert/strict";
import test from "node:test";
import { builtinPacks } from "../src/packs/builtin.js";
import { composePacks, PackCompositionError, type PackManifest } from "../src/packs/manifest.js";

test("composePacks supports an empty core install", () => {
  const composed = composePacks(builtinPacks, []);

  assert.deepEqual(composed.packs, []);
  assert.deepEqual(composed.agents, []);
  assert.deepEqual(composed.validators, []);
  assert.deepEqual(composed.checks.default, []);
  assert.equal(composed.quality.domainExpert, null);
});

test("composePacks composes finance, cloudflare-worker, and telegram deterministically", () => {
  const composed = composePacks(builtinPacks, ["finance", "cloudflare-worker", "telegram"]);

  assert.deepEqual(composed.packs, ["finance", "cloudflare-worker", "telegram"]);
  assert.deepEqual(composed.agents, ["math-genius"]);
  assert.deepEqual(composed.validators, ["finance-invariants", "cloudflare-bindings", "telegram-copy"]);
  assert.equal(composed.quality.domainExpert, "math-genius");
  assert.deepEqual(composed.checks.changed.schema, ["npm run generate", "npm run migrate:local"]);
  assert.deepEqual(composed.deploymentImpactSurfaces, [
    "worker bindings",
    "D1 migrations",
    "R2 buckets",
    "KV namespaces",
    "Telegram webhook",
    "bot secrets"
  ]);
});

test("composePacks rejects unknown and duplicate pack names", () => {
  assert.throws(
    () => composePacks(builtinPacks, ["finance", "missing", "finance"]),
    (error: unknown) => {
      assert.ok(error instanceof PackCompositionError);
      assert.match(error.message, /missing packs: unknown pack/);
      assert.match(error.message, /pack list contains duplicates/);
      return true;
    }
  );
});

test("composePacks rejects duplicate validation hooks", () => {
  const packs: PackManifest[] = [
    {
      name: "a",
      version: 1,
      description: "A",
      contributes: { validators: ["same-hook"] }
    },
    {
      name: "b",
      version: 1,
      description: "B",
      contributes: { validators: ["same-hook"] }
    }
  ];

  assert.throws(
    () => composePacks(packs, ["a", "b"]),
    (error: unknown) => {
      assert.ok(error instanceof PackCompositionError);
      assert.match(error.message, /validators\.same-hook/);
      return true;
    }
  );
});

test("composePacks rejects competing domain experts", () => {
  const packs: PackManifest[] = [
    {
      name: "finance",
      version: 1,
      description: "Finance",
      contributes: { quality: { domainExpert: "math-genius" } }
    },
    {
      name: "healthcare",
      version: 1,
      description: "Healthcare",
      contributes: { quality: { domainExpert: "clinical-reviewer" } }
    }
  ];

  assert.throws(
    () => composePacks(packs, ["finance", "healthcare"]),
    (error: unknown) => {
      assert.ok(error instanceof PackCompositionError);
      assert.match(error.message, /quality\.domainExpert/);
      return true;
    }
  );
});
