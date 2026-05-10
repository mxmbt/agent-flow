# Agent Flow Project-Agnostic Core Roadmap

**Created:** 2026-05-08
**Target repository:** `https://github.com/mxmbt/agent-flow`
**Working branch:** `mxmbt/nagoya`
**Reference repository:** FinAI local workspace, read-only
**Status:** Draft roadmap

---

## Purpose

Rebuild `agent-flow` into a public, project-agnostic orchestration package with a CLI installer.

The target experience:

```bash
npx @mxmbt/agent-flow init
```

The installed project should receive a complete working package:

- Claude Code entrypoints and lifecycle files
- Codex entrypoints and mirrored lifecycle files
- agents, skills, guides, templates, scripts, validators
- optional domain/runtime packs
- MCP server configuration
- project config schema and starter profile
- `doctor` checks that explain anything still missing

FinAI is a reference implementation only. No tracked FinAI files should change during this work.

---

## Key Decisions

### 1. Work Lives In agent-flow

All implementation work belongs in `mxmbt/agent-flow`.

The FinAI workspace may be used only for read-only inventory and comparison. Scratch clones or notes may live under FinAI `.context/`, but the durable roadmap and implementation artifacts must be committed to `agent-flow`.

### 2. Core + Project Adapter

Agent Flow should be split into:

```text
core
  lifecycle, agent contracts, skills, guides, artifact templates, validators

packs
  optional domain/runtime/toolkit modules such as finance, cloudflare-worker, telegram, webapp, code-review-toolkit

project adapter
  project name, docs, checks, git branches, runtime surfaces, MCP choices, domain risks

installer
  init, update, upgrade, sync, doctor, render, validate, pack add
```

Core must not mention a concrete product or stack. Project-specific behavior is supplied by `.agent-flow/config.json` or an equivalent config file loaded by the CLI.

Planning has one important abstraction: coding projects need a discovery provider for codebase maps, impact analysis, and affected-flow discovery. Core owns that provider contract. The default onboarding provider is the `code-review-graph` pack when `init` detects a code project and no existing Agent Flow config; projects with another graph/indexing tool configure `discovery.codeGraphProvider: "custom"` and describe it in `discovery.customProvider`. Core agents refer to the configured provider instead of hardcoding CRG links or MCP tools.

### 3. No Mass Replacement

Do not build this by doing a broad `FinAI -> <PROJECT>` replacement.

The correct move is boundary extraction:

- core owns lifecycle mechanics
- packs own reusable domain/runtime concerns
- project config owns local facts
- profiles compose a starting config from core + packs

FinAI is a fixture/profile proving the boundary. It is not the source code of the public core.

### 4. File-By-File Migration

Large prompt/doc moves are high-risk. Agent Flow should use file-level migration tasks and a single status register.

This applies to FinAI reference files and any future source explicitly selected for extraction. The `agent-flow` repo itself starts from an empty package baseline.

Rules:

- default migration unit: one source file
- allowed micro-batch: at most three tightly coupled files, such as one canonical file plus its Claude/Codex rendered targets
- forbidden batch: all agents, all skills, all scripts, all templates, or all root docs at once
- every migrated file starts as `UNCLASSIFIED` and must be classified as `CORE`, `ADAPTER_TARGET`, `PACK`, `PROFILE`, `GENERATED`, `VENDOR`, `OBSOLETE`, or `OUT_OF_SCOPE` after full-file review
- every migrated file must be recorded in `docs/roadmap/document-migration-status.md`
- every migration task must use `docs/roadmap/document-migration-protocol.md`

The migration agent must read the full file content before deciding whether the file is universal process, project profile, pack behavior, generated mirror, or obsolete.

### 5. Packs Are First-Class

Profiles and packs are different things.

| Concept | Purpose | Example |
|---------|---------|---------|
| Profile | A starting configuration for a project shape | `generic`, `webapp`, `finai.example` |
| Pack | A reusable capability module | `finance`, `cloudflare-worker`, `telegram`, `webapp`, `code-review-toolkit`, `design` |

Initial pack candidates:

- `finance`: financial correctness, fixed-point money, no look-ahead, optional `math-genius`
- `cloudflare-worker`: Wrangler, Worker runtime limits, D1/R2/KV deployment surfaces
- `telegram`: Telegram QA and user-facing copy constraints
- `webapp`: browser QA, accessibility, common frontend checks
- `code-review-toolkit`: auxiliary PR/code review agents that are useful for coding-heavy projects but not required for a zero-pack core install
- `design`: design/UI/brand review surfaces and quality checks
- `github-delivery`: PR, branch cleanup, delivery-state helpers
- `code-review-graph`: graph-first discovery MCP and hooks

CLI target:

```bash
agent-flow pack add finance
agent-flow pack add cloudflare-worker
agent-flow pack remove telegram
```

Packs may contribute:

- config schema extensions
- agents or expert reviewers
- skill fragments
- validation rules
- MCP recommendations
- deployment-impact surfaces
- default checks

Core QUALITY_GATE stays generic: security, correctness/domain, performance, UX. A pack may provide the domain reviewer.

### 6. Full Claude/Codex Mirroring

The current FinAI sync model mirrors `.claude/agents`, `.claude/guides`, and selected `.claude/skills` into `.codex/**`.

It does **not** fully mirror the root entrypoints:

- root `AGENTS.md`
- root `CLAUDE.md`
- `.claude/CLAUDE.md`
- `.codex/orchestration-policy.md`
- `.codex/claude-interop.md`

Those files are manually kept semantically aligned today. In Agent Flow, this should become generated parity:

```text
templates/canonical/
  lifecycle.md.hbs
  routing.md.hbs
  artifact-contracts.md.hbs
  git-policy.md.hbs
  validation-policy.md.hbs

templates/targets/claude/
  CLAUDE.md.hbs
  .claude/CLAUDE.md.hbs
  agents/**
  skills/**
  guides/**

templates/targets/codex/
  AGENTS.md.hbs
  .codex/orchestration-policy.md.hbs
  .codex/claude-interop.md.hbs
  agents/**
  skills/**
  guides/**
```

Allowed differences:

- runtime/tool syntax
- model/tool invocation instructions
- platform-specific file names required by Claude Code or Codex
- small command examples when the host tool requires different invocation syntax

Not allowed:

- different lifecycle semantics
- different artifact paths
- different state/report contracts
- different quality gates
- different phase transition rules
- root `AGENTS.md` and `CLAUDE.md` drifting by hand

### 7. Preserve Platform-Native Names

Installed projects should keep the names expected by each tool:

```text
AGENTS.md                     # Codex root entrypoint
CLAUDE.md                     # Claude Code root repo bootstrap
.claude/CLAUDE.md             # Claude-side lifecycle/orchestrator contract
.claude/agents/**
.claude/skills/**
.claude/guides/**
.codex/orchestration-policy.md
.codex/claude-interop.md
.codex/agents/**
.codex/skills/**
.codex/guides/**
docs/templates/**
scripts/**
.agent-flow/config.json
.agent-flow/manifest.json
```

