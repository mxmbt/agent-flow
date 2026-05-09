# Document Migration Protocol

**Created:** 2026-05-08
**Applies to:** extracting FinAI reference orchestration docs into Agent Flow core, packs, config, and adapters
**Status:** Draft rule

---

## Rule

Do not migrate orchestration documents in bulk.

The `agent-flow` repo starts from an empty package baseline. This protocol applies only to FinAI reference files or future source files that are explicitly selected for extraction.

Every source file must be migrated as either:

1. one file per task, or
2. one tightly coupled micro-batch of at most three files when those files are generated mirrors or direct target variants of the same canonical content.

Examples:

- Good: migrate `.claude/agents/feature-developer.md` alone.
- Good: migrate canonical `feature-developer` content plus rendered Claude/Codex target snapshots in one task.
- Bad: migrate all agents in one task.
- Bad: copy `.claude/**` and then run a project-name replacement.

The migration agent must read the full file content before deciding where it belongs. Filename alone is not enough.

---

## Classification

Each file gets exactly one primary classification:

| Classification | Meaning |
|----------------|---------|
| `UNCLASSIFIED` | Raw inventory row; full file read has not happened yet |
| `CORE` | Project-agnostic lifecycle/process content |
| `ADAPTER_TARGET` | Tool-specific rendering target for Claude or Codex |
| `PACK` | Reusable domain/runtime capability |
| `PROFILE` | Example or starter project configuration |
| `GENERATED` | Output produced from canonical templates |
| `VENDOR` | Third-party or adapted skill requiring provenance/licensing |
| `OBSOLETE` | Stale flow that should not be ported |
| `OUT_OF_SCOPE` | Project/runtime file caught by broad scan but not part of Agent Flow |

Secondary tags may be added:

- `claude-specific`
- `codex-specific`
- `mcp`
- `git`
- `delivery`
- `qa`
- `frontend`
- `runtime`
- `domain`
- `template`

---

## Migration Status Register

Maintain the migration dashboard and per-file register at:

```text
docs/roadmap/document-migration-status.md
```

This is the single source of truth for migration progress. Do not create a separate ledger unless this file becomes too large to use.

Maintain recurring review decisions at:

```text
docs/roadmap/migration-review-decisions.md
```

Use the shared decision register for patterns that repeat across files. Once a decision is accepted there, apply it consistently in later migrations unless new evidence requires reopening it.

Each FinAI reference source file must have one row:

```markdown
| Source | Target | Classification | Pack/Config | Decision | Status | Notes |
|--------|--------|----------------|--------------|----------|--------|-------|
| FinAI:.claude/agents/feature-developer.md | templates/canonical/agents/feature-developer.md.hbs | UNCLASSIFIED | — | defer | RAW_SCANNED | full file read required |
```

Allowed decisions:

- `port-as-core`
- `port-as-target`
- `port-as-pack`
- `keep-as-vendor`
- `replace-with-generated`
- `out-of-scope`
- `obsolete`
- `defer`

Status values:

- `RAW_SCANNED`
- `CLASSIFIED`
- `TASKED`
- `MIGRATED`
- `VALIDATED`
- `SKIPPED`

Legacy task-planning values may appear inside future task descriptions, but the migration register itself uses the status vocabulary above.

---

## Per-File Checklist

Before editing:

- [ ] Read the full source file.
- [ ] Read any direct mirror or sibling variant, if one exists.
- [ ] Identify whether the file is source, generated mirror, manual policy, vendor asset, or obsolete.
- [ ] Add or update the migration status register row.
- [ ] Decide target: core, adapter target, pack, config-backed generated content, vendor, obsolete.

Project-specific scan:

- [ ] Product names: `FinAI`, `ZNAI`, project-specific brand names.
- [ ] Task IDs and prefixes: `FINAI-*`, sprint-specific IDs, milestone names.
- [ ] Runtime stack: `cf/`, Wrangler, Cloudflare Workers, D1, R2, KV, Telegram, OpenBrowser, Prisma, tRPC, Supabase, etc.
- [ ] Branch policy: hardcoded `develop`, `master`, release-sync assumptions.
- [ ] Commands: `cd cf && npm test`, `npm run lint`, framework-specific checks.
- [ ] Docs paths: `PROGRESS.md`, `docs/ROADMAP.md`, `docs/tasks.md`, `ARCHITECTURE_MULTI_USER.md`.
- [ ] Absolute paths: `/Users/...`, local workspace names, machine-local MCP paths.
- [ ] GitHub repo paths: hardcoded owner/repo refs.
- [ ] Generated notices: repo-local commands such as `npm run agents:sync` that may not exist in consumers.

