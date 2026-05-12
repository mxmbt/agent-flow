#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  compareMigrationTexts,
  formatSimilarityResult
} from "../dist/src/validation/migration-similarity.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const args = parseArgs(process.argv.slice(2));
const manifestPath = path.resolve(repoRoot, args.manifest ?? "docs/roadmap/migration-similarity-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const threshold = Number(args.threshold ?? manifest.threshold ?? 0.99);
const targetSimilarity = Number(args.targetSimilarity ?? manifest.targetSimilarity ?? 0.99);
const sourceRoot = args.sourceRoot ?? process.env.FINAI_REFERENCE_ROOT;
const targetRoot = path.resolve(repoRoot, args.targetRoot ?? manifest.targetRoot ?? ".");
const pairs = args.pairs.length > 0 ? args.pairs : manifest.pairs;

if (!Array.isArray(pairs) || pairs.length === 0) {
  throw new Error("No migration similarity pairs configured.");
}

if (!sourceRoot) {
  throw new Error("Set FINAI_REFERENCE_ROOT or pass --source-root <path>.");
}

let failed = 0;

for (const pair of pairs) {
  const pairThreshold = Number(pair.threshold ?? threshold);
  const pairTargetSimilarity = Number(pair.targetSimilarity ?? targetSimilarity);
  const sourcePath = path.resolve(sourceRoot, pair.source);
  const targetPath = path.resolve(targetRoot, pair.target);
  const source = await readFile(sourcePath, "utf8");
  const target = await readFile(targetPath, "utf8");
  const result = compareMigrationTexts(pair.id, source, target, {
    threshold: pairThreshold,
    targetSimilarity: pairTargetSimilarity,
    maxDiffLines: Number(args.maxDiffLines ?? 12)
  });

  console.log(formatSimilarityResult(result, path.relative(process.cwd(), sourcePath), path.relative(process.cwd(), targetPath)));
  console.log("");

  if (!result.passed) {
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`${failed} migration similarity check(s) failed.`);
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {
    pairs: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--manifest") {
      parsed.manifest = requiredValue(argv, index += 1, arg);
    } else if (arg === "--source-root") {
      parsed.sourceRoot = requiredValue(argv, index += 1, arg);
    } else if (arg === "--target-root") {
      parsed.targetRoot = requiredValue(argv, index += 1, arg);
    } else if (arg === "--threshold") {
      parsed.threshold = requiredValue(argv, index += 1, arg);
    } else if (arg === "--target-similarity") {
      parsed.targetSimilarity = requiredValue(argv, index += 1, arg);
    } else if (arg === "--max-diff-lines") {
      parsed.maxDiffLines = requiredValue(argv, index += 1, arg);
    } else if (arg === "--pair") {
      parsed.pairs.push(parsePair(requiredValue(argv, index += 1, arg)));
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

function requiredValue(argv, index, flag) {
  const value = argv[index];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${flag}`);
  }

  return value;
}

function parsePair(value) {
  const [idPart, pathsPart] = value.includes(":") ? value.split(/:(.*)/s, 2) : ["custom", value];
  const [source, target] = pathsPart.split("=");

  if (!source || !target) {
    throw new Error("--pair must use id:source=target");
  }

  return {
    id: idPart,
    source,
    target
  };
}

function printHelp() {
  console.log(`Usage:
  npm run check:migration-similarity -- --source-root <finai-root>
  FINAI_REFERENCE_ROOT=<finai-root> npm run check:migration-similarity
  node scripts/check-migration-similarity.mjs --source-root <finai-root> --pair FINAI-0007:.claude/agents/feature-developer.md=templates/canonical/agents/feature-developer.md.hbs

Options:
  --manifest <path>        JSON manifest with migration pairs
  --source-root <path>     Reference repository root; also read from FINAI_REFERENCE_ROOT
  --target-root <path>     Agent Flow repository root, defaults to current repository
  --threshold <number>     Minimum required similarity, defaults to manifest threshold or 0.99
  --target-similarity <n>  Aspirational similarity target, defaults to manifest targetSimilarity or 0.99
  --max-diff-lines <n>     Number of missing/added example lines to print
  --pair <id:src=target>   Add or override pairs from CLI`);
}
