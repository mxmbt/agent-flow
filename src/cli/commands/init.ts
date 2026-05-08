import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const initCommand = createSkeletonCommand({
  name: "init",
  summary: "Create a new Agent Flow install in the current project",
  usage: ["agent-flow init [--dry-run] [--profile <name>]"],
  options: commonOptions([
    { flag: "--dry-run", description: "Show planned files without writing" },
    { flag: "--profile <name>", description: "Use a starter profile" }
  ])
});
