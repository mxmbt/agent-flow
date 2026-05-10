import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { commandDefinitions } from "../src/cli/commands/definitions.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.resolve(__dirname, "../src/cli/index.js");

test("global help lists every command", async () => {
  const { stdout } = await execFileAsync(process.execPath, [cliPath, "--help"]);

  assert.match(stdout, /Agent Flow/);

  for (const command of commandDefinitions) {
    assert.match(stdout, new RegExp(`\\b${command.name}\\b`));
  }
});

for (const command of commandDefinitions) {
  test(`${command.name} help renders usage`, async () => {
    const { stdout } = await execFileAsync(process.execPath, [cliPath, command.name, "--help"]);

    assert.match(stdout, new RegExp(`agent-flow ${command.name}`));
    assert.match(stdout, /Usage:/);
    assert.match(stdout, /--help/);
  });
}
