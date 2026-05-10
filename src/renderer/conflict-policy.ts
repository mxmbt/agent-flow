import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { isManagedFile } from "./managed-blocks.js";

export interface RenderedFile {
  path: string;
  content: string;
}

export type ConflictMode = "error" | "force" | "backup";
export type PlannedAction = "create" | "update" | "noop" | "conflict" | "overwrite";

export interface ManagedWriteOptions {
  conflictMode?: ConflictMode;
  backupSuffix?: string;
}

export interface PlannedFileChange {
  path: string;
  action: PlannedAction;
  reason: string;
  managed: boolean;
  backupPath?: string;
}

export class ManagedFileConflictError extends Error {
  readonly conflicts: PlannedFileChange[];

  constructor(conflicts: PlannedFileChange[]) {
    const details = conflicts.map((conflict) => `- ${conflict.path}: ${conflict.reason}`).join("\n");
    super(`Agent Flow managed file conflicts must be resolved before writing:\n${details}`);
    this.name = "ManagedFileConflictError";
    this.conflicts = conflicts;
  }
}

export class ManagedFilePathError extends Error {
  constructor(filePath: string) {
    super(`Managed file path escapes the install root: ${filePath}`);
    this.name = "ManagedFilePathError";
  }
}

export async function planManagedFiles(
  root: string,
  files: RenderedFile[],
  options: ManagedWriteOptions = {}
): Promise<PlannedFileChange[]> {
  const conflictMode = options.conflictMode ?? "error";

  return Promise.all(files.map((file) => planManagedFile(root, file, conflictMode, options.backupSuffix)));
}

export async function writeManagedFiles(
  root: string,
  files: RenderedFile[],
  options: ManagedWriteOptions = {}
): Promise<PlannedFileChange[]> {
  const plan = await planManagedFiles(root, files, options);
  const conflicts = plan.filter((change) => change.action === "conflict");

  if (conflicts.length > 0) {
    throw new ManagedFileConflictError(conflicts);
  }

  const byPath = new Map(files.map((file) => [file.path, file]));

  for (const change of plan) {
    const file = byPath.get(change.path);

    if (!file || change.action === "noop") {
      continue;
    }

    const targetPath = resolveManagedPath(root, file.path);
    await mkdir(path.dirname(targetPath), { recursive: true });

    if (change.backupPath && await exists(targetPath)) {
      await writeFile(change.backupPath, await readFile(targetPath, "utf8"), "utf8");
    }

    await writeFile(targetPath, file.content, "utf8");
  }

  return plan;
}

async function planManagedFile(
  root: string,
  file: RenderedFile,
  conflictMode: ConflictMode,
  backupSuffix?: string
): Promise<PlannedFileChange> {
  const targetPath = resolveManagedPath(root, file.path);

  if (!(await exists(targetPath))) {
    return {
      path: file.path,
      action: "create",
      reason: "target file does not exist",
      managed: true
    };
  }

  const existing = await readFile(targetPath, "utf8");

  if (existing === file.content) {
    return {
      path: file.path,
      action: "noop",
      reason: "target file already matches rendered output",
      managed: isManagedFile(existing)
    };
  }

  if (isManagedFile(existing)) {
    return {
      path: file.path,
      action: "update",
      reason: "target file is managed by Agent Flow",
      managed: true
    };
  }

  if (conflictMode === "backup") {
    return {
      path: file.path,
      action: "overwrite",
      reason: "target file is unmanaged; backup requested before overwrite",
      managed: false,
      backupPath: `${targetPath}${backupSuffix ?? ".bak"}`
    };
  }

  if (conflictMode === "force") {
    return {
      path: file.path,
      action: "overwrite",
      reason: "target file is unmanaged; force overwrite requested",
      managed: false
    };
  }

  return {
    path: file.path,
    action: "conflict",
    reason: "target file exists and is not managed by Agent Flow",
    managed: false
  };
}

function resolveManagedPath(root: string, filePath: string): string {
  const rootPath = path.resolve(root);
  const targetPath = path.resolve(rootPath, filePath);

  if (targetPath !== rootPath && targetPath.startsWith(`${rootPath}${path.sep}`)) {
    return targetPath;
  }

  throw new ManagedFilePathError(filePath);
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}
