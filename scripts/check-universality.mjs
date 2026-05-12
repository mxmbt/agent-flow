#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  formatUniversalityFinding,
  scanUniversality
} from "../dist/src/validation/universality-scan.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const args = parseArgs(process.argv.slice(2));
const manifestPath = path.resolve(repoRoot, args.manifest ?? "docs/roadmap/universality-scan-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const files = args.files.length > 0 ? args.files : manifest.files;
const exceptions = manifest.exceptions ?? [];

if (!Array.isArray(files) || files.length === 0) {
  throw new Error("No files configured for universality scan.");
}

let errorCount = 0;
let warningCount = 0;

for (const file of files) {
  const relativeFile = path.normalize(file);
  const absoluteFile = path.resolve(repoRoot, relativeFile);
  const content = await readFile(absoluteFile, "utf8");
  const findings = scanUniversality(relativeFile, content, exceptions);

  for (const finding of findings) {
    console.log(formatUniversalityFinding(finding));
    console.log("");

    if (finding.severity === "error") {
      errorCount += 1;
    } else {
      warningCount += 1;
    }
  }
}

if (errorCount === 0 && warningCount === 0) {
  console.log(`Universality scan passed for ${files.length} file(s).`);
} else {
  console.log(`Universality scan found ${errorCount} error(s) and ${warningCount} warning(s).`);
}

if ((errorCount > 0 && args.failOnErrors) || (warningCount > 0 && args.failOnWarnings)) {
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {
    files: [],
    failOnErrors: false,
    failOnWarnings: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--manifest") {
      parsed.manifest = requiredValue(argv, index += 1, arg);
    } else if (arg === "--file") {
      parsed.files.push(requiredValue(argv, index += 1, arg));
    } else if (arg === "--fail-on-errors") {
      parsed.failOnErrors = true;
    } else if (arg === "--fail-on-warnings") {
      parsed.failOnWarnings = true;
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

function printHelp() {
  console.log(`Usage:
  npm run check:universality
  npm run check:universality -- --file templates/canonical/agents/feature-developer.md.hbs

Options:
  --manifest <path>      JSON manifest with files and exceptions
  --file <path>          Scan one file; repeatable
  --fail-on-errors       Treat error findings as failures; default is advisory reporting
  --fail-on-warnings     Treat warning findings as failures`);
}
