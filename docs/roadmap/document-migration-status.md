# Document Migration Status

**Created:** 2026-05-08
**Roadmap:** `docs/roadmap/project-agnostic-core-roadmap.md`
**Protocol:** `docs/roadmap/document-migration-protocol.md`
**Status:** Empty package baseline; FinAI reference inventory populated; first nineteen agent migrations, first seven guide migrations, and three UI/UX skill bundles validated and universalized

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
| File-by-file migration tasks | Started | 15 tasks | One task per source file or approved micro-batch | Agent migration now has three single-agent tasks and eight two-agent micro-batches; guide migration has three two-guide micro-batches; UI/UX migration has one approved design-pack skill-bundle batch. |
| Classified rows | Dry-run started | 106 rows | 537 rows | Classification applies only after full-file review; current sample covers root target, nineteen agents, seven guides, three UI/UX skill bundles, lifecycle skill, and artifact template. |
| Migrated rows | Started | 103 rows | TBD | `FINAI-0002` through `FINAI-0027` except `FINAI-0001`, plus the migrated UI/UX skill bundle rows, have targets and pass the similarity gate. Core agent/guide templates pass the universality scan; finance and code-review-toolkit agents, code-review-graph guide, and UI/UX Pro Max assets are pack content. |
| Universality scan | Passing | 1 targeted run | Passing in CI | Reports project/runtime/stack/domain assumptions during baseline review; current migrated core and project-agnostic pack agent/guide templates have been universalized. Finance pack agent content is excluded from the core universality manifest. |
| Claude/Codex parity validation | Partial | 12 core rendered agent pairs + 7 pack agent pairs + 5 core guide pairs + 2 pack guide pairs + 77 design pack skill asset pairs | Passing in CI | `npm test` validates Claude/Codex target rendering for migrated agent/guide pairs, pack-gated rendering, and design pack skill asset rendering. |

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
| Agents | `.claude/agents/**`, `.codex/agents/**` | 12 core migrated and validated; 7 pack agents migrated and validated | Continue one agent or approved micro-batch per task with the migration similarity gate. |
| Lifecycle skills | planning, implementation, simplify, review, fix, quality, QA, delivery | 1 dry-run classified | Keep planning/design artifacts in core; split runtime/domain assumptions into config and packs. |
| Auxiliary skills/guides | debugging, TDD, frontend, e2e, commit, architecture, design | 5 core guides, 2 pack guides, and 3 design pack skill bundles migrated and validated | Continue one guide or approved micro-batch per task; route optional-tool and vendor-derived guides through packs. |
| Scripts | sync, validation, delivery, worktree, roadmap checks | Raw registered | Split core scripts from optional packs and out-of-scope project scripts. |
| Templates | state, design document, report, QA, walkthrough | 1 dry-run classified | Convert artifact paths and project values into config placeholders. |
| MCP config | settings and MCP files | Raw registered | Classify as installer output; scan for absolute paths. |
| Packs | finance, cloudflare-worker, telegram, webapp, design | Planned | Define pack manifests before moving pack-heavy files; packs activate capabilities but do not own core planning artifacts. |

---

## Immediate Next Steps

1. Scaffold the package from an empty baseline. Done 2026-05-08: package metadata, TypeScript source tree, public README, CLI skeleton, and help smoke tests landed in Agent Flow.
2. Reconcile M0 roadmap statuses with evidence from the existing inventory/protocol docs before marking additional M0 tasks done. Done 2026-05-08: AF-M0-T3 has protocol/register evidence; AF-M0-T2 remains in progress because full classification is incomplete.
3. Review and classify three representative FinAI rows. Done 2026-05-08:
   - one root entrypoint
   - one agent
   - one lifecycle skill
4. Classify one script or artifact template row to satisfy the roadmap dry-run variant and test non-prompt extraction. Done 2026-05-08: `FINAI-0503`.
5. Start per-file migration tasks from the register below only for files selected for porting. Started 2026-05-08: `AF-MIG-0001` migrated `FINAI-0007`; `AF-MIG-0002` migrated `FINAI-0006` and `FINAI-0019`; `AF-MIG-0003` migrated `FINAI-0002` and `FINAI-0003`; `AF-MIG-0004` migrated `FINAI-0004` and `FINAI-0005`; `AF-MIG-0005` migrated `FINAI-0008` and `FINAI-0009`; `AF-MIG-0006` migrated `FINAI-0010` and `FINAI-0011`; `AF-MIG-0007` migrated `FINAI-0012`; `AF-MIG-0008` migrated `FINAI-0013` and `FINAI-0014`; `AF-MIG-0009` migrated `FINAI-0015` and `FINAI-0016`; `AF-MIG-0010` migrated `FINAI-0017` and `FINAI-0018`; `AF-MIG-0011` migrated `FINAI-0020`; `AF-MIG-0012` migrated `FINAI-0021` and `FINAI-0022`; `AF-MIG-0013` migrated `FINAI-0023` and `FINAI-0024`; `AF-MIG-0014` classified `FINAI-0025` and migrated `FINAI-0026` and `FINAI-0027`; `AF-MIG-0015` migrated `FINAI-0025`, `FINAI-0074` through `FINAI-0099`, `FINAI-0189` through `FINAI-0197`, and `FINAI-0199` through `FINAI-0240`.
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
| Project-specific assumptions appear inside useful source files | Core migration would leak FinAI runtime/domain facts if copied directly | Split each selected file into canonical core, config placeholders, optional packs, generated target output, or neutralized source-specific wording. |

---

## Migration Tasks

### AF-MIG-0001

**Source:** `FinAI:.claude/agents/feature-developer.md`
**Mirror:** `FinAI:.codex/agents/feature-developer.md`
**Target:** `templates/canonical/agents/feature-developer.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/feature-developer.md.hbs`, `templates/targets/codex/agents/feature-developer.md.hbs`
**Classification:** CORE
**Pack/Config:** core + finance/cloudflare-worker pack contributions
**Status:** VALIDATED

#### Result

Migrated the implementation/TDD/fix/report contract into a canonical agent template, then applied accepted universality decisions for config, packs, and source-specific wording.

#### Validation Evidence

