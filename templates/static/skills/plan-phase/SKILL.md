---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: plan-phase
description: "PLAN phase: research -> product review -> brainstorming -> tech review -> devil's advocate -> Design Document -> configured plan review."
argument-hint: "[<taskId>]"
---

# PLAN Phase

> All steps are mandatory for any task complexity.
> PLAN is a dialogue with the user.
> RESEARCH is mandatory and must produce a repo-local research pack at the canonical phase path before detailed planning continues.

## Dialogue-First Rule

- PLAN is done together with the user, not instead of the user.
- Scope, product direction, UX choices, trade-offs, and questionable assumptions must be discussed with the user.
- Decide autonomously only on obvious things: established project pattern, explicit existing repo truth, or a choice that does not change scope, UX, or product behavior.
- For every non-obvious decision, come with a recommendation and 1-2 alternatives with explicit trade-offs.
- One question = one real decision.

## Persistence Contract

PLAN is a long phase. Its repo-local recovery artifacts are:

1. `{{artifacts.phaseRoot}}/phase-<phase-token>/states/<taskId>-state.json`
2. `{{artifacts.phaseRoot}}/phase-<phase-token>/design/<taskId>-design.md`
3. `{{artifacts.phaseRoot}}/phase-<phase-token>/research/<taskId>-research-pack.md`

Do not wait until the end of the phase. Bootstrap these files immediately and keep them updated as PLAN progresses.

Resume rule:

- on return to an unfinished PLAN phase, first read `state.json`, current Design Document, and the research pack
- infer the next missing mandatory step from populated `reports.plan.*` fields and the DD content
- do not restart broad research if the research pack is already sufficient

## Required Context Before PLAN

Before Step 0 and before the first long reasoning pass, read:

- `{{artifacts.statusFile}}`
- `{{artifacts.productFile}}`
- `{{artifacts.roadmapFile}}`
- `{{artifacts.uiUxSpecificationFile}}` for user-facing work
- current phase `tasks.md`
- dependency state or handoff artifacts when they affect scope
- `the repo-local design document template`
- `the repo-local state template`

## Step 0: Artifact Bootstrap — MANDATORY

Immediately upon entering PLAN, before research and before any long reasoning pass:

1. Compute final paths:
   - `STATE_FILE = {{artifacts.phaseRoot}}/phase-<phase-token>/states/<taskId>-state.json`
   - `DD_FILE = {{artifacts.phaseRoot}}/phase-<phase-token>/design/<taskId>-design.md`
   - `RESEARCH_PACK = {{artifacts.phaseRoot}}/phase-<phase-token>/research/<taskId>-research-pack.md`
2. Create `states/`, `design/`, and `research/` directories if they do not exist.
3. If `STATE_FILE` does not yet exist:
   - create it from `the repo-local state template`
   - fill `taskId`, `phaseToken`, `updatedAt`
   - set `currentPhase = "PLAN"`
   - set top-level `designDocument = DD_FILE`
   - set `phases.plan.status = "in_progress"`
   - set `reports.plan.progress.artifactsBootstrapped = true`
   - set `reports.plan.analysis.researchPack = RESEARCH_PACK`
4. If `STATE_FILE` already exists:
   - do not overwrite existing data
   - update `updatedAt`
   - ensure top-level `designDocument = DD_FILE`
   - ensure `reports.plan.progress.artifactsBootstrapped = true`
   - ensure `reports.plan.analysis.researchPack = RESEARCH_PACK`
5. If `DD_FILE` does not yet exist:
   - create it from `the repo-local design document template`
   - fill task metadata at the top of the file
   - set status to a bootstrap draft
6. If `RESEARCH_PACK` does not yet exist:
   - create it immediately at the canonical path with a minimal draft containing:
     - task title / task id / phase token
     - `## Summary`
     - `## Inventory`
     - `## Existing Patterns`
     - `## Tests`
     - `## Risks`
     - `## Open Questions`
7. If `DD_FILE` or `RESEARCH_PACK` already exists:
   - do not overwrite substantive content
   - continue from the existing draft

## Step 1: RESEARCH — MANDATORY

Before detailed planning, produce or refresh the research pack.

Research contract:

- the research pack path is mandatory: `{{artifacts.phaseRoot}}/phase-<phase-token>/research/<taskId>-research-pack.md`
- the orchestrator should not do broad direct code exploration before the research pass
- use graph-first discovery through `analyst`
- if the canonical research pack path unexpectedly does not exist, attempt to open it first, then recreate it and continue

Analyst prompt must require:

- graph-first discovery
- likely files and flows
- nearby tests
- reuse patterns
- risk notes
- preliminary complexity signal
- explicit open questions only when Pass 1 cannot resolve them

Minimum required research pack sections:

- `Summary`
- `Inventory`
- `Existing Patterns`
- `Tests`
- `Risks`
- `Open Questions`
- `Recommended Next Step`

Pass structure:

1. Pass 1 — Scout
   - broad structural discovery
   - write the research pack at the canonical path
2. Pass 2 — Targeted
   - only if `Open Questions` still contains blocking gaps
   - read the existing research pack first
   - answer only the listed questions and update the same file

Write-back after research:

- ensure `reports.plan.analysis.researchPack = RESEARCH_PACK`
- update `updatedAt` in state.json
- sync research findings into the Design Document:
  - `DDREF:product.direction` -> scope framing
  - `DDREF:technical.analysis` -> current state, existing patterns, affected surfaces
  - `DDREF:test.plan` -> existing tests and likely regression surfaces

