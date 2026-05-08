import { doctorCommand } from "./doctor.js";
import { initCommand } from "./init.js";
import { packCommand } from "./pack.js";
import { renderCommand } from "./render.js";
import { syncCommand } from "./sync.js";
import type { CommandDefinition, CommandModule } from "./types.js";
import { updateCommand } from "./update.js";
import { upgradeCommand } from "./upgrade.js";
import { validateCommand } from "./validate.js";

export const commandModules: CommandModule[] = [
  initCommand,
  updateCommand,
  upgradeCommand,
  syncCommand,
  doctorCommand,
  renderCommand,
  validateCommand,
  packCommand
];

export const commandDefinitions: CommandDefinition[] = commandModules.map((command) => command.definition);

export function listCommands(): CommandDefinition[] {
  return commandDefinitions;
}

export function getCommand(name: string): CommandModule | undefined {
  return commandModules.find((command) => command.definition.name === name);
}