- 2026-05-08: Full Claude source and Codex mirror read before migration.
- 2026-05-09: `npm test` passed with 46 tests, including rendered Claude/Codex feature-developer agent paths, target-specific guide roots, template comments, similarity checks, config explanation, sync diff preview, and universality scanner tests.
- 2026-05-08: `npm run check:universality` passes for `templates/canonical/agents/feature-developer.md.hbs` after applying accepted config/pack/source-wording decisions. Internal Agent Flow skill/guide links are accepted by MRD-0001; planning/design artifacts are accepted core by MRD-0006.
- 2026-05-08: Added migration similarity gate. `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for `FINAI-0007` at 99.00% line similarity and 99.85% token similarity against the 99% minimum after accepted universalization substitutions.

### AF-MIG-0002

**Source:** `FinAI:.claude/agents/delivery-agent.md`, `FinAI:.claude/agents/qa-expert.md`
**Mirror:** `FinAI:.codex/agents/delivery-agent.md`, `FinAI:.codex/agents/qa-expert.md`
**Target:** `templates/canonical/agents/delivery-agent.md.hbs`, `templates/canonical/agents/qa-expert.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/delivery-agent.md.hbs`, `templates/targets/codex/agents/delivery-agent.md.hbs`, `templates/targets/claude/agents/qa-expert.md.hbs`, `templates/targets/codex/agents/qa-expert.md.hbs`
**Classification:** CORE
**Pack/Config:** universalized with config, webapp/runtime/domain pack hooks, and source-specific wording removed
**Status:** VALIDATED

#### Result

Migrated the delivery and QA contracts into canonical agent templates, then applied accepted universality decisions. Planning/design artifacts and Agent Flow links stay core; app roots, checks, git branches, repository refs, and runtime surfaces render from config or pack contributions.

#### Validation Evidence

- 2026-05-08: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with 46 tests, including rendered Claude/Codex delivery-agent and qa-expert paths plus target-specific skill/guide root adaptation, config explanation, and sync diff preview.
- 2026-05-09: Follow-up universality pass moved QA live runtime URL and shared-account reference to `dev.start.url` and `artifacts.qaSharedAccountFile` per MRD-0022, and replaced hardcoded design reference paths with artifact config placeholders.
- 2026-05-08: `npm run check:universality` passed across `feature-developer`, `delivery-agent`, and `qa-expert`.
- 2026-05-08: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for `FINAI-0006`, `FINAI-0007`, and `FINAI-0019`; `FINAI-0007` is 99.00% line / 99.85% token similarity and the other two are 100.00% line / 100.00% token similarity after accepted universalization substitutions.

### AF-MIG-0003

**Source:** `FinAI:.claude/agents/analyst.md`, `FinAI:.claude/agents/architect.md`
**Mirror:** `FinAI:.codex/agents/analyst.md`, `FinAI:.codex/agents/architect.md`
**Target:** `templates/canonical/agents/analyst.md.hbs`, `templates/canonical/agents/architect.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/analyst.md.hbs`, `templates/targets/codex/agents/analyst.md.hbs`, `templates/targets/claude/agents/architect.md.hbs`, `templates/targets/codex/agents/architect.md.hbs`
**Classification:** CORE
**Pack/Config:** analyst is pure core; architect is core with runtime/storage/user-surface assumptions routed to config and packs, and architecture document paths rendered from config
**Status:** VALIDATED

#### Result

Migrated discovery and RED-architecture agent contracts into canonical templates. The analyst contract is copied as core. The architect contract keeps planning/design artifacts in core, rewrites source-specific wording, replaces concrete FinAI runtime context with configured project context plus pack contributions, and renders concrete architecture document paths from config.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with 46 tests, including rendered Claude/Codex analyst and architect paths plus target-specific skill root adaptation.
- 2026-05-09: Follow-up universality pass moved core agent CRG guidance to the configured discovery provider per MRD-0021; CRG operational guide links remain owned by the `code-review-graph` pack.
- 2026-05-09: `npm run check:universality` passed across five migrated agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for five migrated agents. `FINAI-0002` is 100.00% line / 100.00% token similarity. `FINAI-0003` is 99.42% line / 99.39% token similarity after accepted universalization substitutions for source-specific wording, runtime context, and configured architecture document paths.

### AF-MIG-0004

**Source:** `FinAI:.claude/agents/code-simplifier.md`, `FinAI:.claude/agents/deep-reviewer.md`
**Mirror:** `FinAI:.codex/agents/code-simplifier.md`, `FinAI:.codex/agents/deep-reviewer.md`
**Target:** `templates/canonical/agents/code-simplifier.md.hbs`, `templates/canonical/agents/deep-reviewer.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/code-simplifier.md.hbs`, `templates/targets/codex/agents/code-simplifier.md.hbs`, `templates/targets/claude/agents/deep-reviewer.md.hbs`, `templates/targets/codex/agents/deep-reviewer.md.hbs`
**Classification:** CORE
**Pack/Config:** code-simplifier uses configured default checks; deep-reviewer keeps review mechanics core and routes domain correctness through config/packs
**Status:** VALIDATED

#### Result

Migrated behavior-preserving simplification and deep review contracts into canonical templates. Internal skill/guide links stay as Agent Flow package links. Hardcoded FinAI app checks render from config, source-specific wording became neutral, and finance-specific review wording became configured domain correctness.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with 50 tests, including rendered Claude/Codex code-simplifier and deep-reviewer paths plus target-specific guide and skill root adaptation.
- 2026-05-09: Follow-up universality pass moved core agent CRG guidance to the configured discovery provider per MRD-0021; CRG operational guide links remain owned by the `code-review-graph` pack.
- 2026-05-09: `npm run check:universality` passed across seven migrated agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for seven migrated agents.

### AF-MIG-0005

**Source:** `FinAI:.claude/agents/findings-arbiter.md`, `FinAI:.claude/agents/math-genius.md`
**Mirror:** `FinAI:.codex/agents/findings-arbiter.md`, `FinAI:.codex/agents/math-genius.md`
**Target:** `templates/canonical/agents/findings-arbiter.md.hbs`, `templates/canonical/agents/math-genius.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/findings-arbiter.md.hbs`, `templates/targets/codex/agents/findings-arbiter.md.hbs`, `templates/targets/claude/agents/math-genius.md.hbs`, `templates/targets/codex/agents/math-genius.md.hbs`
**Classification:** `FINAI-0008` CORE; `FINAI-0009` PACK
**Pack/Config:** findings-arbiter uses configured artifact paths and generic domain-correctness routing; math-genius is finance pack content and renders only when the finance pack contributes it
**Status:** VALIDATED

#### Result

Migrated findings disposition into core and finance correctness review into the finance pack. Findings routing now uses configured roadmap and phase roots instead of hardcoded paths. The finance-specific `math-genius` agent remains finance-specific by design, has source-project wording removed, and is gated by `packs.agents`.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with 50 tests, including rendered Claude/Codex findings-arbiter paths and finance-gated math-genius rendering.
- 2026-05-09: `npm run check:universality` passed across migrated core agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for nine migrated agents.

### AF-MIG-0006

**Source:** `FinAI:.claude/agents/paranoid-architect.md`, `FinAI:.claude/agents/performance-expert.md`
**Mirror:** `FinAI:.codex/agents/paranoid-architect.md`, `FinAI:.codex/agents/performance-expert.md`
**Target:** `templates/canonical/agents/paranoid-architect.md.hbs`, `templates/canonical/agents/performance-expert.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/paranoid-architect.md.hbs`, `templates/targets/codex/agents/paranoid-architect.md.hbs`, `templates/targets/claude/agents/performance-expert.md.hbs`, `templates/targets/codex/agents/performance-expert.md.hbs`
**Classification:** CORE
**Pack/Config:** security/performance review mechanics are core; concrete runtime constraints and deployment surfaces render from config and installed packs
**Status:** VALIDATED

#### Result

Migrated security/isolation and performance QUALITY_GATE experts into canonical templates. Source-specific Cloudflare Worker, D1/R2, and Telegram/webhook repo context was replaced with configured runtime and pack-contributed review surfaces. Narrow implementation/runtime wording such as repo context, serverless constraints, webhook, database, and provider calls was generalized per MRD-0013.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with rendered Claude/Codex paranoid-architect and performance-expert paths plus target-specific guide root adaptation.
- 2026-05-09: Follow-up universality pass moved core agent CRG guidance to the configured discovery provider per MRD-0021; CRG operational guide links remain owned by the `code-review-graph` pack.
- 2026-05-09: `npm run check:universality` passed across migrated core agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for eleven migrated agents.

### AF-MIG-0007

**Source:** `FinAI:.claude/agents/product-manager.md`
**Mirror:** `FinAI:.codex/agents/product-manager.md`
**Target:** `templates/canonical/agents/product-manager.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/product-manager.md.hbs`, `templates/targets/codex/agents/product-manager.md.hbs`
**Classification:** CORE
**Pack/Config:** product planning is core; status/product/roadmap/architecture/backlog paths render from artifact config
**Status:** VALIDATED

#### Result

Migrated product planning and PR-copy review into a canonical agent template. The source-specific artifact paths now render from `.agent-flow/config.json`, including the cross-phase backlog path `artifacts.backlogFile`. Narrow repo/code wording was generalized per MRD-0013 while preserving the delivery-agent PR-copy review contract.

#### Validation Evidence

- 2026-05-09: Full Claude source and Codex mirror read before migration.
- 2026-05-09: `npm test` passed with rendered Claude/Codex product-manager paths, starter backlog creation, and existing backlog reuse.
- 2026-05-09: `npm run check:universality` passed across migrated core agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for twelve migrated agents.

### AF-MIG-0008

**Source:** `FinAI:.claude/agents/prt-code-reviewer.md`, `FinAI:.claude/agents/prt-code-simplifier.md`
**Mirror:** `FinAI:.codex/agents/prt-code-reviewer.md`, `FinAI:.codex/agents/prt-code-simplifier.md`
**Target:** `templates/canonical/agents/prt-code-reviewer.md.hbs`, `templates/canonical/agents/prt-code-simplifier.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/prt-code-reviewer.md.hbs`, `templates/targets/codex/agents/prt-code-reviewer.md.hbs`, `templates/targets/claude/agents/prt-code-simplifier.md.hbs`, `templates/targets/codex/agents/prt-code-simplifier.md.hbs`
**Classification:** PACK
**Pack/Config:** optional `code-review-toolkit` pack contributes these auxiliary coding agents; canonical bodies use target-neutral root-instruction wording and generalized style guidance
**Status:** VALIDATED

#### Result

Migrated two PR/review-toolkit auxiliary coding agents as optional pack-contributed agents instead of always-on core agents. Claude/Codex target wrappers keep tool-native metadata, while canonical bodies avoid hardcoding `CLAUDE.md`/`AGENTS.md` and route stack-specific style examples through root project instructions or installed packs per MRD-0014.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with pack-gated Claude/Codex rendering for `prt-code-reviewer` and `prt-code-simplifier`, and verified they do not render in a zero-pack install.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 30` passed for fourteen migrated agents.

