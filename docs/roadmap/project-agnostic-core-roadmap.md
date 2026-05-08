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
  optional domain/runtime modules such as finance, cloudflare-worker, telegram, webapp

project adapter
  project name, docs, checks, git branches, runtime surfaces, MCP choices, domain risks

installer
  init, update, upgrade, sync, doctor, render, validate, pack add
```

Core must not mention a concrete product or stack. Project-specific behavior is supplied by `.agent-flow/config.json` or an equivalent config file loaded by the CLI.

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
| Pack | A reusable capability module | `finance`, `cloudflare-worker`, `telegram`, `playwright-qa` |

Initial pack candidates:

- `finance`: financial correctness, fixed-point money, no look-ahead, optional `math-genius`
- `cloudflare-worker`: Wrangler, Worker runtime limits, D1/R2/KV deployment surfaces
- `telegram`: Telegram QA and user-facing copy constraints
- `webapp`: browser QA, accessibility, common frontend checks
- `github-delivery`: PR, branch cleanup, delivery-state helpers
- `code-review-graph`: graph-first discovery MCP and hooks
- `planning-docs`: optional status/roadmap/tasks consistency checks for projects that use that planning model

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
      planning-docs/
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
| [AF-M0-T1](#af-m0-t1) | Preserve FinAI as read-only reference | Green | none | TODO |
| [AF-M0-T2](#af-m0-t2) | Inventory FinAI reference assets | Yellow | AF-M0-T1 | TODO |
| [AF-M0-T3](#af-m0-t3) | Create migration protocol and unified status register | Yellow | AF-M0-T2 | TODO |
| [AF-M1-T1](#af-m1-t1) | Create package scaffold on empty baseline | Yellow | AF-M0-T3 | TODO |
| [AF-M1-T2](#af-m1-t2) | Add CLI command skeleton | Yellow | AF-M1-T1 | TODO |
| [AF-M2-T1](#af-m2-t1) | Implement project config schema and detection | Red | AF-M1-T2 | TODO |
| [AF-M2-T2](#af-m2-t2) | Implement template renderer and managed-file policy | Red | AF-M2-T1 | TODO |
| [AF-M2-T3](#af-m2-t3) | Define pack model and pack composition rules | Red | AF-M2-T1 | TODO |
| [AF-M3-T1](#af-m3-t1) | Build canonical lifecycle templates | Red | AF-M2-T2, AF-M2-T3 | TODO |
| [AF-M3-T2](#af-m3-t2) | Build Claude and Codex target renderers | Red | AF-M3-T1 | TODO |
| [AF-M3-T3](#af-m3-t3) | Port agents, skills, guides, and artifact templates | Red | AF-M3-T2 | TODO |
| [AF-M4-T1](#af-m4-t1) | Add full mirror parity validation | Red | AF-M3-T3 | TODO |
| [AF-M4-T2](#af-m4-t2) | Generalize git and delivery utilities | Red | AF-M4-T1 | TODO |
| [AF-M5-T1](#af-m5-t1) | Add MCP configuration rendering and health checks | Red | AF-M2-T1 | TODO |
| [AF-M5-T2](#af-m5-t2) | Add project command detection and setup prompts | Red | AF-M2-T1 | TODO |
| [AF-M6-T1](#af-m6-t1) | Implement init/update/upgrade/sync/doctor/render/validate | Red | AF-M2-T2, AF-M4-T1, AF-M5-T1 | TODO |
| [AF-M6-T2](#af-m6-t2) | Implement pack add/remove/list commands | Red | AF-M2-T3, AF-M6-T1 | TODO |
| [AF-M7-T1](#af-m7-t1) | Add generic, webapp, and finai-example profiles | Yellow | AF-M6-T1 | TODO |
| [AF-M7-T2](#af-m7-t2) | Add finance, cloudflare-worker, telegram, and webapp packs | Red | AF-M6-T2 | TODO |
| [AF-M8-T1](#af-m8-t1) | Add temp-repo install tests and agnostic scans | Red | AF-M7-T2 | TODO |
| [AF-M9-T1](#af-m9-t1) | Write public docs and migration guide | Yellow | AF-M8-T1 | TODO |
| [AF-M10-T1](#af-m10-t1) | Publish first release | Yellow | AF-M9-T1 | TODO |

---

### AF-M0-T1

**Title:** Preserve FinAI as read-only reference
**Status:** TODO
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
**Status:** TODO
**Complexity:** Yellow
**Dependencies:** AF-M0-T1

#### JTBD

When extracting orchestration assets from FinAI, I want every selected candidate classified, so that project-specific assumptions do not leak into public core.

#### Acceptance Criteria

- Inventory covers FinAI `.claude/**`, `.codex/**`, `AGENTS.md`, `CLAUDE.md`, `scripts/**`, and `docs/templates/**`.
- Each selected FinAI file is classified as `CORE`, `ADAPTER_TARGET`, `PACK`, `PROFILE`, `GENERATED`, `VENDOR`, `OBSOLETE`, or `OUT_OF_SCOPE`.

#### Verification Focus

- Forbidden literal scan runs against all proposed core files.

---

### AF-M0-T3

**Title:** Create migration protocol and unified status register
**Status:** TODO
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

---

### AF-M1-T1

**Title:** Create package scaffold on empty baseline
**Status:** TODO
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

---

### AF-M1-T2

**Title:** Add CLI command skeleton
**Status:** TODO
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

---

### AF-M2-T1

**Title:** Implement project config schema and detection
**Status:** TODO
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

---

### AF-M2-T2

**Title:** Implement template renderer and managed-file policy
**Status:** TODO
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

---

### AF-M2-T3

**Title:** Define pack model and pack composition rules
**Status:** TODO
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

---

### AF-M3-T1

**Title:** Build canonical lifecycle templates
**Status:** TODO
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

---

### AF-M3-T2

**Title:** Build Claude and Codex target renderers
**Status:** TODO
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

---

### AF-M3-T3

**Title:** Port agents, skills, guides, and artifact templates
**Status:** TODO
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

---

### AF-M4-T1

**Title:** Add full mirror parity validation
**Status:** TODO
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

---

### AF-M4-T2

**Title:** Generalize git and delivery utilities
**Status:** TODO
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

---

### AF-M5-T1

**Title:** Add MCP configuration rendering and health checks
**Status:** TODO
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

---

### AF-M5-T2

**Title:** Add project command detection and setup prompts
**Status:** TODO
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

---

### AF-M6-T1

**Title:** Implement init/update/upgrade/sync/doctor/render/validate
**Status:** TODO
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

#### Verification Focus

- End-to-end temp repo install, update, and doctor tests.

---

### AF-M6-T2

**Title:** Implement pack add/remove/list commands
**Status:** TODO
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

---

### AF-M7-T1

**Title:** Add generic, webapp, and finai-example profiles
**Status:** TODO
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

---

### AF-M7-T2

**Title:** Add finance, cloudflare-worker, telegram, and webapp packs
**Status:** TODO
**Complexity:** Red
**Dependencies:** AF-M6-T2

#### JTBD

When users adopt Agent Flow for common domains or runtimes, I want battle-tested optional packs, so that core stays generic without leaving users to recreate common rules.

#### Acceptance Criteria

- `finance` pack contributes financial correctness rules and optional domain reviewer.
- `cloudflare-worker` pack contributes Worker runtime, Wrangler, D1/R2/KV, and deployment-impact surfaces.
- `telegram` pack contributes Telegram QA and UX/copy constraints.
- `webapp` pack contributes browser QA, accessibility, and common frontend workflow hints.
- `finai.example` profile composes `finance + cloudflare-worker + telegram` through config.
- None of these pack terms appear in core scans.

#### Verification Focus

- Pack render snapshots.
- FinAI-example fixture proves current FinAI contract is reproducible through profile + packs.

---

### AF-M8-T1

**Title:** Add temp-repo install tests and agnostic scans
**Status:** TODO
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

---

### AF-M9-T1

**Title:** Write public docs and migration guide
**Status:** TODO
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
