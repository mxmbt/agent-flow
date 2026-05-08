import { commonOptions, createSkeletonCommand } from "./skeleton.js";

export const doctorCommand = createSkeletonCommand({
  name: "doctor",
  summary: "Check Agent Flow install health and missing setup",
  usage: ["agent-flow doctor [--strict]"],
  options: commonOptions([
    { flag: "--strict", description: "Treat warnings as failures" }
  ])
});