### AF-MIG-0009

**Source:** `FinAI:.claude/agents/prt-comment-analyzer.md`, `FinAI:.claude/agents/prt-pr-test-analyzer.md`
**Mirror:** `FinAI:.codex/agents/prt-comment-analyzer.md`, `FinAI:.codex/agents/prt-pr-test-analyzer.md`
**Target:** `templates/canonical/agents/prt-comment-analyzer.md.hbs`, `templates/canonical/agents/prt-pr-test-analyzer.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/prt-comment-analyzer.md.hbs`, `templates/targets/codex/agents/prt-comment-analyzer.md.hbs`, `templates/targets/claude/agents/prt-pr-test-analyzer.md.hbs`, `templates/targets/codex/agents/prt-pr-test-analyzer.md.hbs`
**Classification:** PACK
**Pack/Config:** optional `code-review-toolkit` pack contributes these auxiliary coding agents; canonical bodies use change-set/root-instruction wording instead of hardcoding PR-only or tool-specific docs
**Status:** VALIDATED

#### Result

Migrated comment accuracy and test-coverage review agents as optional `code-review-toolkit` pack agents. Source-specific example names and target-specific root instruction filenames were removed from canonical bodies. Pull-request-only wording was generalized to review branches, pull requests, or equivalent change sets where the agent behavior is still the same.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with pack-gated Claude/Codex rendering for `prt-comment-analyzer` and `prt-pr-test-analyzer`, and verified they do not render in a zero-pack install.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 30` passed for sixteen migrated agents.

### AF-MIG-0010

**Source:** `FinAI:.claude/agents/prt-silent-failure-hunter.md`, `FinAI:.claude/agents/prt-type-design-analyzer.md`
**Mirror:** `FinAI:.codex/agents/prt-silent-failure-hunter.md`, `FinAI:.codex/agents/prt-type-design-analyzer.md`
**Target:** `templates/canonical/agents/prt-silent-failure-hunter.md.hbs`, `templates/canonical/agents/prt-type-design-analyzer.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/prt-silent-failure-hunter.md.hbs`, `templates/targets/codex/agents/prt-silent-failure-hunter.md.hbs`, `templates/targets/claude/agents/prt-type-design-analyzer.md.hbs`, `templates/targets/codex/agents/prt-type-design-analyzer.md.hbs`
**Classification:** PACK
**Pack/Config:** optional `code-review-toolkit` pack contributes these auxiliary coding agents; canonical bodies use change-set/root-instruction wording and generalized diagnostics/type-design language instead of stack-specific or tool-specific examples
**Status:** VALIDATED

#### Result

Migrated silent-failure and type-design review agents as optional `code-review-toolkit` pack agents. The copied behavior is preserved, while PR-only wording, `CLAUDE.md` references, specific logging/Sentry identifiers, production-code phrasing, and narrow compile-time/business-logic language were generalized for project-agnostic use.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with pack-gated Claude/Codex rendering for `prt-silent-failure-hunter` and `prt-type-design-analyzer`, and verified they do not render in a zero-pack install.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 40` passed for eighteen migrated agents.

