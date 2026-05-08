import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const validateCommand = createSkeletonCommand({
  name: "validate",
  summary: "Run core validation checks for generated output",
  usage: ["agent-flow validate [--strict]"],
  options: commonOptions([
    { flag: "--strict", description: "Treat warnings as failures" }
  ])
});
