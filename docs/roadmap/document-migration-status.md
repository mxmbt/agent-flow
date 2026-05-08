# Document Migration Status

**Created:** 2026-05-08
**Roadmap:** `docs/roadmap/project-agnostic-core-roadmap.md`
**Protocol:** `docs/roadmap/document-migration-protocol.md`
**Status:** Empty package baseline; FinAI reference inventory populated; representative dry-run classification started

---

## Why This File Exists

This file is now the single source of truth for document migration status.

The separate `migration-ledger.md` file was removed to avoid splitting status across multiple documents. The dashboard and per-file register live together here.

---

## Dashboard

| Area | Status | Current Count | Target | Notes |
|------|--------|---------------|--------|-------|
| Migration protocol | Drafted | 1 doc | Approved protocol | Defines per-file migration rules and checklist; status vocabulary reconciled with this register. |
| Unified migration register | Raw populated | 537 rows | One row per FinAI reference candidate source file | Rows start as `UNCLASSIFIED / RAW_SCANNED` until a migration task reads the full file. |
| FinAI reference candidates | Dry-run classification started | 537 rows | Narrowed and classified | Broad scan includes `.claude`, `.codex`, scripts, templates, nested skill assets, and some likely out-of-scope files. |
| File-by-file migration tasks | Not started | 0 tasks | One task per source file or approved micro-batch | Must be created after representative dry-run classifications. |
| Classified rows | Dry-run started | 4 rows | 537 rows | Classification applies only after full-file review; first sample covers root target, agent, lifecycle skill, and artifact template. |
| Migrated rows | Not started | 0 rows | TBD | Target count depends on how many rows become `OUT_OF_SCOPE`, `OBSOLETE`, or `GENERATED`. |
| Core agnostic scan | Not started | 0 runs | Passing in CI | Blocks project-specific literals and absolute local paths. |
| Claude/Codex parity validation | Not started | 0 runs | Passing in CI | Requires canonical/target renderer first. |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| `RAW_SCANNED` | Candidate file was found mechanically. Full content has not been reviewed yet. |
| `CLASSIFIED` | File has a confirmed classification and decision after full-file review. |
| `TASKED` | A migration task exists for the file or approved micro-batch. |
| `MIGRATED` | Target content exists in Agent Flow. |
| `VALIDATED` | Target content passed scans/tests/parity checks. |
| `SKIPPED` | File was intentionally not migrated. |

---

## Classification Definitions

| Classification | Meaning |
|----------------|---------|
| `UNCLASSIFIED` | Raw inventory row; full file read has not happened yet. |
| `CORE` | Project-agnostic lifecycle/process content. |
| `ADAPTER_TARGET` | Tool-specific rendering target for Claude or Codex. |
| `PACK` | Reusable domain/runtime capability. |
| `PROFILE` | Example or starter project configuration. |
| `GENERATED` | Output produced from canonical templates. |
| `VENDOR` | Third-party or adapted skill requiring provenance/licensing. |
| `OBSOLETE` | Stale flow that should not be ported. |
| `OUT_OF_SCOPE` | Project/runtime file caught by broad scan but not part of Agent Flow. |

---

## Coverage By Source

| Source | Scope | Raw Count | Register Rows | Coverage | Status |
|--------|-------|-----------|---------------|----------|--------|
| FinAI reference repo | `AGENTS.md`, `CLAUDE.md`, `.claude/**`, `.codex/**`, `scripts/**`, `docs/templates/**` | 537 | 537 | 100% raw registered | Raw scanned; 4 representative rows classified |

Notes:

- Raw registered does not mean approved for migration.
- Every FinAI row still needs a full-file review before classification changes from `UNCLASSIFIED`.
- The FinAI scan is intentionally broad; many rows may become `VENDOR`, `GENERATED`, `PACK`, `OUT_OF_SCOPE`, or `OBSOLETE`.

---

## Migration Workstreams

| Workstream | Scope | Status | Next Action |
|------------|-------|--------|-------------|
| Root entrypoints | `AGENTS.md`, `CLAUDE.md`, `.claude/CLAUDE.md`, `.codex/orchestration-policy.md`, `.codex/claude-interop.md` | 1 dry-run classified | Build canonical lifecycle boundary before migrating root targets. |
| Agents | `.claude/agents/**`, `.codex/agents/**` | 1 dry-run classified | Migrate one agent per task; split project/runtime assumptions into config and packs. |
| Lifecycle skills | planning, implementation, simplify, review, fix, quality, QA, delivery | 1 dry-run classified | Split core lifecycle from configurable docs, profiles, and packs. |
| Auxiliary skills/guides | debugging, TDD, frontend, e2e, commit, architecture, design | Raw registered | Classify vendor/core/pack/obsolete before migration. |
| Scripts | sync, validation, delivery, worktree, roadmap checks | Raw registered | Split core scripts from optional packs and out-of-scope project scripts. |
| Templates | state, design document, report, QA, walkthrough | 1 dry-run classified | Convert artifact paths and project values into config placeholders. |
| MCP config | settings and MCP files | Raw registered | Classify as installer output; scan for absolute paths. |
| Packs | finance, cloudflare-worker, telegram, webapp, planning-docs | Planned | Define pack manifests before moving pack-heavy files. |
| Profiles | generic, webapp, finai.example | Planned | Create after core and pack boundaries stabilize. |

---

## Immediate Next Steps

1. Scaffold the package from an empty baseline. Done 2026-05-08: package metadata, TypeScript source tree, public README, CLI skeleton, and help smoke tests landed in Agent Flow.
2. Reconcile M0 roadmap statuses with evidence from the existing inventory/protocol docs before marking additional M0 tasks done. Done 2026-05-08: AF-M0-T3 has protocol/register evidence; AF-M0-T2 remains in progress because full classification is incomplete.
3. Review and classify three representative FinAI rows. Done 2026-05-08:
   - one root entrypoint
   - one agent
   - one lifecycle skill
4. Classify one script or artifact template row to satisfy the roadmap dry-run variant and test non-prompt extraction. Done 2026-05-08: `FINAI-0503`.
5. Start per-file migration tasks from the register below only for files selected for porting.
6. Update each row in place after classification, migration, and validation.