### AF-MIG-0011

**Source:** `FinAI:.claude/agents/ux-expert.md`
**Mirror:** `FinAI:.codex/agents/ux-expert.md`
**Target:** `templates/canonical/agents/ux-expert.md.hbs`
**Target wrappers:** `templates/targets/claude/agents/ux-expert.md.hbs`, `templates/targets/codex/agents/ux-expert.md.hbs`
**Classification:** CORE
**Pack/Config:** UX/accessibility/UX-copy quality review is core; UX/design reference paths render from artifact config and are created or reused by init
**Status:** VALIDATED

#### Result

Migrated the UX QUALITY_GATE expert into a canonical agent template. Agent Flow skill links remain internal package links. Source-specific `Preferred path in FinAI` wording became neutral, phase-local research and handoff paths render from `artifacts.phaseRoot`, and UX/design reference documents render from `artifacts.uiUxSpecificationFile`, `artifacts.designSystemFile`, and `artifacts.uxWritingGuideFile`.

#### Validation Evidence

- 2026-05-09: Full Claude source and Codex mirror read before migration.
- 2026-05-09: `npm test` passed with rendered Claude/Codex `ux-expert` paths, config explanation entries, starter UX/design doc creation, and existing UX/design doc reuse.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 40` passed for nineteen migrated agents, including `FINAI-0020` at 100.00% line / 100.00% token similarity after accepted artifact-path substitutions.
- 2026-05-09: `agent-flow init` creates starter UX/design docs for bare projects and reuses common existing UX/design doc paths when present.

### AF-MIG-0012

**Source:** `FinAI:.claude/guides/code-review-graph-usage.md`, `FinAI:.claude/guides/gan-protocol.md`
**Mirror:** `FinAI:.codex/guides/code-review-graph-usage.md`, `FinAI:.codex/guides/gan-protocol.md`
**Target:** `templates/canonical/guides/code-review-graph-usage.md.hbs`, `templates/canonical/guides/gan-protocol.md.hbs`
**Target wrappers:** `templates/targets/claude/guides/code-review-graph-usage.md.hbs`, `templates/targets/codex/guides/code-review-graph-usage.md.hbs`, `templates/targets/claude/guides/gan-protocol.md.hbs`, `templates/targets/codex/guides/gan-protocol.md.hbs`
**Classification:** `FINAI-0021` PACK; `FINAI-0022` CORE
**Pack/Config:** `code-review-graph-usage` renders only when the `code-review-graph` pack contributes it; `gan-protocol` is core decision-making guidance
**Status:** VALIDATED

#### Result

Added guide rendering to the Claude/Codex target renderer. `gan-protocol` now renders as a core guide in zero-pack installs. `code-review-graph-usage` is owned by the optional `code-review-graph` pack, which also contributes the optional `codeReviewGraph` MCP server recommendation. Target-specific Claude Code/Codex names and `.claude`/`.codex` paths render from target placeholders. Planning discovery is now explicit in config: coding-project onboarding defaults to the `code-review-graph` pack when no existing Agent Flow config or custom provider is present, while custom graph providers can be declared through `discovery.codeGraphProvider`.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with rendered Claude/Codex guide paths, core guide rendering in zero-pack installs, and pack-gated `code-review-graph-usage` rendering.
- 2026-05-09: `agent-flow init` enables `code-review-graph` by default for detected coding projects without existing Agent Flow config, also enables the recommended manual `code-review-toolkit` pack, and `agent-flow doctor` reports missing, default, or custom planning discovery providers.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent/guide templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 40` passed for twenty-one migrated rows. `FINAI-0021` is 99.41% line / 99.93% token similarity after accepted target-placeholder substitutions; `FINAI-0022` is 100.00% line / 100.00% token similarity.

### AF-MIG-0013

**Source:** `FinAI:.claude/guides/systematic-debugging.md`, `FinAI:.claude/guides/test-driven-development.md`
**Mirror:** `FinAI:.codex/guides/systematic-debugging.md`, `FinAI:.codex/guides/test-driven-development.md`
**Target:** `templates/canonical/guides/systematic-debugging.md.hbs`, `templates/canonical/guides/test-driven-development.md.hbs`
**Target wrappers:** `templates/targets/claude/guides/systematic-debugging.md.hbs`, `templates/targets/codex/guides/systematic-debugging.md.hbs`, `templates/targets/claude/guides/test-driven-development.md.hbs`, `templates/targets/codex/guides/test-driven-development.md.hbs`
**Classification:** CORE
**Pack/Config:** systematic debugging and TDD are core engineering process guides; the focused single-test command renders from `checks.focusedTestCommand`
**Status:** VALIDATED

#### Result

Migrated systematic debugging and TDD guidance as core guides. The debugging guide keeps its internal Agent Flow link to the TDD guide and adapts the target guide root for Claude/Codex. The TDD guide keeps the RED/GREEN/REFACTOR mechanics, while the project-specific focused test command renders from config per MRD-0020.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with rendered Claude/Codex guide paths, guide metadata checks, target-specific guide-root adaptation, and `checks.focusedTestCommand` config explanation.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent/guide templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 40` passed for twenty-three migrated rows. `FINAI-0023` and `FINAI-0024` are both 100.00% line / 100.00% token similarity after accepted target-placeholder and focused-test-command normalization.

### AF-MIG-0014

**Source:** `FinAI:.claude/guides/ui-ux-pro-max-reference.md`, `FinAI:.claude/guides/verification-before-completion.md`, `FinAI:.claude/guides/worktree-workflow.md`
**Mirror:** `FinAI:.codex/guides/ui-ux-pro-max-reference.md`, `FinAI:.codex/guides/verification-before-completion.md`, `FinAI:.codex/guides/worktree-workflow.md`
**Target:** `templates/canonical/guides/verification-before-completion.md.hbs`, `templates/canonical/guides/worktree-workflow.md.hbs`
**Target wrappers:** `templates/targets/claude/guides/verification-before-completion.md.hbs`, `templates/targets/codex/guides/verification-before-completion.md.hbs`, `templates/targets/claude/guides/worktree-workflow.md.hbs`, `templates/targets/codex/guides/worktree-workflow.md.hbs`
**Classification:** `FINAI-0025` VENDOR; `FINAI-0026` CORE; `FINAI-0027` CORE
**Pack/Config:** `ui-ux-pro-max-reference` is deferred to design/webapp pack provenance review; verification checks render from config; worktree/GitHub delivery flow is core, with branch, remote, repository, and helper-command values rendered from config or installed Agent Flow scripts
**Status:** VALIDATED for `FINAI-0026` and `FINAI-0027`; CLASSIFIED for `FINAI-0025`

#### Result

Migrated verification-before-completion and worktree workflow as core guides. The verification guide keeps the evidence-before-claim rule and routes default checks through `checks.defaultShellBlock`, schema checks through `checks.changedSchemaInline`, and runtime config through `runtime.bindingConfigFile`. The worktree guide keeps the source delivery semantics nearly line-for-line while replacing hardcoded branch names, remote refs, repository deletion commands, task prefixes, and local worktree paths with config/rendered placeholders.

`ui-ux-pro-max-reference` was read and classified but not migrated in this slice: it is derived from an external `ui-ux-pro-max` source and should move with the related design/webapp skill files after provenance and pack boundaries are decided.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before classification/migration.
- 2026-05-09: `npm test` passed with rendered Claude/Codex guide paths and guide metadata checks.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent/guide templates.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 40` passed for twenty-five migrated rows. `FINAI-0026` and `FINAI-0027` are both 100.00% line / 100.00% token similarity after accepted config-placeholder normalization.

