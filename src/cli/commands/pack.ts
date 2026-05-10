import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { builtinPacks } from "../../packs/builtin.js";
import { composePacks, PackCompositionError } from "../../packs/manifest.js";
import { isManagedFile } from "../../renderer/managed-blocks.js";
import { planManagedFiles, writeManagedFiles, type PlannedFileChange, type RenderedFile } from "../../renderer/conflict-policy.js";
import { renderTargetFiles } from "../../renderer/target-renderer.js";
import { commonOptions } from "./skeleton.js";
import type { CommandModule } from "./types.js";
import { findTemplateRoot, renderPlan } from "./update.js";

export const packCommand: CommandModule = {
  definition: {
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
  },
  async run(context): Promise<string> {
    const [subcommand, packName] = context.args.filter((arg) => !arg.startsWith("--"));

    if (!subcommand || subcommand === "list") {
      return renderPackList(context.config.config.packs);
    }

    if (subcommand !== "add" && subcommand !== "remove") {
      return "Usage:\n  agent-flow pack list\n  agent-flow pack add <pack>\n  agent-flow pack remove <pack>\n";
    }

    if (!packName) {
      return `Missing pack name for pack ${subcommand}.\n`;
    }

    const dryRun = context.args.includes("--dry-run");
    const currentConfig = context.config.config;
    const nextPacks = subcommand === "add"
      ? addPack(currentConfig.packs, packName)
      : removePack(currentConfig.packs, packName);
    const nextConfig = {
      ...currentConfig,
      packs: nextPacks
    };

    const root = process.cwd();
    const templateRoot = await findTemplateRoot(root);
    const currentRendered = await renderTargetFiles(currentConfig, composePacks(builtinPacks, currentConfig.packs), { templateRoot });
    const nextRendered = await renderTargetFiles(nextConfig, composePacks(builtinPacks, nextConfig.packs), { templateRoot });
    const plan = await planManagedFiles(root, nextRendered);
    const obsolete = await planObsoleteFiles(root, currentRendered, nextRendered);
    const title = subcommand === "add"
      ? `Agent Flow pack add ${packName}${dryRun ? " preview. No files were written." : "."}`
      : `Agent Flow pack remove ${packName}${dryRun ? " preview. No files were written." : "."}`;

    if (dryRun) {
      return renderPackPlan(title, currentConfig.packs, nextPacks, plan, obsolete);
    }

    const conflicts = plan.filter((change) => change.action === "conflict");
    if (conflicts.length > 0) {
      return renderPackPlan(`Agent Flow pack ${subcommand} found unmanaged conflicts. No files were written.`, currentConfig.packs, nextPacks, plan, obsolete);
    }

    await writeConfig(root, nextConfig);
    await writeManagedFiles(root, nextRendered);
    await deleteObsoleteFiles(root, obsolete);

    return renderPackPlan(title, currentConfig.packs, nextPacks, plan, obsolete);
  }
};

function renderPackList(installed: string[]): string {
  const installedSet = new Set(installed);
  return [
    "Agent Flow packs",
    "",
    ...builtinPacks.map((pack) => {
      const status = installedSet.has(pack.name) ? "installed" : "available";
      return `- ${pack.name} [${status}] ${pack.description}`;
    }),
    ""
  ].join("\n");
}

function addPack(current: string[], packName: string): string[] {
  ensureKnownPack(packName);
  return current.includes(packName) ? current : [...current, packName];
}

function removePack(current: string[], packName: string): string[] {
  ensureKnownPack(packName);
  return current.filter((name) => name !== packName);
}

function ensureKnownPack(packName: string): void {
  if (!builtinPacks.some((pack) => pack.name === packName)) {
    throw new PackCompositionError([{ pack: packName, path: "packs", message: "unknown pack" }]);
  }
}

async function planObsoleteFiles(
  root: string,
  currentRendered: RenderedFile[],
  nextRendered: RenderedFile[]
): Promise<PlannedFileChange[]> {
  const nextPaths = new Set(nextRendered.map((file) => file.path));
  const obsolete: PlannedFileChange[] = [];

  for (const file of currentRendered) {
    if (nextPaths.has(file.path)) {
      continue;
    }

    const existingPath = path.join(root, file.path);
    const content = await readOptional(existingPath);
    if (content === null) {
      continue;
    }

    obsolete.push({
      path: file.path,
      action: isManagedFile(content) ? "overwrite" : "conflict",
      reason: isManagedFile(content)
        ? "managed file is no longer contributed by selected packs"
        : "obsolete file exists but is not managed by Agent Flow",
      managed: isManagedFile(content)
    });
  }

  return obsolete;
}

async function deleteObsoleteFiles(root: string, obsolete: PlannedFileChange[]): Promise<void> {
  for (const change of obsolete) {
    if (change.action !== "overwrite" || !change.managed) {
      continue;
    }

    await unlink(path.join(root, change.path));
  }
}

function renderPackPlan(
  title: string,
  before: string[],
  after: string[],
  plan: PlannedFileChange[],
  obsolete: PlannedFileChange[]
): string {
  const lines = [
    title,
    "",
    `Installed packs before: ${before.length === 0 ? "none" : before.join(", ")}`,
    `Installed packs after: ${after.length === 0 ? "none" : after.join(", ")}`,
    "",
    renderPlan("Managed file plan:", plan).trimEnd()
  ];

  if (obsolete.length > 0) {
    lines.push("", "Obsolete managed files:", ...obsolete.map((change) => `- delete   ${change.path} (${change.reason})`));
  }

  return [...lines, ""].join("\n");
}

async function writeConfig(root: string, value: unknown): Promise<void> {
  await mkdir(path.join(root, ".agent-flow"), { recursive: true });
  await writeFile(path.join(root, ".agent-flow", "config.json"), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return null;
  }
}
