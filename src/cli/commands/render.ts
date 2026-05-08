import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const renderCommand = createSkeletonCommand({
  name: "render",
  summary: "Render Agent Flow files without applying them",
  usage: ["agent-flow render [--profile <name>] [--json]"],
  options: commonOptions([
    { flag: "--profile <name>", description: "Render using a starter profile" },
    { flag: "--json", description: "Print machine-readable render output" }
  ])
});