## Step 2: Product Review — MANDATORY

After RESEARCH, run `/product-review`.

Goals:

- confirm we are solving the right problem
- choose mode and scope direction
- decide what is explicitly out of scope
- lock final complexity (`GREEN`, `YELLOW`, `RED`)

Write-back after step:

- update `reports.plan.productReview`
- update `reports.plan.complexity`
- update `reports.plan.scope.in`
- update `reports.plan.scope.out`
- update `updatedAt` in state.json
- sync `DDREF:product.direction`

## Step 3: Brainstorming — MANDATORY

After product review, run `/brainstorming`.

Goals:

- turn direction into concrete requirements and user flows
- narrow scope to thin vertical slices where possible
- surface alternative approaches before tech review locks the build path

Write-back after step:

- refine `reports.plan.scope.in`
- refine `reports.plan.scope.out`
- update `updatedAt` in state.json
- sync the Design Document:
  - `DDREF:product.direction`
  - `DDREF:technical.analysis`
  - `DDREF:sprint.contract`

## Step 4: Tech Review — MANDATORY

After brainstorming, run `/tech-review`.

Goals:

- convert scope into a buildable implementation path
- produce error map, failure modes, and test strategy
- identify expert-review concerns early

Write-back after step:

- update `reports.plan.techReview`
- update `updatedAt` in state.json
- sync the Design Document:
  - `DDREF:technical.analysis`
  - `DDREF:test.plan`
  - `DDREF:expert.considerations`

## Step 5: Devil's Advocate — MANDATORY

After tech review, run `/devils-advocate`.

Goals:

- challenge blind spots, hidden scope expansion, and happy-path bias
- pressure-test user impact, risk assumptions, and implementation shape

Verdict handling:

- `Ship it` -> proceed
- `Ship with changes` -> revise the plan, then proceed
- `Rethink this` -> blocker, ask the user the narrowest necessary question

Write-back after step:

- update `reports.plan.devilsAdvocate`
- update `updatedAt` in state.json
- sync the Design Document:
  - `DDREF:technical.analysis` -> risks and mitigations
  - `DDREF:sprint.contract` -> kill criteria and explicit non-goals
  - `DDREF:expert.considerations` when the challenge changes risk posture

## Step 6: Design Document

The Design Document lives immediately at the final path:

`{{artifacts.phaseRoot}}/phase-<phase-token>/design/<taskId>-design.md`

Use `the repo-local design document template` as the base template.

Required sections from the current repo contract:

- `DDREF:product.direction`
- `DDREF:technical.analysis`
- `DDREF:test.plan`
- `DDREF:sprint.contract`
- `DDREF:expert.considerations`
- `DDREF:plan.review`
- `DDREF:ui.*` sections for UI-bearing work

Current repo note:

- the shared template does not yet break out separate `research.codebase` or `implementation.plan` sections
- until the template changes, capture those details inside:
  - `DDREF:technical.analysis` -> current state, proposed change, risks, mitigations, migration/API notes, codebase research
  - `DDREF:test.plan` -> automated, manual/runtime, rollout/rollback
  - `DDREF:sprint.contract` -> success criteria, kill criteria, explicit non-goals

Configured project checklist:

- data-isolation and authorization boundaries
- UTC handling for timestamps
- domain correctness invariants from project config and installed packs: {{quality.invariantSummary}}
- runtime and pack-contributed constraints

UI/UX contract for user-facing work:

- read `{{artifacts.designSystemFile}}`
- read `{{artifacts.uxWritingGuideFile}}`
- read `{{artifacts.uiUxSpecificationFile}}`
- fill:
  - `DDREF:ui.design-direction`
  - `DDREF:ui.ux-texts`
  - `DDREF:ui.customer-journey`
  - `DDREF:ui.information-architecture`

Write-back after step:

- ensure the Design Document is implementation-ready rather than high-level
- update top-level `designDocument` in state if needed
- update `updatedAt` in state.json

## Step 7: Plan Review Of The Draft Plan

This is an internal quality gate before showing the plan to the user.

Use the configured reviewer invocation rule from the root agent instructions.

Review checklist:

- can a developer implement the task without follow-up questions?
- are there hidden gaps between steps?
- are data-isolation, validation, runtime, and configured domain-correctness concerns covered?
- are success criteria concrete and testable?

If review returns `NEEDS_REVISION`:

- revise the same Design Document
- re-run review
- max 3 iterations

CRITICAL concerns must be resolved before approval.

Write-back after step:

- record the review outcome in `DDREF:plan.review`
- update `updatedAt` in state.json

## Step 8: Request Plan Approval -> User Approval -> Resume After Approval

Only after the draft passes internal plan review:

1. Request plan approval
2. present the current Design Document to the user
3. capture any approval-driven revisions in the same file
4. Resume after approval
5. write `reports.plan.approvedAt`
6. update `phases.plan.status = "completed"`
7. route `RED` tasks to ARCHITECTURE, otherwise to IMPLEMENTATION

## State.json Updates

Keep `reports.plan` aligned with the shared state template:

- `progress.artifactsBootstrapped`
- `analysis.researchPack`
- `complexity`
- `scope.in`
- `scope.out`
- `approvedAt`
- `productReview`
- `techReview`
- `devilsAdvocate`

Also keep these top-level fields current:

- `currentPhase`
- `updatedAt`
- `designDocument`

Do not instruct agents to rely on fields that are not present in `the repo-local state template`.
