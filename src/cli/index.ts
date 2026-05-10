#!/usr/bin/env node

import { createCli } from "./program.js";

const cli = createCli();
const result = await cli.run(process.argv.slice(2));

if (result.stdout) {
  process.stdout.write(result.stdout);
}

if (result.stderr) {
  process.stderr.write(result.stderr);
}

process.exitCode = result.exitCode;
