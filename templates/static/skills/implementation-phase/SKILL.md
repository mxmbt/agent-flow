---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: implementation-phase
description: "IMPLEMENTATION phase: feature-developer executes the approved Design Document."
argument-hint: "[<taskId>]"
---

# IMPLEMENTATION Phase

## Preparation

### diffBase — MANDATORY

Before dispatching `feature-developer`, compute and record:

```bash
DIFF_BASE=$(git merge-base HEAD {{git.integrationRef}})
```

Write it to `reports.implementation.diffBase` before the agent starts. REVIEW, QA, and DELIVERY use this SHA for diff-scoped verification.

### Required Inputs From PLAN

Extract from the current state and DD:

- canonical research pack path from `reports.plan.analysis.researchPack`
- `reports.plan.techReview`
- `reports.plan.scope`
- current Design Document path
- current state path

At minimum, implementation must inherit:

- error map
- failure modes
- critical gaps
- test strategy or test diagram when present

If any of these are missing from the approved plan, do not silently continue as if they existed. Use the real state/DD content and note the gap in the agent prompt.

### Context Skills

Add only what the task needs:

- UI work -> `{{target.toolRoot}}/skills/frontend-design/SKILL.md`, `{{target.toolRoot}}/skills/shadcn-ui/SKILL.md`, `{{artifacts.designSystemFile}}`, `{{artifacts.uxWritingGuideFile}}`
- browser / E2E work -> `{{target.toolRoot}}/skills/e2e-testing-patterns/SKILL.md`
- AI / provider work -> `{{target.toolRoot}}/skills/rag-implementation/SKILL.md`
- bug-heavy or regression-heavy work -> `{{target.toolRoot}}/guides/systematic-debugging.md`

## Required Agent Instructions

The `feature-developer` prompt must include:

- task ID
- phase token
- Design Document path
- state path
- research pack path
- diffBase
- downstream plan artifacts from `reports.plan.techReview`
- repo-native checks

The prompt must require:

- read the research pack first
- read the current Design Document
- read the current state
- follow `{{target.toolRoot}}/guides/test-driven-development.md`
- follow `{{target.toolRoot}}/guides/verification-before-completion.md`
- stay inside approved scope unless blocked

## Project Guardrails

Implementation must preserve:

- configured data-isolation and authorization boundaries
- input validation on user-facing inputs
- UTC handling for timestamps
- configured domain correctness invariants: {{quality.invariantSummary}}
- configured runtime and pack-contributed constraints

For UI work, implementation must follow `DDREF:ui.*` sections when present.

## Required Checks Before AGENT_REPORT

Default checks for code changes:

```bash
{{checks.defaultShellBlock}}
```

Additional checks:

- schema changed -> {{checks.changedSchemaInline}}
- deploy/runtime config changed -> verify `{{runtime.bindingConfigFile}}` and related binding assumptions

## State Update

After AGENT_REPORT arrives, record in `reports.implementation`:

- `branch`
- `diffBase`
- `filesCreated`
- `filesModified`
- `filesDeleted`
- `tdd`
- `checks`
- `qualityGates`

Use the current shared state shape. Do not force legacy fields such as `lint`, `auditGate`, storage-specific checks, or framework-specific contracts into implementation state when the task does not use them.

Then move to SIMPLIFY.
