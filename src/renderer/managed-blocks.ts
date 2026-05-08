export interface ManagedMetadata {
  id: string;
  version: number;
  source?: string;
}

const MANAGED_PREFIX = "<!-- @agent-flow managed ";
const MANAGED_SUFFIX = " -->";

export function renderManagedFile(metadata: ManagedMetadata, body: string): string {
  const header = `${MANAGED_PREFIX}${JSON.stringify(metadata)}${MANAGED_SUFFIX}`;
  return `${header}\n${ensureTrailingNewline(body)}`;
}

export function parseManagedMetadata(content: string): ManagedMetadata | null {
  const [firstLine] = content.split(/\r?\n/, 1);

  if (!firstLine.startsWith(MANAGED_PREFIX) || !firstLine.endsWith(MANAGED_SUFFIX)) {
    return null;
  }

  const raw = firstLine.slice(MANAGED_PREFIX.length, -MANAGED_SUFFIX.length);

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

function ensureTrailingNewline(value: string): string {
  return value.endsWith("\n") ? value : `${value}\n`;
}
