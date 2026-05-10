export interface ManagedMetadata {
  id: string;
  version: number;
  source?: string;
}

const MANAGED_PREFIX = "<!-- @agent-flow managed ";
const MANAGED_SUFFIX = " -->";
const HASH_MANAGED_PREFIX = "# @agent-flow managed ";
const SLASH_MANAGED_PREFIX = "// @agent-flow managed ";

export function renderManagedFile(metadata: ManagedMetadata, body: string): string {
  const header = `${MANAGED_PREFIX}${JSON.stringify(metadata)}${MANAGED_SUFFIX}`;
  return `${header}\n${ensureTrailingNewline(body)}`;
}

export function renderManagedAssetFile(metadata: ManagedMetadata, body: string, filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const extension = normalized.split(".").pop()?.toLowerCase();
  const basename = normalized.split("/").pop()?.toLowerCase();

  if (extension === "json" || basename?.startsWith("license")) {
    return ensureTrailingNewline(body);
  }

  if (extension === "md") {
    return insertMarkdownManagedHeader(metadata, body);
  }

  if (extension === "py") {
    return insertPythonManagedHeader(metadata, body);
  }

  if (extension === "cjs" || extension === "js" || extension === "mjs" || extension === "ts") {
    return insertSlashManagedHeader(metadata, body);
  }

  if (extension === "sh") {
    return insertShellManagedHeader(metadata, body);
  }

  if (extension === "csv") {
    return `${HASH_MANAGED_PREFIX}${JSON.stringify(metadata)}\n${ensureTrailingNewline(body)}`;
  }

  return renderManagedFile(metadata, body);
}

export function parseManagedMetadata(content: string): ManagedMetadata | null {
  const candidate = content.split(/\r?\n/, 40).find((line) => isManagedMetadataLine(line));

  if (!candidate) {
    return null;
  }

  const raw = extractManagedMetadata(candidate);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ManagedMetadata>;
    if (typeof parsed.id !== "string" || typeof parsed.version !== "number") {
      return null;
    }

    return {
      id: parsed.id,
      version: parsed.version,
      source: typeof parsed.source === "string" ? parsed.source : undefined
    };
  } catch {
    return null;
  }
}

export function isManagedFile(content: string): boolean {
  return parseManagedMetadata(content) !== null;
}

function insertMarkdownManagedHeader(metadata: ManagedMetadata, body: string): string {
  const value = ensureTrailingNewline(body);
  const lines = value.split("\n");
  const header = `${MANAGED_PREFIX}${JSON.stringify(metadata)}${MANAGED_SUFFIX}`;

  if (lines[0] !== "---") {
    return `${header}\n${value}`;
  }

  const end = lines.findIndex((line, index) => index > 0 && line === "---");
  if (end === -1) {
    return `${header}\n${value}`;
  }

  lines.splice(end + 1, 0, header);
  return lines.join("\n");
}

function insertPythonManagedHeader(metadata: ManagedMetadata, body: string): string {
  const lines = ensureTrailingNewline(body).split("\n");
  const header = `${HASH_MANAGED_PREFIX}${JSON.stringify(metadata)}`;
  let insertionIndex = 0;

  if (lines[0]?.startsWith("#!")) {
    insertionIndex = 1;
  }

  if (/coding[:=]\s*[-\w.]+/.test(lines[insertionIndex] ?? "")) {
    insertionIndex += 1;
  }

  lines.splice(insertionIndex, 0, header);
  return lines.join("\n");
}

function insertShellManagedHeader(metadata: ManagedMetadata, body: string): string {
  const lines = ensureTrailingNewline(body).split("\n");
  const header = `${HASH_MANAGED_PREFIX}${JSON.stringify(metadata)}`;
  const insertionIndex = lines[0]?.startsWith("#!") ? 1 : 0;
  lines.splice(insertionIndex, 0, header);
  return lines.join("\n");
}

function insertSlashManagedHeader(metadata: ManagedMetadata, body: string): string {
  const lines = ensureTrailingNewline(body).split("\n");
  const header = `${SLASH_MANAGED_PREFIX}${JSON.stringify(metadata)}`;
  const insertionIndex = lines[0]?.startsWith("#!") ? 1 : 0;
  lines.splice(insertionIndex, 0, header);
  return lines.join("\n");
}

function isManagedMetadataLine(line: string): boolean {
  return (line.startsWith(MANAGED_PREFIX) && line.endsWith(MANAGED_SUFFIX))
    || line.startsWith(HASH_MANAGED_PREFIX)
    || line.startsWith(SLASH_MANAGED_PREFIX);
}

function extractManagedMetadata(line: string): string | null {
  if (line.startsWith(MANAGED_PREFIX) && line.endsWith(MANAGED_SUFFIX)) {
    return line.slice(MANAGED_PREFIX.length, -MANAGED_SUFFIX.length);
  }

  if (line.startsWith(HASH_MANAGED_PREFIX)) {
    return line.slice(HASH_MANAGED_PREFIX.length);
  }

  if (line.startsWith(SLASH_MANAGED_PREFIX)) {
    return line.slice(SLASH_MANAGED_PREFIX.length);
  }

  return null;
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith("\n") ? value : `${value}\n`;
}