Extraction rules:

- [ ] Create a copy-as-is baseline first. Preserve source wording, links, commands, and assumptions before making any universality edits.
- [ ] Record project-specific assumptions as findings after the baseline exists.
- [ ] Check `docs/roadmap/migration-review-decisions.md` for accepted decisions that already cover the finding.
- [ ] Decide manually whether each finding stays temporarily, moves to core, moves to a pack, becomes config, gets neutralized as source-specific wording, or is skipped.
- [ ] Move Claude/Codex syntax differences into target adapters only after the baseline comparison is understood.
- [ ] Move reusable runtime/domain rules into packs only after explicit review.
- [ ] Move project-local values into `.agent-flow/config.json` only after explicit review.
- [ ] Delete or skip obsolete content instead of preserving it.
- [ ] Preserve vendor provenance and license metadata.

Universal AI documentation quality:

- [ ] First preserve the original agent/skill behavior as close to exactly as possible.
- [ ] Then review what is too project-specific for a public package.
- [ ] Cross-links to guides, skills, and docs are allowed in the baseline if they existed in source.
- [ ] Do not remove cross-links, commands, or assumptions automatically; record them as review findings.
- [ ] Requirements are phrased as configurable contracts only after the review decision says to generalize them.
- [ ] Examples use neutral placeholders only after the review decision says to generalize them.
- [ ] The doc can eventually be installed into an empty repo without false claims, but this can require follow-up pack/config work.
- [ ] The doc can be rendered for Claude and Codex without semantic drift.
- [ ] Tool-specific instructions are isolated and explicitly marked.
- [ ] Any placeholder introduced for universalization has an explainable config or pack source. User-facing onboarding must not require reading template internals to understand where generated values come from.

Validation:

- [ ] Run migration similarity check for prompt/docs migrations. The initial baseline should target near-exact similarity.
- [ ] Run universality scan as an advisory report of project-specific findings, not as an automatic rewrite instruction.
- [ ] Complete manual universality review and record recurring decisions in `docs/roadmap/migration-review-decisions.md` before generalizing content.
- [ ] Run agnostic literal scan for files that are marked ready as public core.
- [ ] Run mirror parity validation when Claude/Codex targets are affected.
- [ ] Run pack composition validation when packs are affected.
- [ ] Run snapshot tests for rendered output.
- [ ] Run temp-repo install test if installer-visible output changed.
- [ ] Update `docs/roadmap/document-migration-status.md` status and notes.

---

## Per-File Task Template

```markdown
### AF-MIG-<N>

**Source:** `<source path>`
**Target:** `<target path>`
**Classification:** CORE | ADAPTER_TARGET | PACK | PROFILE | GENERATED | VENDOR | OBSOLETE
**Pack/Config:** `<name or —>`
**Status:** TODO

#### Goal

Migrate this file into project-agnostic Agent Flow without copying project-specific assumptions.

#### Required Reading

- `<source path>`
- `<mirror/sibling path if applicable>`
- `docs/roadmap/document-migration-protocol.md`
- `docs/roadmap/document-migration-status.md`

#### Checklist

- [ ] Full file read
- [ ] Project-specific assumptions identified
- [ ] Target classification confirmed
- [ ] Universal content extracted
- [ ] Project-specific content routed to config/pack, neutralized, or skipped
- [ ] Rendered output validated
- [ ] Migration status updated

#### Acceptance Criteria

- The target file is generated or written in the correct layer.
- Copy-as-is baseline output is near-exact unless an explicit reviewed exception exists.
- Project-specific findings are recorded separately from the baseline.
- Public-core readiness requires manual universality decisions; the advisory scan alone is not sufficient.
- Claude/Codex parity is preserved when relevant.
- Tests or snapshots cover the rendered output.
```

---

## Batch Size Policy

Default: one file per migration task.

Allowed micro-batches:

- one canonical file plus its Claude/Codex rendered targets
- one skill `SKILL.md` plus its own checklist/reference file
- one script plus its direct unit test
- one template plus its render snapshot

Forbidden batches:

- all agents
- all skills
- all scripts
- all templates
- all Claude/Codex docs together

If a batch feels convenient because the files are "similar", split it. Similar files are exactly where hidden project-specific assumptions get missed.
