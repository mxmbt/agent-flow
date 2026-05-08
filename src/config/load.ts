import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { createDefaultConfig, type AgentFlowConfig } from "./defaults.js";

export interface LoadedConfig {
  config: AgentFlowConfig;
  source: string;
}

const CONFIG_PATH = path.join(".agent-flow", "config.json");

export async function loadProjectConfig(cwd: string): Promise<LoadedConfig> {
  const configPath = path.join(cwd, CONFIG_PATH);

  if (!(await exists(configPath))) {
    return {
      config: createDefaultConfig(path.basename(cwd)),
      source: "defaults"
    };
  }

  const raw = await readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as AgentFlowConfig;

  return {
    config: parsed,
    source: CONFIG_PATH
  };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
