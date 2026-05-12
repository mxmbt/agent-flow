#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = await mkdtemp(path.join(os.tmpdir(), "agent-flow-package-smoke-"));
const packageRoot = path.join(tmpRoot, "package");
const projectRoot = path.join(tmpRoot, "project");

try {
  await mkdir(packageRoot, { recursive: true });
  await mkdir(projectRoot, { recursive: true });

  const pack = await run("npm", ["pack", "--json", "--pack-destination", packageRoot], repoRoot);
  const packed = JSON.parse(pack.stdout);
  const tarball = path.join(packageRoot, packed[0].filename);

  await writeFile(path.join(projectRoot, "package.json"), JSON.stringify({
    name: "agent-flow-package-smoke",
    private: true,
    type: "module"
  }, null, 2), "utf8");

  await run("npm", ["install", "--silent", tarball], projectRoot);

  const bin = path.join(
    projectRoot,
    "node_modules",
    ".bin",
    process.platform === "win32" ? "agent-flow.cmd" : "agent-flow"
  );

  const init = await run(bin, ["init"], projectRoot);
  assertOutput(init.stdout, /Initialized Agent Flow/, "agent-flow init");

  const validate = await run(bin, ["validate", "--strict"], projectRoot);
  assertOutput(validate.stdout, /Mirror parity: PASS/, "agent-flow validate --strict");

  const doctor = await run(bin, ["doctor"], projectRoot);
  assertOutput(doctor.stdout, /agent-flow doctor/, "agent-flow doctor");

  console.log(`Package smoke passed: ${tarball}`);
  await rm(tmpRoot, { recursive: true, force: true });
} catch (error) {
  console.error(`Package smoke failed. Workdir kept at: ${tmpRoot}`);
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
  process.exitCode = 1;
}

async function run(command, args, cwd) {
  try {
    return await execFileAsync(command, args, {
      cwd,
      maxBuffer: 16 * 1024 * 1024
    });
  } catch (error) {
    const stdout = typeof error.stdout === "string" ? error.stdout : "";
    const stderr = typeof error.stderr === "string" ? error.stderr : "";
    throw new Error([
      `$ ${command} ${args.join(" ")}`,
      stdout.trim(),
      stderr.trim()
    ].filter(Boolean).join("\n"));
  }
}

function assertOutput(stdout, pattern, label) {
  if (!pattern.test(stdout)) {
    throw new Error(`${label} did not produce expected output.\n\n${stdout}`);
  }
}
