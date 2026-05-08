import { getCommand, listCommands } from "./commands/definitions.js";
import { loadProjectConfig } from "../config/load.js";
import { createLogger } from "../logger.js";

export interface CliResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface Cli {
  run(args: string[]): Promise<CliResult>;
}

export function createCli(): Cli {
  return {
    async run(args: string[]): Promise<CliResult> {
      const [commandName, ...rest] = args;

      if (!commandName || isHelpFlag(commandName)) {
        return ok(renderGlobalHelp());
      }

      const command = getCommand(commandName);
      if (!command) {
        return fail(`Unknown command: ${commandName}\n\n${renderGlobalHelp()}`, 1);
      }

      if (rest.some(isHelpFlag)) {
        return ok(renderCommandHelp(command.definition.name));
      }

      const logger = createLogger({ verbose: rest.includes("--verbose") });
      const config = await loadProjectConfig(process.cwd());

      logger.debug(`Loaded config from ${config.source}`);

      const stdout = await command.run({ args: rest, config, logger });
      return ok(stdout);
    }
  };
}

function isHelpFlag(value: string): boolean {
  return value === "--help" || value === "-h";
}

function ok(stdout: string): CliResult {
  return { exitCode: 0, stdout: ensureTrailingNewline(stdout), stderr: "" };
}

function fail(stderr: string, exitCode: number): CliResult {
  return { exitCode, stdout: "", stderr: ensureTrailingNewline(stderr) };
}

export function renderGlobalHelp(): string {
  const commandLines = listCommands()
    .map((command) => `  ${command.name.padEnd(10)} ${command.summary}`)
    .join("\n");

  return [
    "Agent Flow",
    "",
    "Usage:",
    "  agent-flow <command> [options]",
    "",
    "Commands:",
    commandLines,
    "",
    "Options:",
    "  -h, --help       Show help",
    "      --verbose    Enable debug logging",
    ""
  ].join("\n");
}

export function renderCommandHelp(commandName: string): string {
  const command = getCommand(commandName);
  if (!command) {
    return renderGlobalHelp();
  }
  const definition = command.definition;

  const usage = definition.usage.length > 0
    ? definition.usage.map((line) => `  ${line}`).join("\n")
    : `  agent-flow ${definition.name} [options]`;

  const options = definition.options.length > 0
    ? definition.options.map((option) => `  ${option.flag.padEnd(18)} ${option.description}`).join("\n")
    : "  -h, --help         Show help";

  return [
    `agent-flow ${definition.name}`,
    "",
    definition.summary,
    "",
    "Usage:",
    usage,
    "",
    "Options:",
    options,
    ""
  ].join("\n");
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith("\n") ? value : `${value}\n`;
}