### AF-MIG-0015

**Source:** `FinAI:.claude/guides/ui-ux-pro-max-reference.md`, `FinAI:.claude/skills/ui-ux-pro-max/**`, `FinAI:.claude/skills/ui-styling-uupm/**`, `FinAI:.claude/skills/design-system-uupm/**`
**Mirror:** `FinAI:.codex/guides/ui-ux-pro-max-reference.md`, `FinAI:.codex/skills/ui-ux-pro-max/**`, `FinAI:.codex/skills/ui-styling-uupm/**`, `FinAI:.codex/skills/design-system-uupm/**`
**Target:** `templates/canonical/guides/ui-ux-pro-max-reference.md.hbs`, `templates/static/skills/ui-ux-pro-max/**`, `templates/static/skills/ui-styling-uupm/**`, `templates/static/skills/design-system-uupm/**`
**Target wrappers:** `templates/targets/claude/guides/ui-ux-pro-max-reference.md.hbs`, `templates/targets/codex/guides/ui-ux-pro-max-reference.md.hbs`
**Classification:** VENDOR
**Pack/Config:** optional `design` pack contributes the UI/UX Pro Max reference guide, three skill bundles, and a `design-review` validator; UX/design artifact references render from config, while skill links render through target-specific skill roots
**Status:** VALIDATED

#### Result

Migrated the UI/UX Pro Max documentation/tooling bundle as the optional `design` pack rather than core. The guide is canonicalized with artifact-path and target-root placeholders. The skill bundles are copied as static pack assets and rendered into both `.claude/skills/**` and `.codex/skills/**` with target path adaptation. Static assets receive file-type-compatible managed metadata; JSON and license files remain raw, and CSV-reading scripts skip generated metadata headers.

#### Validation Evidence

- 2026-05-09: Full Claude sources and Codex mirrors read before migration.
- 2026-05-09: `npm test` passed with pack composition, design guide rendering, 154 Claude/Codex skill-asset outputs, target path adaptation, and file-type-compatible managed headers.
- 2026-05-09: `npm run check:universality` passed across migrated core and project-agnostic pack agent/guide templates, including the UI/UX Pro Max reference guide.
- 2026-05-09: `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 20` passed for all migrated manifest rows, including the 78 UI/UX design-pack rows after accepted managed-header and CSV-reader compatibility normalization.

---

## Migration Register: FinAI Reference Files

