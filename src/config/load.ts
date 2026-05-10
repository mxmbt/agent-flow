import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { createDefaultConfig, type AgentFlowConfig } from "./defaults.js";
import { ConfigValidationError, validateAgentFlowConfig } from "./schema.js";

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
  const parsed = parseConfig(raw, CONFIG_PATH);

  return {
    config: validateAgentFlowConfig(parsed),
    source: CONFIG_PATH
  };
}

function parseConfig(raw: string, source: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    throw new ConfigValidationError([{ path: source, message: `must be valid JSON: ${message}` }]);
  }
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
