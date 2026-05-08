import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const upgradeCommand = createSkeletonCommand({
  name: "upgrade",
  summary: "Upgrade Agent Flow managed files across package versions",
  usage: ["agent-flow upgrade [--dry-run] [--from <version>]"],
  options: commonOptions([
    { flag: "--dry-run", description: "Show upgrade plan without writing" },
    { flag: "--from <version>", description: "Declare the installed Agent Flow version" }
  ])
});