The internal Agent Flow package may store templates however it wants, but rendered output should follow Claude Code and Codex conventions.

### 8. MCP Is Part Of The Package

MCP server configuration should be part of Agent Flow, not tribal setup.

The project config should describe desired MCP capabilities:

```yaml
mcp:
  mode: "recommended"
  servers:
    codeReviewGraph:
      enabled: true
      required: false
    playwright:
      enabled: true
      required: false
    context7:
      enabled: false
      required: false
```

Agent Flow should render tool-specific MCP files where possible:

- `.mcp.json` or equivalent shared MCP config when appropriate
- `.claude/settings.json` server enablement
- `.codex/mcp.codex.json` when Codex-side MCP config is needed
- docs explaining manual credentials/API keys when unavoidable

Rendered MCP config must not contain machine-local absolute paths such as `/Users/<name>/...`. When an MCP server needs a local executable or workspace path, the installer should use relative paths, env vars, or a documented `doctor` prompt.

`doctor` should detect missing MCP binaries, missing env vars, unavailable servers, and unsafe absolute paths, then explain whether the project can continue without them.

### 9. Project Commands Are Configured, Not Hardcoded

Every installed project has specific commands. Agent Flow should provide maximum setup out of the box by detecting common project shapes, then asking for or documenting only the unknowns.

Config shape:

```yaml
checks:
  default:
    - "npm test"
    - "npm run type-check"
  focusedTestCommand: "npm test -- <test-file>"
  changed:
    schema:
      - "npm run db:generate"
      - "npm run db:migrate:local"
    frontend:
      - "npm run test:e2e"
  optional:
    lint: "npm run lint"
    build: "npm run build"

dev:
  start:
    command: "npm run dev"
    url: "http://localhost:3000"

artifacts:
  qaSharedAccountFile: "docs/testing/QA-SHARED-ACCOUNT.md"

runtime:
  appRoot: "."
  deploymentImpactSurfaces: []
```

Installer behavior:

1. inspect `package.json`, lockfiles, framework files, common scripts
2. propose a profile (`generic`, `webapp`, etc.)
3. propose optional packs
4. write `.agent-flow/config.json`
5. mark uncertain commands as `needsReview`
6. make `doctor` show exactly what remains to fill

The user should usually only need to confirm or edit:

- project name and task prefix
- default verification commands
- integration branch / release branch
- optional MCP credentials
- runtime URL if live QA is desired
- domain-specific invariants, if any

Generated notices and command hints must call package-owned commands, not repo-local scripts that may not exist. For example, use `agent-flow sync` or `npx @mxmbt/agent-flow sync`, not `npm run agents:sync`, unless the installer also created that script in the consuming repo.

---

## Target Repository Layout

```text
agent-flow/
  package.json
  README.md
  docs/
    ARCHITECTURE.md
    CONFIG.md
    MCP.md
    MIGRATION.md
    PACKS.md
    PROFILES.md
    roadmap/
      document-migration-protocol.md
      document-migration-status.md
      project-agnostic-core-roadmap.md
  src/
    cli/
      index.ts
      commands/init.ts
      commands/update.ts
      commands/upgrade.ts
      commands/sync.ts
      commands/doctor.ts
      commands/render.ts
      commands/validate.ts
      commands/pack.ts
    config/
      schema.ts
      defaults.ts
      detect.ts
      load.ts
    renderer/
      render-template.ts
      managed-blocks.ts
      conflict-policy.ts
    validators/
      agnostic-scan.ts
      installed-layout.ts
      mirror-parity.ts
      mcp-health.ts
      pack-health.ts
  templates/
    canonical/
    targets/
      claude/
      codex/
    shared/
      docs/templates/
      scripts/
    profiles/
      generic.yml
      webapp.yml
      finai.example.yml
    packs/
      finance/
      cloudflare-worker/
      telegram/
      webapp/
      design/
  tests/
    fixtures/
    e2e/
```

---

## Public Config Shape

`.agent-flow/config.json`:

```json
{
  "project": {
    "name": "Example Project",
    "taskPrefix": "APP",
    "taskIdPattern": "APP-[A-Z0-9]+-T[0-9]+"
  },
  "artifacts": {
    "statusFile": "PROJECT_STATUS.md",
    "roadmapFile": "docs/ROADMAP.md",
    "productFile": "docs/PRODUCT.md",
    "architectureFile": "docs/ARCHITECTURE.md",
    "userIsolationArchitectureFile": "docs/ARCHITECTURE_MULTI_USER.md",
    "schedulingArchitectureFile": "docs/ARCHITECTURE_SCHEDULING.md",
    "backlogFile": "docs/tasks.md",
    "phaseRoot": "docs/phases",
    "walkthroughRoot": "docs/walkthroughs/agents"
  },
  "git": {
    "integrationBranch": "main",
    "releaseBranch": null,
    "branchPrefixes": ["feature", "bugfix", "hotfix", "infra"],
    "worktreeParking": false
  },
  "checks": {
    "default": ["npm test"],
    "optional": {},
    "changed": {}
  },
  "dev": {
    "start": {
      "command": null,
      "url": null
    }
  },
  "runtime": {
    "appRoot": ".",
    "deploymentImpactSurfaces": []
  },
  "quality": {
    "experts": ["paranoid-architect", "performance-expert", "ux-expert"],
    "domainExpert": null,
    "invariants": []
  },
  "packs": [],
  "mcp": {
    "mode": "recommended",
    "servers": {}
  },
  "features": {
    "claude": true,
    "codex": true,
    "codeReviewGraph": "optional",
    "releaseSync": false
  }
}
```

The CLI may also read `.agent-flow/config.yml` for users who prefer YAML, but the default installer output should be JSON for predictable schema validation and low dependency cost.

---

## Milestone Plan

## Task Index