---

## Update Protocol

After every migration task:

1. Update the file's row in this document.
2. Update the relevant workstream row.
3. Update dashboard counts if coverage changed.
4. Record validation evidence:
   - agnostic scan
   - mirror parity check
   - pack composition check
   - snapshot/temp-repo test when applicable

Do not mark a file `VALIDATED` because it was copied. Validation requires evidence.

---

## Current Blockers

| Blocker | Impact | Resolution |
|---------|--------|------------|
| FinAI rows are raw-scanned but unclassified | Blocks porting those specific files, but does not block empty package scaffold | Classify FinAI files only as they enter a migration slice. |
| Pack manifest schema not defined | Cannot decide final target for domain/runtime content | Complete AF-M2-T3 before migrating pack-heavy files. |
| Canonical/target renderer not defined | Root entrypoint parity cannot be validated yet | Complete AF-M3-T1 and AF-M3-T2. |
| Project-specific assumptions appear inside useful source files | Core migration would leak FinAI runtime/domain facts if copied directly | Split each selected file into canonical core, config placeholders, optional packs, generated target output, or profile data. |

---

## Migration Register: FinAI Reference Files

| ID | Source | Classification | Pack/Profile | Decision | Status | Target | Notes |
|----|--------|----------------|--------------|----------|--------|--------|-------|
| FINAI-0001 | FinAI:.claude/CLAUDE.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Claude lifecycle target candidate; split canonical content from target syntax. |
| FINAI-0002 | FinAI:.claude/agents/analyst.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0003 | FinAI:.claude/agents/architect.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0004 | FinAI:.claude/agents/code-simplifier.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0005 | FinAI:.claude/agents/deep-reviewer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0006 | FinAI:.claude/agents/delivery-agent.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0007 | FinAI:.claude/agents/feature-developer.md | CORE | core + finance/cloudflare-worker packs | port-as-core | CLASSIFIED | `templates/canonical/agents/feature-developer.md.hbs` | Full file read 2026-05-08 with Codex mirror. Universal implementation/TDD/report contract belongs in core; `cf/`, financial correctness/no-look-ahead, Wrangler/runtime checks, and generated `npm run agents:sync` notice must move to config, packs, or generated target metadata. |
| FINAI-0008 | FinAI:.claude/agents/findings-arbiter.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0009 | FinAI:.claude/agents/math-genius.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0010 | FinAI:.claude/agents/paranoid-architect.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0011 | FinAI:.claude/agents/performance-expert.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0012 | FinAI:.claude/agents/product-manager.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0013 | FinAI:.claude/agents/prt-code-reviewer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0014 | FinAI:.claude/agents/prt-code-simplifier.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0015 | FinAI:.claude/agents/prt-comment-analyzer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0016 | FinAI:.claude/agents/prt-pr-test-analyzer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0017 | FinAI:.claude/agents/prt-silent-failure-hunter.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0018 | FinAI:.claude/agents/prt-type-design-analyzer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0019 | FinAI:.claude/agents/qa-expert.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0020 | FinAI:.claude/agents/ux-expert.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Agent prompt candidate; migrate one agent per task. |
| FINAI-0021 | FinAI:.claude/guides/code-review-graph-usage.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Guide candidate; check for project-specific commands and tool assumptions. |
| FINAI-0022 | FinAI:.claude/guides/gan-protocol.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Guide candidate; check for project-specific commands and tool assumptions. |
| FINAI-0023 | FinAI:.claude/guides/systematic-debugging.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Guide candidate; check for project-specific commands and tool assumptions. |
| FINAI-0024 | FinAI:.claude/guides/test-driven-development.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Guide candidate; check for project-specific commands and tool assumptions. |
| FINAI-0025 | FinAI:.claude/guides/ui-ux-pro-max-reference.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Guide candidate; check for project-specific commands and tool assumptions. |
| FINAI-0026 | FinAI:.claude/guides/verification-before-completion.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Guide candidate; check for project-specific commands and tool assumptions. |
| FINAI-0027 | FinAI:.claude/guides/worktree-workflow.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Guide candidate; check for project-specific commands and tool assumptions. |
| FINAI-0028 | FinAI:.claude/settings.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | MCP/settings candidate; scan for absolute paths and local machine assumptions. |
| FINAI-0029 | FinAI:.claude/settings.local.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Full file read required before classification. |
| FINAI-0030 | FinAI:.claude/skills/accessibility-audit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0031 | FinAI:.claude/skills/architecture-designer/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0032 | FinAI:.claude/skills/architecture-designer/references/adr-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0033 | FinAI:.claude/skills/architecture-designer/references/architecture-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0034 | FinAI:.claude/skills/architecture-designer/references/database-selection.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0035 | FinAI:.claude/skills/architecture-designer/references/nfr-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0036 | FinAI:.claude/skills/architecture-designer/references/system-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0037 | FinAI:.claude/skills/architecture-patterns/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0038 | FinAI:.claude/skills/architecture-patterns/references/violation-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0039 | FinAI:.claude/skills/architecture-phase/SKILL.md | CORE | core + optional project docs/profile inputs | port-as-core | CLASSIFIED | `templates/canonical/skills/architecture-phase/SKILL.md.hbs` | Full file read 2026-05-08 with Codex mirror. RED-task architecture gate, architect prompt contract, ADR/ADD output, and state update contract are core; concrete docs such as `ARCHITECTURE_MULTI_USER.md`, `docs/ARCHITECTURE.md`, RAG/deep-cleanup skill choices, and `docs/ADRs/` path must be config/profile inputs or pack contributions. |
| FINAI-0040 | FinAI:.claude/skills/banner-design-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0041 | FinAI:.claude/skills/banner-design-uupm/references/banner-sizes-and-styles.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0042 | FinAI:.claude/skills/brainstorming/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0043 | FinAI:.claude/skills/brainstorming/scripts/frame-template.html | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0044 | FinAI:.claude/skills/brainstorming/scripts/helper.js | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0045 | FinAI:.claude/skills/brainstorming/scripts/server.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0046 | FinAI:.claude/skills/brainstorming/scripts/start-server.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0047 | FinAI:.claude/skills/brainstorming/scripts/stop-server.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0048 | FinAI:.claude/skills/brainstorming/spec-document-reviewer-prompt.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0049 | FinAI:.claude/skills/brainstorming/visual-companion.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0050 | FinAI:.claude/skills/brand-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0051 | FinAI:.claude/skills/brand-uupm/references/approval-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0052 | FinAI:.claude/skills/brand-uupm/references/asset-organization.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0053 | FinAI:.claude/skills/brand-uupm/references/brand-guideline-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0054 | FinAI:.claude/skills/brand-uupm/references/color-palette-management.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0055 | FinAI:.claude/skills/brand-uupm/references/consistency-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0056 | FinAI:.claude/skills/brand-uupm/references/logo-usage-rules.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0057 | FinAI:.claude/skills/brand-uupm/references/messaging-framework.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0058 | FinAI:.claude/skills/brand-uupm/references/typography-specifications.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0059 | FinAI:.claude/skills/brand-uupm/references/update.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0060 | FinAI:.claude/skills/brand-uupm/references/visual-identity.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0061 | FinAI:.claude/skills/brand-uupm/references/voice-framework.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0062 | FinAI:.claude/skills/brand-uupm/scripts/extract-colors.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0063 | FinAI:.claude/skills/brand-uupm/scripts/inject-brand-context.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0064 | FinAI:.claude/skills/brand-uupm/scripts/sync-brand-to-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0065 | FinAI:.claude/skills/brand-uupm/scripts/validate-asset.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0066 | FinAI:.claude/skills/brand-uupm/templates/brand-guidelines-starter.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0067 | FinAI:.claude/skills/bugfix-flow/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0068 | FinAI:.claude/skills/commit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0069 | FinAI:.claude/skills/debug-issue.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0070 | FinAI:.claude/skills/delivery-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0071 | FinAI:.claude/skills/design-audit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0072 | FinAI:.claude/skills/design-audit/audit-dimensions.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0073 | FinAI:.claude/skills/design-audit/ux-principles.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0074 | FinAI:.claude/skills/design-system-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0075 | FinAI:.claude/skills/design-system-uupm/data/slide-backgrounds.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0076 | FinAI:.claude/skills/design-system-uupm/data/slide-charts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0077 | FinAI:.claude/skills/design-system-uupm/data/slide-color-logic.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0078 | FinAI:.claude/skills/design-system-uupm/data/slide-copy.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0079 | FinAI:.claude/skills/design-system-uupm/data/slide-layout-logic.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0080 | FinAI:.claude/skills/design-system-uupm/data/slide-layouts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0081 | FinAI:.claude/skills/design-system-uupm/data/slide-strategies.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0082 | FinAI:.claude/skills/design-system-uupm/data/slide-typography.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0083 | FinAI:.claude/skills/design-system-uupm/references/component-specs.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0084 | FinAI:.claude/skills/design-system-uupm/references/component-tokens.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0085 | FinAI:.claude/skills/design-system-uupm/references/primitive-tokens.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0086 | FinAI:.claude/skills/design-system-uupm/references/semantic-tokens.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0087 | FinAI:.claude/skills/design-system-uupm/references/states-and-variants.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0088 | FinAI:.claude/skills/design-system-uupm/references/tailwind-integration.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0089 | FinAI:.claude/skills/design-system-uupm/references/token-architecture.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0090 | FinAI:.claude/skills/design-system-uupm/scripts/embed-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0091 | FinAI:.claude/skills/design-system-uupm/scripts/fetch-background.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0092 | FinAI:.claude/skills/design-system-uupm/scripts/generate-slide.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0093 | FinAI:.claude/skills/design-system-uupm/scripts/generate-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0094 | FinAI:.claude/skills/design-system-uupm/scripts/html-token-validator.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0095 | FinAI:.claude/skills/design-system-uupm/scripts/search-slides.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0096 | FinAI:.claude/skills/design-system-uupm/scripts/slide-token-validator.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0097 | FinAI:.claude/skills/design-system-uupm/scripts/slide_search_core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0098 | FinAI:.claude/skills/design-system-uupm/scripts/validate-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0099 | FinAI:.claude/skills/design-system-uupm/templates/design-tokens-starter.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0100 | FinAI:.claude/skills/design-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0101 | FinAI:.claude/skills/design-uupm/data/cip/deliverables.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0102 | FinAI:.claude/skills/design-uupm/data/cip/industries.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0103 | FinAI:.claude/skills/design-uupm/data/cip/mockup-contexts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0104 | FinAI:.claude/skills/design-uupm/data/cip/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0105 | FinAI:.claude/skills/design-uupm/data/icon/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0106 | FinAI:.claude/skills/design-uupm/data/logo/colors.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0107 | FinAI:.claude/skills/design-uupm/data/logo/industries.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0108 | FinAI:.claude/skills/design-uupm/data/logo/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0109 | FinAI:.claude/skills/design-uupm/references/banner-sizes-and-styles.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0110 | FinAI:.claude/skills/design-uupm/references/cip-deliverable-guide.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0111 | FinAI:.claude/skills/design-uupm/references/cip-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0112 | FinAI:.claude/skills/design-uupm/references/cip-prompt-engineering.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0113 | FinAI:.claude/skills/design-uupm/references/cip-style-guide.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0114 | FinAI:.claude/skills/design-uupm/references/design-routing.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0115 | FinAI:.claude/skills/design-uupm/references/icon-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0116 | FinAI:.claude/skills/design-uupm/references/logo-color-psychology.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0117 | FinAI:.claude/skills/design-uupm/references/logo-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0118 | FinAI:.claude/skills/design-uupm/references/logo-prompt-engineering.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0119 | FinAI:.claude/skills/design-uupm/references/logo-style-guide.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0120 | FinAI:.claude/skills/design-uupm/references/slides-copywriting-formulas.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0121 | FinAI:.claude/skills/design-uupm/references/slides-create.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0122 | FinAI:.claude/skills/design-uupm/references/slides-html-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0123 | FinAI:.claude/skills/design-uupm/references/slides-layout-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0124 | FinAI:.claude/skills/design-uupm/references/slides-strategies.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0125 | FinAI:.claude/skills/design-uupm/references/slides.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0126 | FinAI:.claude/skills/design-uupm/references/social-photos-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0127 | FinAI:.claude/skills/design-uupm/scripts/cip/core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0128 | FinAI:.claude/skills/design-uupm/scripts/cip/generate.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0129 | FinAI:.claude/skills/design-uupm/scripts/cip/render-html.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0130 | FinAI:.claude/skills/design-uupm/scripts/cip/search.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0131 | FinAI:.claude/skills/design-uupm/scripts/icon/generate.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0132 | FinAI:.claude/skills/design-uupm/scripts/logo/core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0133 | FinAI:.claude/skills/design-uupm/scripts/logo/generate.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0134 | FinAI:.claude/skills/design-uupm/scripts/logo/search.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0135 | FinAI:.claude/skills/desloppify/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0136 | FinAI:.claude/skills/devils-advocate/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0137 | FinAI:.claude/skills/devils-advocate/references/ai-blind-spots.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0138 | FinAI:.claude/skills/devils-advocate/references/blind-spots.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0139 | FinAI:.claude/skills/devils-advocate/references/questioning-frameworks.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0140 | FinAI:.claude/skills/e2e-testing-patterns/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0141 | FinAI:.claude/skills/e2e-testing/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0142 | FinAI:.claude/skills/explore-codebase.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0143 | FinAI:.claude/skills/fix-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0144 | FinAI:.claude/skills/flow-infra-sync/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0145 | FinAI:.claude/skills/frontend-design/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0146 | FinAI:.claude/skills/implementation-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0147 | FinAI:.claude/skills/improve-codebase-architecture/REFERENCE.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0148 | FinAI:.claude/skills/improve-codebase-architecture/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0149 | FinAI:.claude/skills/next-best-practices/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0150 | FinAI:.claude/skills/phase-check/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0151 | FinAI:.claude/skills/plan-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0152 | FinAI:.claude/skills/planning-lifecycle/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0153 | FinAI:.claude/skills/pr-review-toolkit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0154 | FinAI:.claude/skills/product-review/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0155 | FinAI:.claude/skills/quality-gate-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0156 | FinAI:.claude/skills/rag-implementation/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0157 | FinAI:.claude/skills/refactor-method-complexity-reduce/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0158 | FinAI:.claude/skills/refactor-plan/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0159 | FinAI:.claude/skills/refactor-safely.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0160 | FinAI:.claude/skills/refactor/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0161 | FinAI:.claude/skills/release-sync/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0162 | FinAI:.claude/skills/review-changes.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0163 | FinAI:.claude/skills/review-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0164 | FinAI:.claude/skills/review-phase/checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0165 | FinAI:.claude/skills/shadcn-ui/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0166 | FinAI:.claude/skills/simplify-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0167 | FinAI:.claude/skills/simplify/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0168 | FinAI:.claude/skills/slides-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0169 | FinAI:.claude/skills/slides-uupm/references/copywriting-formulas.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0170 | FinAI:.claude/skills/slides-uupm/references/create.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0171 | FinAI:.claude/skills/slides-uupm/references/html-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0172 | FinAI:.claude/skills/slides-uupm/references/layout-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0173 | FinAI:.claude/skills/slides-uupm/references/slide-strategies.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0174 | FinAI:.claude/skills/systematic-debugging/CREATION-LOG.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0175 | FinAI:.claude/skills/systematic-debugging/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0176 | FinAI:.claude/skills/systematic-debugging/condition-based-waiting-example.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0177 | FinAI:.claude/skills/systematic-debugging/condition-based-waiting.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0178 | FinAI:.claude/skills/systematic-debugging/defense-in-depth.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0179 | FinAI:.claude/skills/systematic-debugging/find-polluter.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0180 | FinAI:.claude/skills/systematic-debugging/root-cause-tracing.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0181 | FinAI:.claude/skills/systematic-debugging/test-academic.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0182 | FinAI:.claude/skills/systematic-debugging/test-pressure-1.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0183 | FinAI:.claude/skills/systematic-debugging/test-pressure-2.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0184 | FinAI:.claude/skills/systematic-debugging/test-pressure-3.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0185 | FinAI:.claude/skills/tech-review/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0186 | FinAI:.claude/skills/test-driven-development/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0187 | FinAI:.claude/skills/test-driven-development/testing-anti-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0188 | FinAI:.claude/skills/testing-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0189 | FinAI:.claude/skills/ui-styling-uupm/LICENSE.txt | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0190 | FinAI:.claude/skills/ui-styling-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0191 | FinAI:.claude/skills/ui-styling-uupm/references/canvas-design-system.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0192 | FinAI:.claude/skills/ui-styling-uupm/references/shadcn-accessibility.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0193 | FinAI:.claude/skills/ui-styling-uupm/references/shadcn-components.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0194 | FinAI:.claude/skills/ui-styling-uupm/references/shadcn-theming.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0195 | FinAI:.claude/skills/ui-styling-uupm/references/tailwind-customization.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0196 | FinAI:.claude/skills/ui-styling-uupm/references/tailwind-responsive.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0197 | FinAI:.claude/skills/ui-styling-uupm/references/tailwind-utilities.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0198 | FinAI:.claude/skills/ui-styling-uupm/scripts/.coverage | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0199 | FinAI:.claude/skills/ui-styling-uupm/scripts/requirements.txt | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0200 | FinAI:.claude/skills/ui-styling-uupm/scripts/shadcn_add.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0201 | FinAI:.claude/skills/ui-styling-uupm/scripts/tailwind_config_gen.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0202 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/coverage-ui.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0203 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/requirements.txt | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0204 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/test_shadcn_add.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0205 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/test_tailwind_config_gen.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0206 | FinAI:.claude/skills/ui-ux-pro-max/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0207 | FinAI:.claude/skills/ui-ux-pro-max/data/_sync_all.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0208 | FinAI:.claude/skills/ui-ux-pro-max/data/app-interface.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0209 | FinAI:.claude/skills/ui-ux-pro-max/data/charts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0210 | FinAI:.claude/skills/ui-ux-pro-max/data/colors.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0211 | FinAI:.claude/skills/ui-ux-pro-max/data/design.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0212 | FinAI:.claude/skills/ui-ux-pro-max/data/draft.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0213 | FinAI:.claude/skills/ui-ux-pro-max/data/google-fonts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0214 | FinAI:.claude/skills/ui-ux-pro-max/data/icons.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0215 | FinAI:.claude/skills/ui-ux-pro-max/data/landing.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0216 | FinAI:.claude/skills/ui-ux-pro-max/data/products.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0217 | FinAI:.claude/skills/ui-ux-pro-max/data/react-performance.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0218 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/angular.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0219 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/astro.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0220 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/flutter.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0221 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/html-tailwind.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0222 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/jetpack-compose.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0223 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/laravel.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0224 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/nextjs.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0225 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/nuxt-ui.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0226 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/nuxtjs.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0227 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/react-native.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0228 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/react.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0229 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/shadcn.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0230 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/svelte.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0231 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/swiftui.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0232 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/threejs.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0233 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/vue.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0234 | FinAI:.claude/skills/ui-ux-pro-max/data/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0235 | FinAI:.claude/skills/ui-ux-pro-max/data/typography.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0236 | FinAI:.claude/skills/ui-ux-pro-max/data/ui-reasoning.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0237 | FinAI:.claude/skills/ui-ux-pro-max/data/ux-guidelines.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0238 | FinAI:.claude/skills/ui-ux-pro-max/scripts/core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0239 | FinAI:.claude/skills/ui-ux-pro-max/scripts/design_system.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0240 | FinAI:.claude/skills/ui-ux-pro-max/scripts/search.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0241 | FinAI:.claude/skills/ux-copy-review/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0242 | FinAI:.claude/skills/verification-before-completion/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0243 | FinAI:.claude/skills/webapp-testing/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0244 | FinAI:.claude/skills/work-planning/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0245 | FinAI:.claude/skills/writing-plans/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0246 | FinAI:.claude/skills/writing-plans/plan-document-reviewer-prompt.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0247 | FinAI:.claude/templates/state-template.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Full file read required before classification. |
| FINAI-0248 | FinAI:.codex/README.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0249 | FinAI:.codex/agents/analyst.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0250 | FinAI:.codex/agents/architect.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0251 | FinAI:.codex/agents/code-simplifier.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0252 | FinAI:.codex/agents/deep-reviewer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0253 | FinAI:.codex/agents/delivery-agent.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0254 | FinAI:.codex/agents/feature-developer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0255 | FinAI:.codex/agents/findings-arbiter.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0256 | FinAI:.codex/agents/math-genius.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0257 | FinAI:.codex/agents/paranoid-architect.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0258 | FinAI:.codex/agents/performance-expert.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0259 | FinAI:.codex/agents/product-manager.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0260 | FinAI:.codex/agents/prt-code-reviewer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0261 | FinAI:.codex/agents/prt-code-simplifier.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0262 | FinAI:.codex/agents/prt-comment-analyzer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0263 | FinAI:.codex/agents/prt-pr-test-analyzer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0264 | FinAI:.codex/agents/prt-silent-failure-hunter.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0265 | FinAI:.codex/agents/prt-type-design-analyzer.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0266 | FinAI:.codex/agents/qa-expert.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0267 | FinAI:.codex/agents/ux-expert.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0268 | FinAI:.codex/claude-interop.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0269 | FinAI:.codex/code-review-graph-constraints.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0270 | FinAI:.codex/guides/code-review-graph-usage.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0271 | FinAI:.codex/guides/gan-protocol.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0272 | FinAI:.codex/guides/systematic-debugging.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0273 | FinAI:.codex/guides/test-driven-development.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0274 | FinAI:.codex/guides/ui-ux-pro-max-reference.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0275 | FinAI:.codex/guides/verification-before-completion.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0276 | FinAI:.codex/guides/worktree-workflow.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0277 | FinAI:.codex/mcp.codex.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0278 | FinAI:.codex/orchestration-policy.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0279 | FinAI:.codex/settings.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0280 | FinAI:.codex/skills/accessibility-audit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0281 | FinAI:.codex/skills/architecture-designer/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0282 | FinAI:.codex/skills/architecture-designer/references/adr-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0283 | FinAI:.codex/skills/architecture-designer/references/architecture-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0284 | FinAI:.codex/skills/architecture-designer/references/database-selection.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0285 | FinAI:.codex/skills/architecture-designer/references/nfr-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0286 | FinAI:.codex/skills/architecture-designer/references/system-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0287 | FinAI:.codex/skills/architecture-patterns/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0288 | FinAI:.codex/skills/architecture-patterns/references/violation-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0289 | FinAI:.codex/skills/architecture-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0290 | FinAI:.codex/skills/banner-design-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0291 | FinAI:.codex/skills/banner-design-uupm/references/banner-sizes-and-styles.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0292 | FinAI:.codex/skills/brainstorming/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0293 | FinAI:.codex/skills/brainstorming/scripts/frame-template.html | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0294 | FinAI:.codex/skills/brainstorming/scripts/helper.js | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0295 | FinAI:.codex/skills/brainstorming/scripts/server.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0296 | FinAI:.codex/skills/brainstorming/scripts/start-server.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0297 | FinAI:.codex/skills/brainstorming/scripts/stop-server.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0298 | FinAI:.codex/skills/brainstorming/spec-document-reviewer-prompt.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0299 | FinAI:.codex/skills/brainstorming/visual-companion.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0300 | FinAI:.codex/skills/brand-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0301 | FinAI:.codex/skills/brand-uupm/references/approval-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0302 | FinAI:.codex/skills/brand-uupm/references/asset-organization.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0303 | FinAI:.codex/skills/brand-uupm/references/brand-guideline-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0304 | FinAI:.codex/skills/brand-uupm/references/color-palette-management.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0305 | FinAI:.codex/skills/brand-uupm/references/consistency-checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0306 | FinAI:.codex/skills/brand-uupm/references/logo-usage-rules.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0307 | FinAI:.codex/skills/brand-uupm/references/messaging-framework.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0308 | FinAI:.codex/skills/brand-uupm/references/typography-specifications.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0309 | FinAI:.codex/skills/brand-uupm/references/update.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0310 | FinAI:.codex/skills/brand-uupm/references/visual-identity.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0311 | FinAI:.codex/skills/brand-uupm/references/voice-framework.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0312 | FinAI:.codex/skills/brand-uupm/scripts/extract-colors.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0313 | FinAI:.codex/skills/brand-uupm/scripts/inject-brand-context.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0314 | FinAI:.codex/skills/brand-uupm/scripts/sync-brand-to-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0315 | FinAI:.codex/skills/brand-uupm/scripts/validate-asset.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0316 | FinAI:.codex/skills/brand-uupm/templates/brand-guidelines-starter.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0317 | FinAI:.codex/skills/bugfix-flow/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0318 | FinAI:.codex/skills/commit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0319 | FinAI:.codex/skills/debug-issue.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0320 | FinAI:.codex/skills/delivery-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0321 | FinAI:.codex/skills/design-audit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0322 | FinAI:.codex/skills/design-audit/audit-dimensions.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0323 | FinAI:.codex/skills/design-audit/ux-principles.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0324 | FinAI:.codex/skills/design-system-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0325 | FinAI:.codex/skills/design-system-uupm/data/slide-backgrounds.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0326 | FinAI:.codex/skills/design-system-uupm/data/slide-charts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0327 | FinAI:.codex/skills/design-system-uupm/data/slide-color-logic.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0328 | FinAI:.codex/skills/design-system-uupm/data/slide-copy.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0329 | FinAI:.codex/skills/design-system-uupm/data/slide-layout-logic.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0330 | FinAI:.codex/skills/design-system-uupm/data/slide-layouts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0331 | FinAI:.codex/skills/design-system-uupm/data/slide-strategies.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0332 | FinAI:.codex/skills/design-system-uupm/data/slide-typography.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0333 | FinAI:.codex/skills/design-system-uupm/references/component-specs.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0334 | FinAI:.codex/skills/design-system-uupm/references/component-tokens.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0335 | FinAI:.codex/skills/design-system-uupm/references/primitive-tokens.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0336 | FinAI:.codex/skills/design-system-uupm/references/semantic-tokens.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0337 | FinAI:.codex/skills/design-system-uupm/references/states-and-variants.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0338 | FinAI:.codex/skills/design-system-uupm/references/tailwind-integration.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0339 | FinAI:.codex/skills/design-system-uupm/references/token-architecture.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0340 | FinAI:.codex/skills/design-system-uupm/scripts/embed-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0341 | FinAI:.codex/skills/design-system-uupm/scripts/fetch-background.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0342 | FinAI:.codex/skills/design-system-uupm/scripts/generate-slide.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0343 | FinAI:.codex/skills/design-system-uupm/scripts/generate-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0344 | FinAI:.codex/skills/design-system-uupm/scripts/html-token-validator.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0345 | FinAI:.codex/skills/design-system-uupm/scripts/search-slides.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0346 | FinAI:.codex/skills/design-system-uupm/scripts/slide-token-validator.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0347 | FinAI:.codex/skills/design-system-uupm/scripts/slide_search_core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0348 | FinAI:.codex/skills/design-system-uupm/scripts/validate-tokens.cjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0349 | FinAI:.codex/skills/design-system-uupm/templates/design-tokens-starter.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0350 | FinAI:.codex/skills/design-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0351 | FinAI:.codex/skills/design-uupm/data/cip/deliverables.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0352 | FinAI:.codex/skills/design-uupm/data/cip/industries.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0353 | FinAI:.codex/skills/design-uupm/data/cip/mockup-contexts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0354 | FinAI:.codex/skills/design-uupm/data/cip/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0355 | FinAI:.codex/skills/design-uupm/data/icon/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0356 | FinAI:.codex/skills/design-uupm/data/logo/colors.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0357 | FinAI:.codex/skills/design-uupm/data/logo/industries.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0358 | FinAI:.codex/skills/design-uupm/data/logo/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0359 | FinAI:.codex/skills/design-uupm/references/banner-sizes-and-styles.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0360 | FinAI:.codex/skills/design-uupm/references/cip-deliverable-guide.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0361 | FinAI:.codex/skills/design-uupm/references/cip-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0362 | FinAI:.codex/skills/design-uupm/references/cip-prompt-engineering.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0363 | FinAI:.codex/skills/design-uupm/references/cip-style-guide.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0364 | FinAI:.codex/skills/design-uupm/references/design-routing.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0365 | FinAI:.codex/skills/design-uupm/references/icon-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0366 | FinAI:.codex/skills/design-uupm/references/logo-color-psychology.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0367 | FinAI:.codex/skills/design-uupm/references/logo-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0368 | FinAI:.codex/skills/design-uupm/references/logo-prompt-engineering.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0369 | FinAI:.codex/skills/design-uupm/references/logo-style-guide.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0370 | FinAI:.codex/skills/design-uupm/references/slides-copywriting-formulas.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0371 | FinAI:.codex/skills/design-uupm/references/slides-create.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0372 | FinAI:.codex/skills/design-uupm/references/slides-html-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0373 | FinAI:.codex/skills/design-uupm/references/slides-layout-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0374 | FinAI:.codex/skills/design-uupm/references/slides-strategies.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0375 | FinAI:.codex/skills/design-uupm/references/slides.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0376 | FinAI:.codex/skills/design-uupm/references/social-photos-design.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0377 | FinAI:.codex/skills/design-uupm/scripts/cip/core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0378 | FinAI:.codex/skills/design-uupm/scripts/cip/generate.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0379 | FinAI:.codex/skills/design-uupm/scripts/cip/render-html.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0380 | FinAI:.codex/skills/design-uupm/scripts/cip/search.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0381 | FinAI:.codex/skills/design-uupm/scripts/icon/generate.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0382 | FinAI:.codex/skills/design-uupm/scripts/logo/core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0383 | FinAI:.codex/skills/design-uupm/scripts/logo/generate.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0384 | FinAI:.codex/skills/design-uupm/scripts/logo/search.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0385 | FinAI:.codex/skills/desloppify/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0386 | FinAI:.codex/skills/devils-advocate/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0387 | FinAI:.codex/skills/devils-advocate/references/ai-blind-spots.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0388 | FinAI:.codex/skills/devils-advocate/references/blind-spots.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0389 | FinAI:.codex/skills/devils-advocate/references/questioning-frameworks.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0390 | FinAI:.codex/skills/e2e-testing-patterns/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0391 | FinAI:.codex/skills/e2e-testing/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0392 | FinAI:.codex/skills/explore-codebase.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0393 | FinAI:.codex/skills/fix-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0394 | FinAI:.codex/skills/flow-infra-sync/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0395 | FinAI:.codex/skills/frontend-design/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0396 | FinAI:.codex/skills/implementation-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0397 | FinAI:.codex/skills/improve-codebase-architecture/REFERENCE.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0398 | FinAI:.codex/skills/improve-codebase-architecture/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0399 | FinAI:.codex/skills/next-best-practices/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0400 | FinAI:.codex/skills/phase-check/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0401 | FinAI:.codex/skills/plan-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0402 | FinAI:.codex/skills/planning-lifecycle/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0403 | FinAI:.codex/skills/pr-review-toolkit/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0404 | FinAI:.codex/skills/product-review/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0405 | FinAI:.codex/skills/qa-policy.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0406 | FinAI:.codex/skills/quality-gate-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0407 | FinAI:.codex/skills/rag-implementation/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0408 | FinAI:.codex/skills/refactor-method-complexity-reduce/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0409 | FinAI:.codex/skills/refactor-plan/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0410 | FinAI:.codex/skills/refactor-safely.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0411 | FinAI:.codex/skills/refactor/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0412 | FinAI:.codex/skills/release-sync/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0413 | FinAI:.codex/skills/review-changes.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0414 | FinAI:.codex/skills/review-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0415 | FinAI:.codex/skills/review-phase/checklist.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0416 | FinAI:.codex/skills/review-policy.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0417 | FinAI:.codex/skills/shadcn-ui/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0418 | FinAI:.codex/skills/simplify-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0419 | FinAI:.codex/skills/simplify/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0420 | FinAI:.codex/skills/slides-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0421 | FinAI:.codex/skills/slides-uupm/references/copywriting-formulas.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0422 | FinAI:.codex/skills/slides-uupm/references/create.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0423 | FinAI:.codex/skills/slides-uupm/references/html-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0424 | FinAI:.codex/skills/slides-uupm/references/layout-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0425 | FinAI:.codex/skills/slides-uupm/references/slide-strategies.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0426 | FinAI:.codex/skills/systematic-debugging/CREATION-LOG.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0427 | FinAI:.codex/skills/systematic-debugging/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0428 | FinAI:.codex/skills/systematic-debugging/condition-based-waiting-example.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0429 | FinAI:.codex/skills/systematic-debugging/condition-based-waiting.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0430 | FinAI:.codex/skills/systematic-debugging/defense-in-depth.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0431 | FinAI:.codex/skills/systematic-debugging/find-polluter.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0432 | FinAI:.codex/skills/systematic-debugging/root-cause-tracing.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0433 | FinAI:.codex/skills/systematic-debugging/test-academic.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0434 | FinAI:.codex/skills/systematic-debugging/test-pressure-1.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0435 | FinAI:.codex/skills/systematic-debugging/test-pressure-2.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0436 | FinAI:.codex/skills/systematic-debugging/test-pressure-3.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0437 | FinAI:.codex/skills/tech-review/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0438 | FinAI:.codex/skills/test-driven-development/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0439 | FinAI:.codex/skills/test-driven-development/testing-anti-patterns.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0440 | FinAI:.codex/skills/testing-phase/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0441 | FinAI:.codex/skills/ui-styling-uupm/LICENSE.txt | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0442 | FinAI:.codex/skills/ui-styling-uupm/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0443 | FinAI:.codex/skills/ui-styling-uupm/references/canvas-design-system.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0444 | FinAI:.codex/skills/ui-styling-uupm/references/shadcn-accessibility.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0445 | FinAI:.codex/skills/ui-styling-uupm/references/shadcn-components.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0446 | FinAI:.codex/skills/ui-styling-uupm/references/shadcn-theming.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0447 | FinAI:.codex/skills/ui-styling-uupm/references/tailwind-customization.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0448 | FinAI:.codex/skills/ui-styling-uupm/references/tailwind-responsive.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0449 | FinAI:.codex/skills/ui-styling-uupm/references/tailwind-utilities.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0450 | FinAI:.codex/skills/ui-styling-uupm/scripts/.coverage | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0451 | FinAI:.codex/skills/ui-styling-uupm/scripts/requirements.txt | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0452 | FinAI:.codex/skills/ui-styling-uupm/scripts/shadcn_add.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0453 | FinAI:.codex/skills/ui-styling-uupm/scripts/tailwind_config_gen.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0454 | FinAI:.codex/skills/ui-styling-uupm/scripts/tests/coverage-ui.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0455 | FinAI:.codex/skills/ui-styling-uupm/scripts/tests/requirements.txt | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0456 | FinAI:.codex/skills/ui-styling-uupm/scripts/tests/test_shadcn_add.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0457 | FinAI:.codex/skills/ui-styling-uupm/scripts/tests/test_tailwind_config_gen.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0458 | FinAI:.codex/skills/ui-ux-pro-max/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0459 | FinAI:.codex/skills/ui-ux-pro-max/data/_sync_all.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0460 | FinAI:.codex/skills/ui-ux-pro-max/data/app-interface.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0461 | FinAI:.codex/skills/ui-ux-pro-max/data/charts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0462 | FinAI:.codex/skills/ui-ux-pro-max/data/colors.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0463 | FinAI:.codex/skills/ui-ux-pro-max/data/design.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0464 | FinAI:.codex/skills/ui-ux-pro-max/data/draft.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0465 | FinAI:.codex/skills/ui-ux-pro-max/data/google-fonts.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0466 | FinAI:.codex/skills/ui-ux-pro-max/data/icons.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0467 | FinAI:.codex/skills/ui-ux-pro-max/data/landing.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0468 | FinAI:.codex/skills/ui-ux-pro-max/data/products.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0469 | FinAI:.codex/skills/ui-ux-pro-max/data/react-performance.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0470 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/angular.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0471 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/astro.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0472 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/flutter.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0473 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/html-tailwind.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0474 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/jetpack-compose.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0475 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/laravel.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0476 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/nextjs.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0477 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/nuxt-ui.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0478 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/nuxtjs.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0479 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/react-native.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0480 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/react.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0481 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/shadcn.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0482 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/svelte.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0483 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/swiftui.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0484 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/threejs.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0485 | FinAI:.codex/skills/ui-ux-pro-max/data/stacks/vue.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0486 | FinAI:.codex/skills/ui-ux-pro-max/data/styles.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0487 | FinAI:.codex/skills/ui-ux-pro-max/data/typography.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0488 | FinAI:.codex/skills/ui-ux-pro-max/data/ui-reasoning.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0489 | FinAI:.codex/skills/ui-ux-pro-max/data/ux-guidelines.csv | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0490 | FinAI:.codex/skills/ui-ux-pro-max/scripts/core.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0491 | FinAI:.codex/skills/ui-ux-pro-max/scripts/design_system.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0492 | FinAI:.codex/skills/ui-ux-pro-max/scripts/search.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0493 | FinAI:.codex/skills/ux-copy-review/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0494 | FinAI:.codex/skills/verification-before-completion/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0495 | FinAI:.codex/skills/webapp-testing/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0496 | FinAI:.codex/skills/work-planning/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0497 | FinAI:.codex/skills/writing-plans/SKILL.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0498 | FinAI:.codex/skills/writing-plans/plan-document-reviewer-prompt.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex mirror candidate; likely GENERATED or ADAPTER_TARGET after review. |
| FINAI-0499 | FinAI:.codex/sync-manifest.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0500 | FinAI:.codex/templates/agent-report-template.codex.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Codex target/manual policy candidate; check for tool-specific differences. |
| FINAI-0501 | FinAI:AGENTS.md | ADAPTER_TARGET | codex + finai.example profile | replace-with-generated | CLASSIFIED | `templates/targets/codex/AGENTS.md.hbs` | Full file read 2026-05-08 with `.claude/CLAUDE.md` and root `CLAUDE.md` context. This is a Codex root entrypoint containing target-specific syntax plus mirrored lifecycle semantics; FinAI task IDs, protected branches, Cloudflare/Telegram/runtime paths, financial/domain experts, roadmap docs, and `cf` checks must render from canonical core, config, packs, or the `finai.example` profile. |
| FINAI-0502 | FinAI:CLAUDE.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Claude root target candidate; render from canonical parity templates. |
| FINAI-0503 | FinAI:docs/templates/agent-report-template.md | CORE | core artifact template | port-as-core | CLASSIFIED | `templates/shared/docs/templates/agent-report-template.md.hbs` | Full file read 2026-05-08 with Codex compatibility shim. Compact `AGENT_REPORT` schema is generic and portable; handoff path should render from configured artifact roots instead of hardcoding `docs/phases/phase-<token>/handoffs/...`. |
| FINAI-0504 | FinAI:docs/templates/design-document-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Artifact template candidate; replace project values with config placeholders. |
| FINAI-0505 | FinAI:docs/templates/qa-report-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Artifact template candidate; replace project values with config placeholders. |
| FINAI-0506 | FinAI:docs/templates/state-template.json | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Artifact template candidate; replace project values with config placeholders. |
| FINAI-0507 | FinAI:docs/templates/walkthrough-template.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Artifact template candidate; replace project values with config placeholders. |
| FINAI-0508 | FinAI:scripts/agent-sync-hook.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0509 | FinAI:scripts/audit-arch.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0510 | FinAI:scripts/audit_gate.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0511 | FinAI:scripts/check-code-review-graph-research.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0512 | FinAI:scripts/check-codex-review.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0513 | FinAI:scripts/check-roadmap-consistency.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | planning-docs pack candidate; not core. |
| FINAI-0514 | FinAI:scripts/codex-check-code-review-graph-research.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0515 | FinAI:scripts/codex-check-plan-review.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0516 | FinAI:scripts/codex-ops-canary.mjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0517 | FinAI:scripts/codex-phase-check.mjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0518 | FinAI:scripts/codex-review-gate.mjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0519 | FinAI:scripts/codex-validate-phase.mjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0520 | FinAI:scripts/codex-validate-skills-format.mjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0521 | FinAI:scripts/crg-embed.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0522 | FinAI:scripts/crg-full-pipeline.py | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0523 | FinAI:scripts/generate-map.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0524 | FinAI:scripts/generate-project-map.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0525 | FinAI:scripts/install-agent-sync-hooks.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0526 | FinAI:scripts/install-crg-hooks.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0527 | FinAI:scripts/lib/agent-sync.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0528 | FinAI:scripts/migrate.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0529 | FinAI:scripts/park-worktrees.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Delivery utility candidate; branch policy must come from config. |
| FINAI-0530 | FinAI:scripts/report-delivery-state.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Delivery utility candidate; branch policy must come from config. |
| FINAI-0531 | FinAI:scripts/serve-code-review-graph.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0532 | FinAI:scripts/setup-db.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0533 | FinAI:scripts/sync-claude-to-codex.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0534 | FinAI:scripts/test-report-delivery-state.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0535 | FinAI:scripts/test-worktree-parking.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0536 | FinAI:scripts/validate-phase.mjs | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
| FINAI-0537 | FinAI:scripts/validate-skill-references.ts | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Script candidate; classify core/pack/out-of-scope after full read. |