| ID | Source | Classification | Pack/Config | Decision | Status | Target | Notes |
|----|--------|----------------|--------------|----------|--------|--------|-------|
| FINAI-0001 | FinAI:.claude/CLAUDE.md | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Claude lifecycle target candidate; split canonical content from target syntax. |
| FINAI-0002 | FinAI:.claude/agents/analyst.md | CORE | core | port-as-core | VALIDATED | `templates/canonical/agents/analyst.md.hbs` | AF-MIG-0003 validated 2026-05-09. Full Claude source and Codex mirror read. Claude/Codex wrappers render native agent files. Similarity gate passed at 100.00% line / 100.00% token similarity. `npm run check:universality` passed. |
| FINAI-0003 | FinAI:.claude/agents/architect.md | CORE | universalized with config/runtime/domain pack hooks | port-as-core | VALIDATED | `templates/canonical/agents/architect.md.hbs` | AF-MIG-0003 validated 2026-05-09. Full Claude source and Codex mirror read. Concrete FinAI runtime context was routed through config and packs per MRD-0010; user isolation remains core per MRD-0011; architecture document paths render from config per MRD-0012. Similarity gate passed at 99.42% line / 99.39% token similarity after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0004 | FinAI:.claude/agents/code-simplifier.md | CORE | default checks from config | port-as-core | VALIDATED | `templates/canonical/agents/code-simplifier.md.hbs` | AF-MIG-0004 validated 2026-05-09. Full Claude source and Codex mirror read. Hardcoded FinAI app checks render from configured default checks per MRD-0003 and MRD-0009. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0005 | FinAI:.claude/agents/deep-reviewer.md | CORE | domain correctness from config/packs | port-as-core | VALIDATED | `templates/canonical/agents/deep-reviewer.md.hbs` | AF-MIG-0004 validated 2026-05-09. Full Claude source and Codex mirror read. Source-specific wording was neutralized per MRD-0007; finance-specific review wording routes through configured domain correctness per MRD-0004. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0006 | FinAI:.claude/agents/delivery-agent.md | CORE | universalized with config/runtime/domain pack hooks | port-as-core | VALIDATED | `templates/canonical/agents/delivery-agent.md.hbs` | AF-MIG-0002 validated 2026-05-08. Full Claude source and Codex mirror read. Claude/Codex wrappers render native agent files with target-specific `.claude`/`.codex` link adaptation. Similarity gate passed at 100.00% line / 100.00% token similarity after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0007 | FinAI:.claude/agents/feature-developer.md | CORE | universalized with config/webapp/runtime/domain pack hooks | port-as-core | VALIDATED | `templates/canonical/agents/feature-developer.md.hbs` | AF-MIG-0001 validated 2026-05-08. Full Claude source and Codex mirror read. Claude/Codex wrappers render native agent files with target-specific `.claude`/`.codex` link adaptation. Similarity gate passed at 99.00% line / 99.85% token similarity after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0008 | FinAI:.claude/agents/findings-arbiter.md | CORE | configured artifact paths + generic domain correctness | port-as-core | VALIDATED | `templates/canonical/agents/findings-arbiter.md.hbs` | AF-MIG-0005 validated 2026-05-09. Full Claude source and Codex mirror read. Hardcoded phase/roadmap paths render from config; finance-specific defer wording routes to generic domain correctness. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0009 | FinAI:.claude/agents/math-genius.md | PACK | finance pack | port-as-pack | VALIDATED | `templates/canonical/agents/math-genius.md.hbs` | AF-MIG-0005 validated 2026-05-09. Full Claude source and Codex mirror read. Source-specific FinAI/ZNAI wording removed. Agent remains finance-specific by design and renders only when the finance pack contributes `math-genius`; excluded from core universality manifest. Similarity gate passed after accepted universalization substitutions. |
| FINAI-0010 | FinAI:.claude/agents/paranoid-architect.md | CORE | configured runtime + pack review surfaces | port-as-core | VALIDATED | `templates/canonical/agents/paranoid-architect.md.hbs` | AF-MIG-0006 validated 2026-05-09. Full Claude source and Codex mirror read. Cloudflare/D1/R2/Telegram repo-context bullets route through configured runtime and installed packs per MRD-0010. Webhook/repo wording generalized per MRD-0013. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0011 | FinAI:.claude/agents/performance-expert.md | CORE | configured runtime + pack performance surfaces | port-as-core | VALIDATED | `templates/canonical/agents/performance-expert.md.hbs` | AF-MIG-0006 validated 2026-05-09. Full Claude source and Codex mirror read. Cloudflare/D1/R2/provider runtime constraints route through configured runtime and installed packs per MRD-0010. Serverless/database/provider wording generalized per MRD-0013. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0012 | FinAI:.claude/agents/product-manager.md | CORE | configured artifact paths | port-as-core | VALIDATED | `templates/canonical/agents/product-manager.md.hbs` | AF-MIG-0007 validated 2026-05-09. Full Claude source and Codex mirror read. Product planning and PR-copy review are core. Source-specific `PROGRESS.md` and `docs/*` artifact paths render from config, including `artifacts.backlogFile`. Repo/code wording generalized per MRD-0013. Similarity gate passed after accepted artifact-path substitutions. `npm run check:universality` passed. |
| FINAI-0013 | FinAI:.claude/agents/prt-code-reviewer.md | PACK | code-review-toolkit pack | port-as-pack | VALIDATED | `templates/canonical/agents/prt-code-reviewer.md.hbs` | AF-MIG-0008 validated 2026-05-09. Full Claude source and Codex mirror read. Agent is auxiliary PR/review-toolkit behavior, not required core lifecycle. `CLAUDE.md`/`AGENTS.md` references generalize to root agent instructions per MRD-0014. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0014 | FinAI:.claude/agents/prt-code-simplifier.md | PACK | code-review-toolkit pack | port-as-pack | VALIDATED | `templates/canonical/agents/prt-code-simplifier.md.hbs` | AF-MIG-0008 validated 2026-05-09. Full Claude source and Codex mirror read. Agent is auxiliary PR/review-toolkit behavior, not required core lifecycle. Source-specific JS/React style examples generalize to root project instructions and installed packs per MRD-0014. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0015 | FinAI:.claude/agents/prt-comment-analyzer.md | PACK | code-review-toolkit pack | port-as-pack | VALIDATED | `templates/canonical/agents/prt-comment-analyzer.md.hbs` | AF-MIG-0009 validated 2026-05-09. Full Claude source and Codex mirror read. Agent is auxiliary PR/review-toolkit behavior, not required core lifecycle. Source-specific examples were omitted from target wrappers; canonical body passes universality. Similarity gate passed. `npm run check:universality` passed. |
| FINAI-0016 | FinAI:.claude/agents/prt-pr-test-analyzer.md | PACK | code-review-toolkit pack | port-as-pack | VALIDATED | `templates/canonical/agents/prt-pr-test-analyzer.md.hbs` | AF-MIG-0009 validated 2026-05-09. Full Claude source and Codex mirror read. Agent is auxiliary PR/review-toolkit behavior, not required core lifecycle. PR-only and `CLAUDE.md` wording generalize to change-set and root-instruction wording per MRD-0014. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0017 | FinAI:.claude/agents/prt-silent-failure-hunter.md | PACK | code-review-toolkit pack | port-as-pack | VALIDATED | `templates/canonical/agents/prt-silent-failure-hunter.md.hbs` | AF-MIG-0010 validated 2026-05-09. Full Claude source and Codex mirror read. Agent is auxiliary PR/review-toolkit behavior, not required core lifecycle. PR-only wording, `CLAUDE.md`, concrete logging/Sentry identifiers, and production-code phrasing generalize to change-set, root-instruction, diagnostics, and released-code wording per MRD-0014 and MRD-0015. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0018 | FinAI:.claude/agents/prt-type-design-analyzer.md | PACK | code-review-toolkit pack | port-as-pack | VALIDATED | `templates/canonical/agents/prt-type-design-analyzer.md.hbs` | AF-MIG-0010 validated 2026-05-09. Full Claude source and Codex mirror read. Agent is auxiliary type-design review behavior for coding-heavy projects, not required core lifecycle. Business-logic, access-modifier, constructor, and compile-time wording generalizes to domain/workflow, visibility-boundary, construction/initialization, and language-native guarantee wording per MRD-0016. Similarity gate passed after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0019 | FinAI:.claude/agents/qa-expert.md | CORE | universalized with config/webapp/runtime pack hooks | port-as-core | VALIDATED | `templates/canonical/agents/qa-expert.md.hbs` | AF-MIG-0002 validated 2026-05-08. Full Claude source and Codex mirror read. Claude/Codex wrappers render native agent files with target-specific `.claude`/`.codex` link adaptation. Similarity gate passed at 100.00% line / 100.00% token similarity after accepted universalization substitutions. `npm run check:universality` passed. |
| FINAI-0020 | FinAI:.claude/agents/ux-expert.md | CORE | configured UX/design artifact paths | port-as-core | VALIDATED | `templates/canonical/agents/ux-expert.md.hbs` | AF-MIG-0011 validated 2026-05-09. Full Claude source and Codex mirror read. UX/accessibility/UX-copy quality review is core. Hardcoded UX/design reference paths render from artifact config per MRD-0017; source-specific `Preferred path in FinAI` wording was neutralized. Similarity gate passed after accepted artifact-path substitutions. `npm run check:universality` passed. |
| FINAI-0021 | FinAI:.claude/guides/code-review-graph-usage.md | PACK | code-review-graph pack | port-as-pack | VALIDATED | `templates/canonical/guides/code-review-graph-usage.md.hbs` | AF-MIG-0012 validated 2026-05-09. Full Claude source and Codex mirror read. Guide is operational guidance for optional code-review-graph tooling, not zero-pack core. Target-specific Claude/Codex names and `.claude`/`.codex` settings paths render from target placeholders per MRD-0018. Similarity gate passed at 99.41% line / 99.93% token similarity after accepted target-placeholder substitutions. `npm run check:universality` passed. |
| FINAI-0022 | FinAI:.claude/guides/gan-protocol.md | CORE | core decision protocol | port-as-core | VALIDATED | `templates/canonical/guides/gan-protocol.md.hbs` | AF-MIG-0012 validated 2026-05-09. Full Claude source and Codex mirror read. Adversarial decision-making protocol is core orchestration guidance. Similarity gate passed at 100.00% line / 100.00% token similarity. `npm run check:universality` passed. |
| FINAI-0023 | FinAI:.claude/guides/systematic-debugging.md | CORE | core debugging guide | port-as-core | VALIDATED | `templates/canonical/guides/systematic-debugging.md.hbs` | AF-MIG-0013 validated 2026-05-09. Full Claude source and Codex mirror read. The guide is universal debugging process guidance; its internal TDD guide link renders from the target guide root. Similarity gate passed after accepted target-placeholder substitutions. `npm run check:universality` passed. |
| FINAI-0024 | FinAI:.claude/guides/test-driven-development.md | CORE | configured focused test command | port-as-core | VALIDATED | `templates/canonical/guides/test-driven-development.md.hbs` | AF-MIG-0013 validated 2026-05-09. Full Claude source and Codex mirror read. TDD process guidance is core; hardcoded single-test command examples render from `checks.focusedTestCommand` per MRD-0020. Similarity gate passed after accepted focused-test-command substitutions. `npm run check:universality` passed. |
| FINAI-0025 | FinAI:.claude/guides/ui-ux-pro-max-reference.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/canonical/guides/ui-ux-pro-max-reference.md.hbs` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror read. The guide references external `ui-ux-pro-max` v2.5 source and now migrates with the related design pack skill bundle. Artifact paths render from config and skill paths render through target roots. Similarity gate passed at 100.00% line / 100.00% token similarity. |
| FINAI-0026 | FinAI:.claude/guides/verification-before-completion.md | CORE | configured checks/runtime config | port-as-core | VALIDATED | `templates/canonical/guides/verification-before-completion.md.hbs` | AF-MIG-0014 validated 2026-05-09. Full Claude source and Codex mirror read. Evidence-before-claim guidance is core; hardcoded Worker-app checks render from `checks.defaultShellBlock`, `checks.changedSchemaInline`, and `runtime.bindingConfigFile`. Similarity gate passed at 100.00% line / 100.00% token similarity. `npm run check:universality` passed. |
| FINAI-0027 | FinAI:.claude/guides/worktree-workflow.md | CORE | configured git/worktree delivery policy | port-as-core | VALIDATED | `templates/canonical/guides/worktree-workflow.md.hbs` | AF-MIG-0014 validated 2026-05-09. Full Claude source and Codex mirror read. GitHub PR flow is core; branch names, remote refs, task prefixes, repository branch deletion, local worktree paths, and delivery helper commands render from config or installed Agent Flow scripts per MRD-0024. Similarity gate passed at 100.00% line / 100.00% token similarity. `npm run check:universality` passed. |
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
| FINAI-0039 | FinAI:.claude/skills/architecture-phase/SKILL.md | CORE | core + config/pack inputs | port-as-core | CLASSIFIED | `templates/canonical/skills/architecture-phase/SKILL.md.hbs` | Full file read 2026-05-08 with Codex mirror. RED-task architecture gate, architect prompt contract, ADR/ADD output, and state update contract are core; concrete project docs such as `ARCHITECTURE_MULTI_USER.md` and stack-specific skill choices must become config inputs or pack contributions. |
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
| FINAI-0074 | FinAI:.claude/skills/design-system-uupm/SKILL.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/SKILL.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0075 | FinAI:.claude/skills/design-system-uupm/data/slide-backgrounds.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-backgrounds.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0076 | FinAI:.claude/skills/design-system-uupm/data/slide-charts.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-charts.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0077 | FinAI:.claude/skills/design-system-uupm/data/slide-color-logic.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-color-logic.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0078 | FinAI:.claude/skills/design-system-uupm/data/slide-copy.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-copy.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0079 | FinAI:.claude/skills/design-system-uupm/data/slide-layout-logic.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-layout-logic.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0080 | FinAI:.claude/skills/design-system-uupm/data/slide-layouts.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-layouts.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0081 | FinAI:.claude/skills/design-system-uupm/data/slide-strategies.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-strategies.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0082 | FinAI:.claude/skills/design-system-uupm/data/slide-typography.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/data/slide-typography.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0083 | FinAI:.claude/skills/design-system-uupm/references/component-specs.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/references/component-specs.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0084 | FinAI:.claude/skills/design-system-uupm/references/component-tokens.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/references/component-tokens.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0085 | FinAI:.claude/skills/design-system-uupm/references/primitive-tokens.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/references/primitive-tokens.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0086 | FinAI:.claude/skills/design-system-uupm/references/semantic-tokens.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/references/semantic-tokens.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0087 | FinAI:.claude/skills/design-system-uupm/references/states-and-variants.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/references/states-and-variants.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0088 | FinAI:.claude/skills/design-system-uupm/references/tailwind-integration.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/references/tailwind-integration.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0089 | FinAI:.claude/skills/design-system-uupm/references/token-architecture.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/references/token-architecture.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0090 | FinAI:.claude/skills/design-system-uupm/scripts/embed-tokens.cjs | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/embed-tokens.cjs` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0091 | FinAI:.claude/skills/design-system-uupm/scripts/fetch-background.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/fetch-background.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0092 | FinAI:.claude/skills/design-system-uupm/scripts/generate-slide.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/generate-slide.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0093 | FinAI:.claude/skills/design-system-uupm/scripts/generate-tokens.cjs | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/generate-tokens.cjs` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0094 | FinAI:.claude/skills/design-system-uupm/scripts/html-token-validator.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/html-token-validator.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0095 | FinAI:.claude/skills/design-system-uupm/scripts/search-slides.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/search-slides.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0096 | FinAI:.claude/skills/design-system-uupm/scripts/slide-token-validator.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/slide-token-validator.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0097 | FinAI:.claude/skills/design-system-uupm/scripts/slide_search_core.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/slide_search_core.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0098 | FinAI:.claude/skills/design-system-uupm/scripts/validate-tokens.cjs | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/scripts/validate-tokens.cjs` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0099 | FinAI:.claude/skills/design-system-uupm/templates/design-tokens-starter.json | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/design-system-uupm/templates/design-tokens-starter.json` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. design-system-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
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
| FINAI-0189 | FinAI:.claude/skills/ui-styling-uupm/LICENSE.txt | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/LICENSE.txt` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0190 | FinAI:.claude/skills/ui-styling-uupm/SKILL.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/SKILL.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0191 | FinAI:.claude/skills/ui-styling-uupm/references/canvas-design-system.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/references/canvas-design-system.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0192 | FinAI:.claude/skills/ui-styling-uupm/references/shadcn-accessibility.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/references/shadcn-accessibility.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0193 | FinAI:.claude/skills/ui-styling-uupm/references/shadcn-components.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/references/shadcn-components.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0194 | FinAI:.claude/skills/ui-styling-uupm/references/shadcn-theming.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/references/shadcn-theming.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0195 | FinAI:.claude/skills/ui-styling-uupm/references/tailwind-customization.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/references/tailwind-customization.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0196 | FinAI:.claude/skills/ui-styling-uupm/references/tailwind-responsive.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/references/tailwind-responsive.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0197 | FinAI:.claude/skills/ui-styling-uupm/references/tailwind-utilities.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/references/tailwind-utilities.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0198 | FinAI:.claude/skills/ui-styling-uupm/scripts/.coverage | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Skill candidate; classify as CORE, PACK, VENDOR, or OBSOLETE after full read. |
| FINAI-0199 | FinAI:.claude/skills/ui-styling-uupm/scripts/requirements.txt | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/scripts/requirements.txt` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0200 | FinAI:.claude/skills/ui-styling-uupm/scripts/shadcn_add.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/scripts/shadcn_add.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0201 | FinAI:.claude/skills/ui-styling-uupm/scripts/tailwind_config_gen.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/scripts/tailwind_config_gen.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0202 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/coverage-ui.json | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/scripts/tests/coverage-ui.json` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0203 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/requirements.txt | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/scripts/tests/requirements.txt` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0204 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/test_shadcn_add.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/scripts/tests/test_shadcn_add.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0205 | FinAI:.claude/skills/ui-styling-uupm/scripts/tests/test_tailwind_config_gen.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-styling-uupm/scripts/tests/test_tailwind_config_gen.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-styling-uupm is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0206 | FinAI:.claude/skills/ui-ux-pro-max/SKILL.md | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/SKILL.md` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0207 | FinAI:.claude/skills/ui-ux-pro-max/data/_sync_all.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/_sync_all.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0208 | FinAI:.claude/skills/ui-ux-pro-max/data/app-interface.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/app-interface.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0209 | FinAI:.claude/skills/ui-ux-pro-max/data/charts.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/charts.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0210 | FinAI:.claude/skills/ui-ux-pro-max/data/colors.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/colors.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0211 | FinAI:.claude/skills/ui-ux-pro-max/data/design.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/design.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0212 | FinAI:.claude/skills/ui-ux-pro-max/data/draft.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/draft.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0213 | FinAI:.claude/skills/ui-ux-pro-max/data/google-fonts.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/google-fonts.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0214 | FinAI:.claude/skills/ui-ux-pro-max/data/icons.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/icons.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0215 | FinAI:.claude/skills/ui-ux-pro-max/data/landing.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/landing.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0216 | FinAI:.claude/skills/ui-ux-pro-max/data/products.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/products.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0217 | FinAI:.claude/skills/ui-ux-pro-max/data/react-performance.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/react-performance.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0218 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/angular.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/angular.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0219 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/astro.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/astro.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0220 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/flutter.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/flutter.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0221 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/html-tailwind.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/html-tailwind.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0222 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/jetpack-compose.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/jetpack-compose.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0223 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/laravel.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/laravel.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0224 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/nextjs.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/nextjs.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0225 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/nuxt-ui.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/nuxt-ui.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0226 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/nuxtjs.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/nuxtjs.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0227 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/react-native.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/react-native.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0228 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/react.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/react.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0229 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/shadcn.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/shadcn.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0230 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/svelte.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/svelte.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0231 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/swiftui.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/swiftui.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0232 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/threejs.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/threejs.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0233 | FinAI:.claude/skills/ui-ux-pro-max/data/stacks/vue.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/stacks/vue.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0234 | FinAI:.claude/skills/ui-ux-pro-max/data/styles.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/styles.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0235 | FinAI:.claude/skills/ui-ux-pro-max/data/typography.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/typography.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0236 | FinAI:.claude/skills/ui-ux-pro-max/data/ui-reasoning.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/ui-reasoning.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0237 | FinAI:.claude/skills/ui-ux-pro-max/data/ux-guidelines.csv | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/data/ux-guidelines.csv` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0238 | FinAI:.claude/skills/ui-ux-pro-max/scripts/core.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/scripts/core.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0239 | FinAI:.claude/skills/ui-ux-pro-max/scripts/design_system.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/scripts/design_system.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
| FINAI-0240 | FinAI:.claude/skills/ui-ux-pro-max/scripts/search.py | VENDOR | design pack | port-as-pack | VALIDATED | `templates/static/skills/ui-ux-pro-max/scripts/search.py` | AF-MIG-0015 validated 2026-05-09. Full Claude source and Codex mirror checked. ui-ux-pro-max is design pack vendor-derived UI/UX documentation/tooling; rendered to Claude/Codex skill roots with target path adaptation. Similarity gate passed after accepted managed-header and CSV-reader compatibility normalization. |
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
| FINAI-0501 | FinAI:AGENTS.md | ADAPTER_TARGET | codex + config/packs | replace-with-generated | CLASSIFIED | `templates/targets/codex/AGENTS.md.hbs` | Full file read 2026-05-08 with `.claude/CLAUDE.md` and root `CLAUDE.md` context. This is a Codex root entrypoint containing target-specific syntax plus mirrored lifecycle semantics; FinAI task IDs, protected branches, Cloudflare/Telegram/runtime paths, financial/domain experts, roadmap docs, and `cf` checks must render from canonical core, config, packs, or neutralized source-specific wording. |
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
| FINAI-0513 | FinAI:scripts/check-roadmap-consistency.sh | UNCLASSIFIED | TBD | defer | RAW_SCANNED | TBD after full-file review | Planning/design artifacts are core; classify this script later as core validator, optional pack validator, or out of scope after full-file review. |
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
