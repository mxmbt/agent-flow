import type { LoadedConfig } from "../../config/load.js";
import type { Logger } from "../../logger.js";

export interface CommandOption {
  flag: string;
  description: string;
}

export interface CommandDefinition {
  name: string;
  summary: string;
  usage: string[];
  options: CommandOption[];
}

export interface CommandContext {
  args: string[];
  config: LoadedConfig;
  logger: Logger;
}

export interface CommandModule {
  definition: CommandDefinition;
  run(context: CommandContext): Promise<string>;
}
