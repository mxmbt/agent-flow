import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const syncCommand = createSkeletonCommand({
  name: "sync",
  summary: "Regenerate target mirrors from canonical templates",
  usage: ["agent-flow sync [--dry-run]"],
  options: commonOptions([
    { flag: "--dry-run", description: "Show generated target changes without writing" }
  ])
});
