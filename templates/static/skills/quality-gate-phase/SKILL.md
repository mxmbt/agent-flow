---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: quality-gate-phase
description: "QUALITY_GATE phase: security, domain correctness, performance, and UX review -> findings arbiter."
argument-hint: "[<taskId>]"
---

# QUALITY_GATE Phase

Run configured expert reviews in parallel, then route all findings through `findings-arbiter`.

## Experts

- configured core experts:
{{quality.experts}}
- configured domain expert when present: `{{quality.domainExpert}}`

## Step 1: Context Preparation

Before dispatching experts, load:

- task ID
- `reports.plan.complexity`
- top-level `designDocument`
- canonical research pack path from `reports.plan.analysis.researchPack`
- `reports.plan.scope`
- `reports.plan.techReview.failureModes`
- `reports.plan.techReview.criticalGaps`
- `reports.implementation.filesCreated`
- `reports.implementation.filesModified`
- `reports.implementation.branch`
- review triage summary from `reports.review.primaryReviewTriage` and `reports.review.deepReviewTriage`

Pass concrete context into each expert prompt. Do not tell experts to “just read state.json” and figure it out from scratch.

## Step 2: Experts In Parallel

Call configured experts in parallel.

Each prompt must include:

- task ID
- complexity if available
- implementation scope
- changed files
- Design Document path
- research pack path
- review triage summary when relevant

### paranoid-architect

Must focus on:

- data isolation and boundary mistakes
- missing validation and unsafe error handling
- hardcoded secrets or credentials
- timestamp and runtime safety concerns
- whether critical failure modes from PLAN were actually closed

### configured domain expert

Must focus on:

- configured domain correctness invariants: {{quality.invariantSummary}}
- domain-specific edge cases from installed packs
- deterministic handling of rounding, aggregation, or boundary behavior where relevant
- zero / null / empty-window edge cases
- correctness of derived calculations and summaries

### performance-expert

Must focus on:

- query/resource counts and hot-path amplification
- configured runtime time-budget risks
- unbounded loops or scans over user data
- expensive repeated reads of shared data
- obvious caching or batching opportunities

### ux-expert

Must focus on:

- user-facing clarity and brevity
- UX copy quality
- error-message helpfulness without leaking internals
- DDREF-aligned UI/UX behavior when UI is in scope
- accessibility and interaction quality where relevant

## Step 3: Findings Arbiter

After all expert AGENT_REPORTs arrive, call `findings-arbiter`.

Arbiter rules:

- decide every finding as `FIX NOW`, `DEFER`, or `SKIP`
- `FIX NOW` requires concrete fix instructions
- `DEFER` requires:
  - `deferTarget`
  - `kind`
  - `priority`
  - `complexity`
  - `module`
  - `revisitTrigger`
- do not bury correctness, security, isolation, or domain-correctness defects in vague backlog language

Non-negotiable `FIX NOW` cases:

- missing configured data-isolation or authorization boundary on scoped data
- violation of configured domain correctness invariants
- violation of configured numeric precision or accumulation invariants
- hardcoded secrets or credentials

## Step 4: DEFER Routing

Immediately route deferred findings:

- `phase-tasks` -> `{{artifacts.phaseRoot}}/phase-<phase-token>/tasks.md`
- `roadmap:<section>` -> `{{artifacts.roadmapFile}}`
- `techdebt` -> `{{artifacts.roadmapFile}}` -> `Tech Debt / Improvements`

Rules:

- do not combine unrelated modules in one deferred item
- do not combine unrelated finding kinds in one item
- performance or reliability defers should include a concrete threshold or revisit trigger
- high-severity correctness/security/isolation issues should not disappear into generic backlog notes

## Step 5: FIX -> Re-verify

- arbiter says no `FIX NOW` items -> proceed to QA
- arbiter says `FIX NOW` -> route into `/fix-phase`, then arbiter re-verifies only those items

Re-verify must be targeted, not a full re-audit.

## State Update

Record in `reports.qualityGate`:

- `paranoidArchitect`
- `domainExpert`
- `performanceExpert`
- `uxExpert`
- `arbiterDisposition`
- `arbiterVerdict`

Use the current shared state expectations. Do not require extra QUALITY_GATE-only fields such as `expertQuestions` or `arbiterHandoffFile` unless the repo formally adds them to the shared contract later.
