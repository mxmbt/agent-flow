import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const updateCommand = createSkeletonCommand({
  name: "update",
  summary: "Update managed Agent Flow files in an installed project",
  usage: ["agent-flow update [--dry-run] [--force]"],
  options: commonOptions([
    { flag: "--dry-run", description: "Show planned changes without writing" },
    { flag: "--force", description: "Allow managed-file replacement when safe" }
  ])
});
