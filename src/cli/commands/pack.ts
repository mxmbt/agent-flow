import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const packCommand = createSkeletonCommand({
  name: "pack",
  summary: "List, add, or remove Agent Flow packs",
  usage: [
    "agent-flow pack list",
    "agent-flow pack add <pack>",
    "agent-flow pack remove <pack>"
  ],
  options: commonOptions([
    { flag: "--dry-run", description: "Show pack config changes without writing" }
  ])
});
