import type { CommandContext, CommandDefinition, CommandModule, CommandOption } from "./types.js";

export function createSkeletonCommand(definition: CommandDefinition): CommandModule {
  return {
    definition,
    async run(context: CommandContext): Promise<string> {
      context.logger.debug(`Running skeleton command with args: ${context.args.join(" ")}`);

      return [
        `agent-flow ${definition.name}`,
        "",
        `${definition.summary}.`,
        "This command is registered, but its implementation belongs to a later roadmap milestone.",
        "",
        `Config source: ${context.config.source}`,
        ""
      ].join("\n");
    }
  };
}

export function commonOptions(options: CommandOption[]): CommandOption[] {
  return [
    ...options,
    { flag: "--verbose", description: "Enable debug logging" },
    { flag: "-h, --help", description: "Show help" }
  ];
}
