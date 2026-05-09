export interface UniversalityRule {
  id: string;
  severity: "error" | "warning";
  pattern: RegExp;
  message: string;
  routeTo: "config" | "pack" | "manual-review";
}

export interface UniversalityFinding {
  ruleId: string;
  severity: "error" | "warning";
  file: string;
  line: number;
  column: number;
  excerpt: string;
  message: string;
  routeTo: "config" | "pack" | "manual-review";
}

export interface UniversalityException {
  file: string;
  ruleId: string;
  reason: string;
}

export const DEFAULT_UNIVERSALITY_RULES: UniversalityRule[] = [
  {
    id: "project-brand-literal",
    severity: "error",
    pattern: /\b(FinAI|FINAI|ZNAI)\b/,
    message: "Project brand literals do not belong in public core output; rewrite them to neutral Agent Flow wording after the copy-as-is baseline is validated.",
    routeTo: "manual-review"
  },
  {
    id: "machine-local-path",
    severity: "error",
    pattern: /(?:^|[\s`"'])\/Users\/[^`"'\s]+/,
    message: "Machine-local absolute paths do not belong in portable output.",
    routeTo: "config"
  },
  {
    id: "hardcoded-app-root",
    severity: "error",
    pattern: /(?:^|[\s`"'])cd\s+cf\b|`cf\/|cf\/wrangler\.toml/,
    message: "Hardcoded application roots must come from project config.",
    routeTo: "config"
  },
  {
    id: "hardcoded-github-repo",
    severity: "error",
    pattern: /\b(?:id-bu\/AI_Finance_Manager|repos\/id-bu\/AI_Finance_Manager)\b/,
    message: "Hardcoded GitHub repository references must come from project config or repository discovery.",
    routeTo: "config"
  },
  {
    id: "hardcoded-branch-flow",
    severity: "error",
    pattern: /\b(?:origin\/develop|origin\/master|develop\s*->\s*master|--base\s+develop|base\s+`develop`)\b/,
    message: "Hardcoded branch and release-flow names must come from git config.",
    routeTo: "config"
  },
  {
    id: "cloudflare-worker-runtime",
    severity: "error",
    pattern: /\b(?:wrangler|worker bindings|Cloudflare Workers?|D1|R2|KV)\b/i,
    message: "Cloudflare Worker terminology belongs in the cloudflare-worker pack.",
    routeTo: "pack"
  },
  {
    id: "telegram-runtime",
    severity: "error",
    pattern: /\bTelegram\b/,
    message: "Telegram-specific terminology belongs in the telegram pack.",
    routeTo: "pack"
  },
  {
    id: "hardcoded-npm-command",
    severity: "error",
    pattern: /\bnpm\s+(?:run\s+)?(?:test|type-check|generate|migrate:local|build|lint)\b/,
    message: "Hardcoded npm commands must be rendered from configured checks.",
    routeTo: "config"
  },
  {
    id: "domain-invariant-literal",
    severity: "error",
    pattern: /\b(?:financial correctness|no-look-ahead|user isolation)\b/i,
    message: "Domain invariants must come from project config or domain packs.",
    routeTo: "pack"
  },
  {
    id: "source-specific-wording",
    severity: "warning",
    pattern: /\bPreferred path in FinAI\b/,
    message: "Source-specific wording should become neutral Agent Flow wording after the copy-as-is baseline is validated.",
    routeTo: "manual-review"
  },
  {
    id: "stack-specific-library",
    severity: "warning",
    pattern: /\b(?:Prisma|tRPC|OpenBrowser)\b/,
    message: "Stack-specific library references should be routed to packs or project config.",
    routeTo: "pack"
  }
];

export function scanUniversality(
  file: string,
  content: string,
  exceptions: UniversalityException[] = [],
  rules = DEFAULT_UNIVERSALITY_RULES
): UniversalityFinding[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const findings: UniversalityFinding[] = [];

  for (const [index, line] of lines.entries()) {
    for (const rule of rules) {
      const match = line.match(rule.pattern);
      if (!match || isExcepted(file, rule.id, exceptions)) {
        continue;
      }

      findings.push({
        ruleId: rule.id,
        severity: rule.severity,
        file,
        line: index + 1,
        column: match.index === undefined ? 1 : match.index + 1,
        excerpt: line.trim(),
        message: rule.message,
        routeTo: rule.routeTo
      });
    }
  }

  return findings;
}

export function formatUniversalityFinding(finding: UniversalityFinding): string {
  return [
    `[${finding.severity.toUpperCase()}] ${finding.file}:${finding.line}:${finding.column} ${finding.ruleId}`,
    `  ${finding.message}`,
    `  route: ${finding.routeTo}`,
    `  ${finding.excerpt}`
  ].join("\n");
}

function isExcepted(file: string, ruleId: string, exceptions: UniversalityException[]): boolean {
  return exceptions.some((exception) => exception.file === file && exception.ruleId === ruleId);
}