| ID | Title | Complexity | Dependencies | Status |
|----|-------|------------|--------------|--------|
| [AF-M0-T1](#af-m0-t1) | Preserve FinAI as read-only reference | Green | none | DONE |
| [AF-M0-T2](#af-m0-t2) | Inventory FinAI reference assets | Yellow | AF-M0-T1 | DONE |
| [AF-M0-T3](#af-m0-t3) | Create migration protocol and unified status register | Yellow | AF-M0-T2 | DONE |
| [AF-M1-T1](#af-m1-t1) | Create package scaffold on empty baseline | Yellow | AF-M0-T3 | DONE |
| [AF-M1-T2](#af-m1-t2) | Add CLI command skeleton | Yellow | AF-M1-T1 | DONE |
| [AF-M2-T1](#af-m2-t1) | Implement project config schema and detection | Red | AF-M1-T2 | DONE |
| [AF-M2-T2](#af-m2-t2) | Implement template renderer and managed-file policy | Red | AF-M2-T1 | DONE |
| [AF-M2-T3](#af-m2-t3) | Define pack model and pack composition rules | Red | AF-M2-T1 | DONE |
| [AF-M3-T1](#af-m3-t1) | Build canonical lifecycle templates | Red | AF-M2-T2, AF-M2-T3 | DONE |
| [AF-M3-T2](#af-m3-t2) | Build Claude and Codex target renderers | Red | AF-M3-T1 | DONE |
| [AF-M3-T3](#af-m3-t3) | Port agents, skills, guides, and artifact templates | Red | AF-M3-T2 | DONE |
| [AF-M4-T1](#af-m4-t1) | Add full mirror parity validation | Red | AF-M3-T3 | DONE |
| [AF-M4-T2](#af-m4-t2) | Generalize git and delivery utilities | Red | AF-M4-T1 | DONE |
| [AF-M5-T1](#af-m5-t1) | Add MCP configuration rendering and health checks | Red | AF-M2-T1 | DONE |
| [AF-M5-T2](#af-m5-t2) | Add project command detection and setup prompts | Red | AF-M2-T1 | DONE |
| [AF-M6-T1](#af-m6-t1) | Implement init/update/upgrade/sync/doctor/render/validate | Red | AF-M2-T2, AF-M4-T1, AF-M5-T1 | DONE |
| [AF-M6-T2](#af-m6-t2) | Implement pack add/remove/list commands | Red | AF-M2-T3, AF-M6-T1 | DONE |
| [AF-M7-T1](#af-m7-t1) | Add generic, webapp, and finai-example profiles | Yellow | AF-M6-T1 | DONE |
| [AF-M7-T2](#af-m7-t2) | Add finance, cloudflare-worker, telegram, and webapp packs | Red | AF-M6-T2 | DONE |
| [AF-M8-T1](#af-m8-t1) | Add temp-repo install tests and agnostic scans | Red | AF-M7-T2 | DONE |
| [AF-M9-T1](#af-m9-t1) | Write public docs and migration guide | Yellow | AF-M8-T1 | DONE |
| [AF-M10-T1](#af-m10-t1) | Publish first release | Yellow | AF-M9-T1 | TODO |

---

### AF-M0-T1

**Title:** Preserve FinAI as read-only reference
**Status:** DONE
**Complexity:** Green
**Dependencies:** none

#### JTBD

When rebuilding Agent Flow, I want FinAI untouched, so that extraction cannot regress the production project.

#### Acceptance Criteria

- No tracked FinAI files are changed.
- All implementation commits land in `mxmbt/agent-flow`.
- FinAI is used only for read-only reference and comparison.

#### Verification Focus

- `git status --short` in FinAI shows no tracked extraction changes.

---

### AF-M0-T2

**Title:** Inventory FinAI reference assets
**Status:** DONE
**Complexity:** Yellow
**Dependencies:** AF-M0-T1

#### JTBD

When extracting orchestration assets from FinAI, I want every selected candidate classified, so that project-specific assumptions do not leak into public core.

#### Acceptance Criteria

- Inventory covers FinAI `.claude/**`, `.codex/**`, `AGENTS.md`, `CLAUDE.md`, `scripts/**`, and `docs/templates/**`.
- Each selected FinAI file is classified as `CORE`, `ADAPTER_TARGET`, `PACK`, `PROFILE`, `GENERATED`, `VENDOR`, `OBSOLETE`, or `OUT_OF_SCOPE`.

#### Verification Focus

- Forbidden literal scan runs against all proposed core files.

#### Verification Evidence

- 2026-05-08: `docs/roadmap/document-migration-status.md` contains 537 raw FinAI reference rows covering `.claude/**`, `.codex/**`, root entrypoints, `scripts/**`, and `docs/templates/**`.
- 2026-05-08: 4 representative rows were classified after full-file review: root Codex entrypoint, `feature-developer` agent, `architecture-phase` lifecycle skill, and `agent-report-template`.
- 2026-05-10: Full 537-row FinAI reference register is classified in `docs/roadmap/document-migration-status.md`; no `UNCLASSIFIED` rows remain.

---

### AF-M0-T3

**Title:** Create migration protocol and unified status register
**Status:** DONE
**Complexity:** Yellow
**Dependencies:** AF-M0-T2

#### JTBD

When moving many prompt and orchestration files, I want a file-level migration protocol, so that each AI agent must read and classify the file instead of bulk-copying project-specific assumptions.

#### Acceptance Criteria

- `docs/roadmap/document-migration-protocol.md` defines the migration checklist.
- `docs/roadmap/document-migration-status.md` tracks aggregate progress, coverage, blockers, next actions, and one row per FinAI reference candidate source file.
- The status register supports `UNCLASSIFIED`, `CORE`, `ADAPTER_TARGET`, `PACK`, `PROFILE`, `GENERATED`, `VENDOR`, `OBSOLETE`, and `OUT_OF_SCOPE`.
- Batch size policy is explicit: one file by default, at most three tightly coupled files by exception.
- The protocol includes a checklist for creating universal AI documentation from project-specific source docs.

#### Verification Focus

- Pick three representative files and complete dry-run status-register classifications:
  - one agent
  - one lifecycle skill
  - one script or template
- Confirm none require bulk migration.

#### Verification Evidence

- 2026-05-08: `docs/roadmap/document-migration-protocol.md` defines per-file migration rules, classification vocabulary, batch limits, project-specific scans, extraction rules, and validation checklist.
- 2026-05-08: `docs/roadmap/document-migration-status.md` is the unified status register with dashboard, workstreams, blockers, update protocol, and 537 FinAI reference rows.
- 2026-05-08: dry-run classifications completed for `FINAI-0007`, `FINAI-0039`, and `FINAI-0503`; `FINAI-0501` was also classified to exercise the root entrypoint boundary.
- Dry-run result: none of the reviewed files should be bulk-copied; each requires boundary extraction into core, config, pack, neutralized source-specific wording, or generated target output.

---

### AF-M1-T1

**Title:** Create package scaffold on empty baseline
**Status:** DONE
**Complexity:** Yellow
**Dependencies:** AF-M0-T2

#### JTBD

When users open the public repo, I want it to look like an installable package, not a manual prompt dump.

#### Acceptance Criteria

- Add package metadata and source tree.
- Add a new public README for the installer-based package.
- Do not keep active project-specific docs or assumptions.

#### Verification Focus

- `npm test` or package-equivalent smoke command passes.

#### Verification Evidence

- 2026-05-08: `npm test` passed.
- 2026-05-08: `npm run type-check` passed.

---

### AF-M1-T2

**Title:** Add CLI command skeleton
**Status:** DONE
**Complexity:** Yellow
**Dependencies:** AF-M1-T1

#### JTBD

When users install Agent Flow, I want a real command surface, so that onboarding starts with one command.

#### Acceptance Criteria

- Commands exist: `init`, `update`, `upgrade`, `sync`, `doctor`, `render`, `validate`, `pack`.
- `--help` works.
- Commands share config loading and logging conventions.

#### Verification Focus

- CLI smoke tests for each command's help output.

#### Verification Evidence

- 2026-05-08: `npm test` covered global help and command help for `init`, `update`, `upgrade`, `sync`, `doctor`, `render`, `validate`, and `pack`.

---

### AF-M2-T1

**Title:** Implement project config schema and detection
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M1-T2

#### JTBD

When Agent Flow enters a repo, I want project-specific facts captured in one config, so that generated prompts stay project-agnostic.

#### Acceptance Criteria

- `.agent-flow/config.json` schema exists.
- `.agent-flow/config.yml` may be supported as an alternate input format.
- Config parser validates helpful errors.
- Detector reads common project files and proposes defaults.
- Unknown commands become `needsReview`, not hardcoded guesses.

#### Verification Focus

- Unit tests for valid config, missing config, invalid branches, invalid commands, and detected npm scripts.

#### Verification Evidence

- 2026-05-08: Added `src/config/schema.ts` with structural config validation, issue paths, branch-name checks, command checks, relative path checks, feature/MCP enum checks, and readable validation errors.
- 2026-05-08: `loadProjectConfig` now validates `.agent-flow/config.json` and reports invalid JSON/config through `ConfigValidationError`.
- 2026-05-08: Added `src/config/detect.ts` to detect `package.json`, npm/pnpm/yarn lockfiles, default checks, optional checks, schema checks, dev server command, and unresolved `needsReview` fields.
- 2026-05-08: `npm test` covered missing config defaults, valid config, invalid branch names, invalid commands, and detected npm scripts.

---

### AF-M2-T2

**Title:** Implement template renderer and managed-file policy
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M2-T1

#### JTBD

When rendering into an existing repo, I want safe file writes, so that Agent Flow never silently destroys project instructions.

#### Acceptance Criteria

- Renderer supports canonical partials and target-specific templates.
- Files include managed metadata.
- Dry-run shows planned changes.
- Conflicts require backup, managed block update, or explicit force.

#### Verification Focus

- Snapshot tests for rendered core files.
- Conflict tests for existing unmanaged `AGENTS.md` and `CLAUDE.md`.

#### Verification Evidence

- 2026-05-08: Added `src/renderer/render-template.ts` with dotted placeholder resolution, canonical partial expansion, array rendering, and explicit missing-value errors.
- 2026-05-08: Added `src/renderer/managed-blocks.ts` with parseable Agent Flow managed metadata headers.
- 2026-05-08: Added `src/renderer/conflict-policy.ts` with dry-run planning for create/update/noop/conflict and write behavior requiring `force` or `backup` for unmanaged overwrites.
- 2026-05-08: `npm test` covered rendered output, missing placeholders, metadata parsing, create/noop/update/conflict planning, and backup-before-overwrite behavior.
- Note: concrete Claude/Codex lifecycle templates are intentionally deferred to AF-M3-T1 and AF-M3-T2.

---

### AF-M2-T3

**Title:** Define pack model and pack composition rules
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M2-T1

#### JTBD

When a project needs reusable domain or runtime behavior, I want it added through packs, so that core stays clean while common stacks still work out of the box.

#### Acceptance Criteria

- Pack manifest schema exists.
- Packs can contribute agents, skill fragments, validators, MCP recommendations, checks, and deployment-impact surfaces.
- Pack composition order is deterministic.
- Pack conflicts are detected and reported.
- Core can run with zero packs.
- FinAI-like behavior is expressible as config plus packs, not a fork.

#### Verification Focus

- Unit test for an empty core install.
- Unit test composing `finance + cloudflare-worker + telegram`.
- Conflict test where two packs define the same domain expert or validation hook.

#### Verification Evidence

- 2026-05-08: Added `src/packs/manifest.ts` with pack manifests, deterministic selected-pack composition, merged agents/skills/skill fragments/checks/MCP/deployment surfaces/invariants, and composition errors.
- 2026-05-08: Added `src/packs/builtin.ts` with initial `finance`, `cloudflare-worker`, `telegram`, `webapp`, `code-review-toolkit`, `code-review-graph`, and `design` pack manifests.
- 2026-05-08: `npm test` covered empty core composition, `finance + cloudflare-worker + telegram`, unknown/duplicate pack names, duplicate validation hooks, and competing domain experts.

---

### AF-M3-T1

**Title:** Build canonical lifecycle templates
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M2-T2

#### JTBD

When rendering Claude and Codex files, I want one canonical lifecycle source, so that both tools stay semantically identical.

#### Acceptance Criteria

- Canonical partials define lifecycle, phase contracts, artifact paths, quality gates, QA, delivery, and state/report fields.
- Target templates consume canonical partials.
- No lifecycle text is duplicated independently between Claude and Codex targets.

#### Verification Focus

- Mirror parity validator confirms canonical sections render equivalently.

#### Verification Evidence

- 2026-05-08: Added canonical templates under `templates/canonical/` for lifecycle, artifact contracts, quality gates, QA/delivery, state/report contracts, and the canonical contract index.
- 2026-05-08: Added `src/renderer/canonical-context.ts` to render canonical templates from project config plus composed pack contributions.
- 2026-05-08: `npm test` rendered the canonical contract with `finance + cloudflare-worker + telegram`, verified lifecycle/phase/artifact/quality/QA/delivery/state sections, and checked the rendered contract for blocked project-specific literals.
- 2026-05-08: `npm test` also verified the canonical quality gate renders correctly with zero packs.
- Note: target-specific Claude/Codex templates and parity validation remain in AF-M3-T2 and AF-M4-T1.

---

### AF-M3-T2

**Title:** Build Claude and Codex target renderers
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M3-T1

#### JTBD

When installing into a repo, I want Claude Code and Codex to receive their native files with identical semantics, so that users can switch tools without changing process.

#### Acceptance Criteria

- Renders root `CLAUDE.md`.
- Renders root `AGENTS.md`.
- Renders `.claude/**`.
- Renders `.codex/**` when enabled.
- Allowed target-specific differences are explicit and testable.

#### Verification Focus

- Test proves root `AGENTS.md` and root/Claude lifecycle docs share the same canonical sections.

#### Verification Evidence

- 2026-05-08: Added Claude target templates for root `CLAUDE.md` and `.claude/CLAUDE.md`.
- 2026-05-08: Added Codex target templates for root `AGENTS.md`, `.codex/orchestration-policy.md`, and `.codex/claude-interop.md`.
- 2026-05-08: Added `src/renderer/target-renderer.ts` to render enabled Claude/Codex native target files from the same canonical partials with managed metadata.
- 2026-05-08: `npm test` proved root `CLAUDE.md` and `AGENTS.md` contain identical canonical lifecycle sections while preserving target-specific headers, and verified feature flags can disable Claude or Codex output.
- Note: agent, skill, guide, and artifact-template target content remains in AF-M3-T3.

---

### AF-M3-T3

**Title:** Port agents, skills, guides, and artifact templates
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M3-T2

#### JTBD

When users install Agent Flow, I want the strong FinAI-aligned process without FinAI specifics, so that the package is useful across projects.

#### Acceptance Criteria

- Lifecycle phase skills are de-projectized.
- Agents use configured checks and invariants.
- Optional domain expert is rendered only when configured directly or contributed by a pack.
- Pack-contributed rules are visibly marked in rendered output.
- Artifact templates use project config placeholders.

#### Verification Focus

- Agnostic scan blocks `FinAI`, `FINAI`, `ZNAI`, `cf &&`, `wrangler`, `Telegram`, `D1`, `docs/sprints`, `Prisma`, `tRPC`, `organizationId`, and hardcoded branches in core.

#### Verification Evidence

- 2026-05-08: AF-MIG-0001 migrated `FINAI-0007` feature-developer agent into `templates/canonical/agents/feature-developer.md.hbs` with Claude/Codex target wrappers under `templates/targets/*/agents/`.
- 2026-05-08: AF-MIG-0002 migrated `FINAI-0006` delivery-agent and `FINAI-0019` qa-expert into canonical agent templates with Claude/Codex target wrappers.
- 2026-05-09: AF-MIG-0003 migrated `FINAI-0002` analyst and `FINAI-0003` architect into canonical agent templates with Claude/Codex target wrappers.
- 2026-05-09: AF-MIG-0004 migrated `FINAI-0004` code-simplifier and `FINAI-0005` deep-reviewer into canonical agent templates with Claude/Codex target wrappers.
- 2026-05-09: AF-MIG-0005 migrated `FINAI-0008` findings-arbiter as core and `FINAI-0009` math-genius as a finance pack agent.
- 2026-05-09: AF-MIG-0006 migrated `FINAI-0010` paranoid-architect and `FINAI-0011` performance-expert into canonical agent templates with runtime-specific review surfaces routed through config and packs.
- 2026-05-09: AF-MIG-0007 migrated `FINAI-0012` product-manager into a canonical agent template with product/status/roadmap/architecture/backlog paths routed through artifact config.
- 2026-05-09: AF-MIG-0008 migrated `FINAI-0013` prt-code-reviewer and `FINAI-0014` prt-code-simplifier as `code-review-toolkit` pack agents with tool-specific root instruction filenames and stack-specific style examples neutralized in canonical bodies.
- 2026-05-09: AF-MIG-0009 migrated `FINAI-0015` prt-comment-analyzer and `FINAI-0016` prt-pr-test-analyzer as `code-review-toolkit` pack agents with source-specific examples, PR-only wording, and tool-specific root instruction filenames neutralized in canonical bodies.
- 2026-05-09: AF-MIG-0010 migrated `FINAI-0017` prt-silent-failure-hunter and `FINAI-0018` prt-type-design-analyzer as `code-review-toolkit` pack agents with PR-only wording, concrete logging/Sentry examples, production-code phrasing, and narrow type-design terminology generalized in canonical bodies.
- 2026-05-09: AF-MIG-0011 migrated `FINAI-0020` ux-expert into a canonical agent template with UX/design reference paths routed through artifact config and starter/reuse behavior added to init.
- 2026-05-09: AF-MIG-0012 migrated `FINAI-0021` code-review-graph-usage as a `code-review-graph` pack guide and `FINAI-0022` gan-protocol as a core guide.
- 2026-05-09: AF-MIG-0013 migrated `FINAI-0023` systematic-debugging and `FINAI-0024` test-driven-development as core guides, with focused single-test commands routed through `checks.focusedTestCommand`.
- 2026-05-09: AF-MIG-0014 classified `FINAI-0025` ui-ux-pro-max-reference as vendor/design-pack content and migrated `FINAI-0026` verification-before-completion plus `FINAI-0027` worktree-workflow as core guides, with checks and Git/worktree delivery commands routed through config/rendered placeholders.
- 2026-05-09: AF-MIG-0015 migrated `FINAI-0025` ui-ux-pro-max-reference plus `ui-ux-pro-max`, `ui-styling-uupm`, and `design-system-uupm` static skill bundles as the optional `design` pack.
- 2026-05-09: AF-MIG-0016 migrated core-linked design skills `frontend-design`, `design-audit`, and `accessibility-audit` as core static skills, and migrated `design-uupm`, `brand-uupm`, and `banner-design-uupm` as optional `design` pack static skills.
- 2026-05-09: AF-MIG-0017 migrated core-linked auxiliary skills `architecture-designer`, `architecture-patterns`, `commit`, `e2e-testing`, `e2e-testing-patterns`, `improve-codebase-architecture`, `rag-implementation`, `release-sync`, `shadcn-ui`, `simplify`, and `webapp-testing` as core static skills.
- 2026-05-09: AF-MIG-0018 migrated core phase/planning skills `architecture-phase`, `bugfix-flow`, `phase-check`, `planning-lifecycle`, `simplify-phase`, `testing-phase`, and `work-planning` as core static skills with artifact paths, task prefixes, validation commands, lifecycle labels, QA docs, and live URLs rendered from config.
- 2026-05-09: AF-MIG-0019 migrated lifecycle phase skills `delivery-phase`, `fix-phase`, `implementation-phase`, `plan-phase`, `quality-gate-phase`, `review-phase`, and `writing-plans` as core static skills with Git flow, artifact template paths, validation commands, runtime surfaces, domain invariants, experts, and target invocation wording rendered from config, packs, or target adapters.
- 2026-05-09: `src/renderer/target-renderer.ts` now renders `.claude/agents/{feature-developer,analyst,architect,code-simplifier,deep-reviewer,findings-arbiter,paranoid-architect,performance-expert,product-manager,ux-expert,delivery-agent,qa-expert}.md` and `.codex/agents/{feature-developer,analyst,architect,code-simplifier,deep-reviewer,findings-arbiter,paranoid-architect,performance-expert,product-manager,ux-expert,delivery-agent,qa-expert}.md` from canonical bodies with target-specific guide and skill roots. Pack-contributed agents such as `math-genius` and the `prt-*` code-review-toolkit agents render only when the selected packs contribute them. Core guides such as `{gan-protocol,systematic-debugging,test-driven-development,verification-before-completion,worktree-workflow}` render in zero-pack installs; pack guides such as `{code-review-graph-usage,ui-ux-pro-max-reference}` render only when the owning pack contributes them. Core and pack static skill assets render into target-specific `.claude/skills/**` and `.codex/skills/**` trees.
- 2026-05-09: `npm test` passed with 61 tests, including rendered agent/guide metadata, target-specific paths, pack-contributed invariants, configured checks, config explanation, sync diff preview, starter artifact reuse, template comment handling, file-type-compatible managed headers, 340 rendered skill-asset outputs with the design pack enabled, dangling-reference checks, similarity logic, universality scanner logic, and rendered universalized migrated agents/guides.
- 2026-05-08: Added `npm run check:migration-similarity` with a 99% baseline target. `FINAI-0006`, `FINAI-0007`, and `FINAI-0019` pass after accepted universalization substitutions; `FINAI-0007` is 99.00% line / 99.85% token similarity and the other two are 100.00% line / 100.00% token similarity.
- 2026-05-08: Added `npm run check:universality` as an advisory scanner for project/runtime/stack/domain/command assumptions. Internal Agent Flow skill/guide links are accepted package links by MRD-0001, and planning/design artifacts are core by MRD-0006. The three migrated agent templates now pass the universality scan after applying accepted config/pack/source-wording decisions.
- 2026-05-09: Added `agent-flow config explain <key>` as an onboarding/transparency command for rendered placeholders. It shows the current value, source config/pack inputs, and templates that use the value.
- 2026-05-09: Implemented `agent-flow sync --diff` to preview generated target-file create/update/conflict plans and compact diffs without writing files.
- 2026-05-09: Added `discovery.codeGraphProvider` onboarding. `init` enables the `code-review-graph` pack by default for detected coding projects without existing Agent Flow config, while `doctor` and `config explain` surface missing or custom planning discovery providers. Core agents now reference the configured discovery provider instead of hardcoded CRG guide links; the CRG guide and MCP recommendation remain pack-owned.
- 2026-05-09: Detected coding projects also enable the `code-review-toolkit` pack as recommended manual review tooling, without making those agents mandatory in zero-pack installs.
- 2026-05-09: QA runtime URL and shared test-account docs now render from config via `dev.start.url` and `artifacts.qaSharedAccountFile`; `init` creates a starter QA shared-account doc for bare projects and reuses common existing QA docs.
- 2026-05-09: AF-MIG-0030 migrated core artifact templates for agent reports, design documents, QA reports, state files, and walkthroughs as shared rendered docs with project/check/branch/domain/runtime values routed through config and packs.
- 2026-05-10: AF-MIG-0031 migrated the first core validation scripts as shared installed scripts: `agent-flow-phase-check.mjs`, `agent-flow-review-gate.mjs`, and `agent-flow-validate-phase.mjs`. Phase roots render from `artifacts.phaseRoot`; review fields use neutral `primaryReview*` names instead of Codex-specific state fields.
- 2026-05-10: AF-MIG-0032 migrated the first core delivery helper scripts as shared installed scripts: `park-worktrees.sh` and `report-delivery-state.sh`. Remote, integration branch, and release branch policy render from git config; release branch reporting is optional for projects without one.
- 2026-05-10: `npm test` passed with 63 tests, `npm run check:universality` passed for 113 files, and `npm run check:migration-similarity -- --source-root /Users/mburtikov/conductor/workspaces/ai_finance_manager/richmond-v1 --max-diff-lines 12` passed for the migrated validation and delivery helper scripts. Validation scripts stayed above the 99% target at 99.48%, 99.71%, and 99.54%; delivery helpers passed their documented 90% minimum at 98.08% and 92.83% because hardcoded branch/release policy was intentionally made config-driven.
- 2026-05-10: AF-MIG-0033 classified the remaining reviewed script batch. CRG operational scripts are pack-owned, legacy Claude-to-Codex sync scripts are obsolete, Supabase database scripts are out of scope, and delivery/skill-reference tests need renderer-aware redesign before migration.
- 2026-05-10: AF-MIG-0034 added a generated `.codex/README.md` target and classified the first settings/MCP batch. Source settings and `mcp.codex.json` are not portable enough to copy as core because they contain CRG hooks, source-specific permissions, old hook scripts, and machine-local absolute paths; future settings/MCP output must be rendered from config and packs.
- 2026-05-10: AF-MIG-0035 classified `.codex/agents/**` and `.codex/guides/**` mirror rows as generated targets. All files in the batch have `@generated from claude:*` provenance, so Agent Flow replaces them with renderer output from canonical agent/guide templates instead of treating source-specific Codex mirrors as independent semantic sources.
- 2026-05-10: AF-MIG-0036 classified `.codex/skills/**` mirror rows. 209 rows map directly to already migrated `templates/static/skills/**` assets and are generated target output; the remaining manual/stale Codex skill files are either superseded by generated QA/review contracts, future optional tool-pack material, obsolete sync infrastructure, or non-runtime authoring artifacts.
- 2026-05-10: AF-MIG-0037 classified the final raw inventory rows. Root Claude files are generated adapter targets, hidden template aliases are covered by shared `docs/templates/**`, and the legacy `.codex/sync-manifest.json` is obsolete because Agent Flow renders targets directly. The 537-row FinAI reference register is now fully classified.
- 2026-05-10: AF-M3-T3 is complete for the FinAI extraction scope: migrated core/pack agents, guides, static skills, shared artifact templates, validation scripts, delivery helper scripts, and generated Claude/Codex target wrappers pass the current renderer, universality, and test checks. Deferred settings/MCP rendering, CRG pack scripts, renderer-aware validators, and pack-management commands continue under AF-M4+ / AF-M5+ / AF-M6+ tasks.

---

### AF-M4-T1

**Title:** Add full mirror parity validation
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M3-T3

#### JTBD

When Agent Flow renders both tool stacks, I want drift detection, so that Claude and Codex cannot quietly diverge.

#### Acceptance Criteria

- Validator checks generated `.codex` files against canonical/Claude source.
- Validator checks root `AGENTS.md` and `CLAUDE.md` parity.
- Validator allows target-specific command blocks only through explicit markers.

#### Verification Focus

- Deliberately edit generated Codex lifecycle text and confirm validation fails.
- Deliberately edit allowed target command block and confirm validation passes.

#### Verification Evidence

- 2026-05-10: Added `src/validation/mirror-parity.ts` and wired `agent-flow validate --strict` to fail on missing, stale, or semantically drifted managed files.
- 2026-05-10: `tests/mirror-parity.test.ts` checks 200+ rendered Claude/Codex mirror pairs across roots, agents, guides, and skills, ignoring only explicit target-adapter differences.
- 2026-05-10: Drift test edits installed `AGENTS.md`; validation reports both stale installed output and `CLAUDE.md`/`AGENTS.md` content drift with non-zero strict exit.

---

### AF-M4-T2

**Title:** Generalize git and delivery utilities
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M4-T1

#### JTBD

When a project uses Agent Flow delivery, I want git helpers to follow that project's branch policy, so that `develop/master` is not assumed.

#### Acceptance Criteria

- Integration branch and release branch come from config.
- Single-branch projects are supported.
- Worktree parking is optional.
- GitHub branch deletion uses `gh` metadata, not hardcoded owner/repo.
- Roadmap/status consistency scripts are optional pack contributions, not core assumptions.

#### Verification Focus

- Fixture repo with `main` only.
- Fixture repo with `develop` and `master`.

#### Verification Evidence

- 2026-05-10: Delivery rendering now derives protected-branch wording, release close-out wording, release-sync availability, and worktree parking mode from git config.
- 2026-05-10: Remote branch deletion renders through GitHub CLI repository metadata: `gh api "repos/{owner}/{repo}/git/refs/heads/<branch>" -X DELETE`.
- 2026-05-10: Shared delivery helpers support single-branch projects: `report-delivery-state.sh` reports `Release (none configured): not configured`, and worktree hygiene is `skipped` when `git.worktreeParking` is false.
- 2026-05-10: Added fixture coverage in `tests/delivery-utilities.test.ts` for a `main`-only repo with worktree parking disabled.

---

### AF-M5-T1

**Title:** Add MCP configuration rendering and health checks
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M2-T1

#### JTBD

When users install Agent Flow, I want required/recommended MCP setup included, so that they get the full package without hunting for tool setup.

#### Acceptance Criteria

- Config supports MCP servers with `enabled` and `required`.
- Installer renders Claude and Codex MCP config where supported.
- Doctor checks missing binaries, missing env vars, unreachable servers, and optional fallbacks.
- Doctor rejects unsafe machine-local absolute paths in generated MCP config.
- Docs explain any manual credential steps.

#### Verification Focus

- Test required missing MCP fails doctor.
- Test optional missing MCP warns but passes.

#### Verification Evidence

- 2026-05-10: Added portable MCP catalog/rendering in `src/mcp/catalog.ts`; enabled known servers render into `.mcp.json`, `.claude/settings.json`, and `.codex/mcp.codex.json` from config plus pack recommendations.
- 2026-05-10: `doctor` now reports MCP mode, missing rendered MCP config, missing commands, required env vars, and unsafe machine-local absolute paths; `doctor --strict` exits non-zero for required/strict issues.
- 2026-05-10: Added `docs/MCP.md` with generated file list, sync/doctor workflow, strict behavior, and unsafe path rule.
- 2026-05-10: Added tests for rendered MCP files without `/Users`/`/home` paths, optional MCP warnings, and required missing MCP command failure.

---

### AF-M5-T2

**Title:** Add project command detection and setup prompts
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M2-T1

#### JTBD

When a user installs Agent Flow, I want as much setup as possible inferred automatically, so that remaining manual work is small and explicit.

#### Acceptance Criteria

- Detects package manager and common scripts.
- Suggests default checks.
- Detects likely dev server command and local URL when possible.
- Writes unresolved items as `needsReview`.
- Doctor summarizes exactly what the user still needs to configure.

#### Verification Focus

- Fixtures: npm app, pnpm app, Python app, unknown repo.

#### Verification Evidence

- 2026-05-10: `.agent-flow/config.json` now stores `needsReview`, and `doctor` summarizes unresolved setup fields.
- 2026-05-10: Detection covers npm, pnpm, yarn, Python project files, and unknown repos; JS projects infer default checks, focused test commands, optional lint/build, schema checks, dev command, and likely dev URL.
- 2026-05-10: Added fixture coverage for npm, pnpm, Python, and unknown projects in `tests/config.test.ts`.

---

### AF-M6-T1

**Title:** Implement init/update/upgrade/sync/doctor/render/validate
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M2-T2, AF-M4-T1, AF-M5-T1

#### JTBD

When Agent Flow is public, I want installation and maintenance commands, so that users can adopt and upgrade safely.

#### Acceptance Criteria

- `init` renders a new install.
- `update` updates managed files.
- `upgrade` upgrades Agent Flow managed files across package versions.
- `sync` regenerates target mirrors and replaces stale generated-notice commands such as `npm run agents:sync`.
- `doctor` validates install health.
- `render` outputs generated files without writing.
- `validate` runs core and mirror checks.

#### Evidence

- 2026-05-09: `init` creates `.agent-flow/config.json`, generated Claude/Codex target files, and starter docs for configured artifact paths, including architecture, user-isolation architecture, and scheduling architecture references. It supports `--dry-run` and reports unmanaged-file conflicts without overwriting user files.
- 2026-05-09: `init` reuses common existing project documents for status, roadmap, product, architecture, security/user-isolation, and scheduling/job docs, writing the detected paths into `.agent-flow/config.json` instead of creating duplicate starter docs.
- 2026-05-09: `npm test` covers bare-project init, existing-document reuse, dry-run behavior, and conflict protection.
- 2026-05-10: `validate` runs installed-file and mirror parity checks, with `--strict` returning non-zero on stale/missing/drifted managed files.
- 2026-05-10: `doctor` reports planning discovery, unresolved `needsReview` config fields, MCP health, optional warnings, and strict failures.
- 2026-05-10: `render --json` emits generated files without writing; `update` refreshes managed files; `upgrade --dry-run --from <version>` previews the managed-file upgrade plan.
- 2026-05-10: `tests/render-update-upgrade-command.test.ts` covers render/update/upgrade behavior; `pack` remains scoped to AF-M6-T2.

#### Verification Focus

- End-to-end temp repo install, update, and doctor tests.

---

### AF-M6-T2

**Title:** Implement pack add/remove/list commands
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M2-T3, AF-M6-T1

#### JTBD

When a project evolves, I want to add or remove Agent Flow packs safely, so that domain/runtime behavior can change without forking core.

#### Acceptance Criteria

- `agent-flow pack list` shows available and installed packs.
- `agent-flow pack add <pack>` updates config and rerenders managed files.
- `agent-flow pack remove <pack>` removes pack contributions and warns about generated diffs.
- Pack changes use dry-run and backup behavior.
- Doctor reports pack health.

#### Verification Focus

- Add/remove pack e2e test in a temp repo.
- Snapshot test for rendered output before and after `finance` pack.

#### Verification Evidence

- 2026-05-10: `agent-flow pack list` shows available and installed packs.
- 2026-05-10: `agent-flow pack add <pack>` updates `.agent-flow/config.json` and renders pack-contributed agents, guides, skills, MCP config, and validators through the normal managed-file policy.
- 2026-05-10: `agent-flow pack remove <pack>` updates config and deletes obsolete managed files that are no longer contributed by the selected pack set.
- 2026-05-10: `doctor` reports pack composition errors such as unknown packs; `tests/pack-command.test.ts` covers list/add/remove for the `finance` pack.

---

### AF-M7-T1

**Title:** Add generic, webapp, and finai-example profiles
**Status:** DONE
**Complexity:** Yellow
**Dependencies:** AF-M6-T1

#### JTBD

When users start with common project types, I want useful profiles, so that one-click install is practical.

#### Acceptance Criteria

- `generic` is stack-neutral.
- `webapp` includes common frontend/testing hints without assuming a framework.
- `finai.example` proves FinAI assumptions can live in adapter config, not core.

#### Verification Focus

- Render snapshots for each profile.

#### Verification Evidence

- 2026-05-10: Added typed profile overlays in `src/config/profiles.ts` for `generic`, `webapp`, and `finai.example`.
- 2026-05-10: `init --profile <name>` and `render --profile <name>` use the same profile application path.
- 2026-05-10: `webapp` enables the `webapp` pack and frontend/browser review hints without selecting a framework; `finai.example` composes FinAI-like assumptions through adapter config and packs.
- 2026-05-10: `tests/profiles.test.ts` covers profile config snapshots and rendered profile output without writing files.

---

### AF-M7-T2

**Title:** Add finance, cloudflare-worker, telegram, webapp, and toolkit packs
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M6-T2

#### JTBD

When users adopt Agent Flow for common domains or runtimes, I want battle-tested optional packs, so that core stays generic without leaving users to recreate common rules.

#### Acceptance Criteria

- `finance` pack contributes financial correctness rules and optional domain reviewer.
- `cloudflare-worker` pack contributes Worker runtime, Wrangler, D1/R2/KV, and deployment-impact surfaces.
- `telegram` pack contributes Telegram QA and UX/copy constraints.
- `webapp` pack contributes browser QA, accessibility, and common frontend workflow hints.
- `code-review-toolkit` pack contributes auxiliary PR/code review agents without making them mandatory in a zero-pack install.
- `finai.example` profile composes `finance + cloudflare-worker + telegram` through config.
- None of these pack terms appear in core scans.

#### Verification Focus

- Pack render snapshots.
- FinAI-example fixture proves current FinAI contract is reproducible through profile + packs.

#### Verification Evidence

- 2026-05-10: Built-in packs cover `finance`, `cloudflare-worker`, `telegram`, `webapp`, `code-review-toolkit`, `code-review-graph`, `nextjs`, and `design`.
- 2026-05-10: `finai.example` profile composes `finance + cloudflare-worker + telegram + webapp + code-review-toolkit + code-review-graph` through config.
- 2026-05-10: Pack composition tests cover finance, Cloudflare Worker, Telegram, webapp/browser QA, code-review-toolkit, code-review-graph, design, and Next.js contributions.
- 2026-05-10: Universality scan passes for core files, keeping pack/domain/runtime terms out of core scan targets.

---

### AF-M8-T1

**Title:** Add temp-repo install tests and agnostic scans
**Status:** DONE
**Complexity:** Red
**Dependencies:** AF-M7-T2

#### JTBD

When publishing Agent Flow, I want proof from clean repos, so that one-click install is real.

#### Acceptance Criteria

- Empty repo install passes.
- Non-empty repo conflict handling passes.
- Codex-enabled install passes.
- MCP optional/required scenarios pass.
- FinAI-example profile install passes without core contamination.
- Agnostic scan runs in CI.

#### Verification Focus

- CI executes all fixtures.
- Fixtures include empty repo, JS app, and FinAI profile.

#### Verification Evidence

- 2026-05-10: Added `tests/e2e-install.test.ts` with temp-repo install coverage for empty repo, JS app, unmanaged conflict handling, and `finai.example` profile.
- 2026-05-10: E2E fixtures run `init`, `validate --strict`, and representative `doctor` checks against generated installs.
- 2026-05-10: `npm test` now runs the full Node test suite and `scripts/check-universality.mjs --fail-on-errors`, so the agnostic scan is part of the standard CI command.

---

### AF-M9-T1

**Title:** Write public docs and migration guide
**Status:** DONE
**Complexity:** Yellow
**Dependencies:** AF-M8-T1

#### JTBD

When people open the GitHub repo, I want them to understand the package quickly, so that adoption does not require reading source.

#### Acceptance Criteria

- README leads with install.
- `docs/CONFIG.md` documents config.
- `docs/MCP.md` documents MCP setup and doctor behavior.
- `docs/ARCHITECTURE.md` explains canonical/target/profile architecture.
- `docs/PACKS.md` explains pack manifests, pack composition, and `pack add`.
- `docs/MIGRATION.md` explains replacing old manual `.claude` flows.

#### Verification Focus

- README commands are tested or marked as release-smoke commands.

#### Verification Evidence

- 2026-05-10: Rewrote `README.md` as a public quickstart with install, init, validate, doctor, packs, profiles, inspection, and release-smoke command paths.
- 2026-05-10: Added public docs for configuration, MCP generation, canonical/target architecture, pack composition, and migration from manual `.claude`/`.codex` copy flows.
- 2026-05-10: `npm test` passes with the public docs in place and continues to run build, the Node test suite, and strict universality scan.

---

### AF-M10-T1

**Title:** Publish first release
**Status:** TODO
**Complexity:** Yellow
**Dependencies:** AF-M9-T1

#### JTBD

When the package is ready, I want a versioned public release, so that users can install and update Agent Flow safely.

#### Acceptance Criteria

- Published npm package or GitHub release exists.
- Release notes explain this replaces the stale manual-copy flow.
- Published artifact passes clean-repo install smoke test.

#### Verification Focus

- Run install from the published artifact, then run `agent-flow doctor`.

#### Release Prep Evidence

- 2026-05-10: Added `npm run smoke:package`, which builds, packs a local tarball, installs it into a clean temp project, then runs `agent-flow init`, `agent-flow validate --strict`, and `agent-flow doctor` through the packaged bin.
- 2026-05-10: Prepared `0.1.0` package metadata, `CHANGELOG.md` release notes, and `docs/RELEASE.md` publish checklist.
- 2026-05-10: `npm pack --dry-run --json` confirms the package includes release notes, public docs, runtime `dist/src`, and templates without compiled test files.
- 2026-05-10: Added GitHub Actions CI and manual publish workflows. CI runs tests, package smoke, and package-content dry run; publish requires an `NPM_TOKEN`, verifies the requested version, reruns the same checks, then runs npm publish with provenance.
- 2026-05-10: Documented the GitHub default-branch requirement for manual `workflow_dispatch` release runs; integration-branch releases must be promoted to the default branch before the publish workflow appears in Actions.
- Publication remains open until an npm package or GitHub release exists and that published artifact passes the same clean-repo smoke path.

---

## What Users Still Need To Do After Install

The goal is to keep this list short.

Required:

1. Confirm project name and task prefix.
2. Confirm default verification commands.
3. Confirm integration branch and optional release branch.
4. Choose suggested packs or accept the default profile.
5. Add credentials for MCP servers that require secrets.

Usually optional:

1. Add domain-specific invariants.
2. Add deployment-impact surfaces.
3. Add custom QA runtime URL.
4. Add custom expert profile.
5. Resolve any commands marked `needsReview`.

Everything else should be installed, rendered, or detected by Agent Flow.

---

## Definition Of Done

Agent Flow is ready when:

- `npx @mxmbt/agent-flow init` installs a complete working flow in a clean repo.
- `agent-flow doctor` gives actionable health output.
- Claude and Codex root entrypoints are rendered from canonical shared content.
- `.claude/**` and `.codex/**` lifecycle semantics cannot drift silently.
- MCP config is installed and validated.
- Optional packs can be added, removed, validated, and rendered.
- Project commands are detected or marked as explicit review items.
- Core contains no FinAI/ZNAI/project-specific literals or machine-local absolute paths.
- FinAI-like behavior is reproduced through `finai.example` profile plus packs.
- FinAI remains unchanged.
