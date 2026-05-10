---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: fix-phase
description: "FIX phase: feature-developer addresses accepted findings from REVIEW, QUALITY_GATE, or QA."
argument-hint: "[<taskId>]"
---

# FIX Phase

FIX is called after REVIEW, QUALITY_GATE, or QA when that phase produced actionable findings.

The orchestrator never writes code directly. Even a 1-line correction goes through `feature-developer`.

## Deliberative Rule

For REVIEW-originated fixes, FIX receives only accepted findings after triage and negotiation.

Do not send:

- rejected review comments
- style-only noise
- vague “look into this” instructions

## Preparation: Build A Structured Fix Spec

Before dispatching the agent, read:

- current state file
- current Design Document
- canonical research pack
- source-phase findings and handoffs

### Step 1: Group Findings

Group by file/module. If the fix set is large, split into parallel fix agents only when they can work on disjoint files.

Rules:

- related fixes stay together
- one file belongs to one fix agent at a time
- if two fixes need the same file, do them sequentially

### Step 2: Write Concrete Instructions Per Finding

For each finding include:

- severity
- file
- approximate location
- what is broken
- why it matters
- how to fix it

Do not hand the agent raw reviewer prose and expect good results.

### Step 3: Constraints And Verification

Prompt tail must include:

- files not to touch
- relevant design or UX references when UI/copy is involved
- repo-native verification commands

## Context Skills

Add only what the fix needs:

- UI fixes -> `{{target.toolRoot}}/skills/frontend-design/SKILL.md`, `{{target.toolRoot}}/skills/shadcn-ui/SKILL.md`, `{{target.toolRoot}}/skills/ux-copy-review/SKILL.md`, `{{artifacts.designSystemFile}}`, current DD `DDREF:ui.*`
- AI/provider fixes -> `{{target.toolRoot}}/skills/rag-implementation/SKILL.md`

## Agent Prompt Contract

The `feature-developer` prompt must include:

- task ID
- source phase (`REVIEW`, `QUALITY_GATE`, or `QA`)
- state path
- Design Document path
- research pack path
- structured fix list
- constraints
- verification commands

Configured guardrails remain in force:

- data-isolation and authorization boundaries
- input validation
- UTC handling
- configured domain correctness invariants: {{quality.invariantSummary}}
- configured runtime and pack-contributed constraints

## Parallel FIX Agents

Use parallel agents only when:

- the fixes are independent
- they do not touch the same file
- the resulting verification can still be attributed cleanly

Otherwise keep FIX sequential.

## WTF-Likelihood Heuristic

Use the WTF heuristic as an orchestration stop-signal, not as a hidden excuse to keep churning:

- repeated reverts
- fixes spreading into unrelated files
- too many multi-file corrective passes

If the fix effort stops looking mechanical and starts looking speculative, stop and escalate to the user instead of continuing blindly.

## After AGENT_REPORT

1. Update implementation evidence if file lists or checks changed materially.
2. Repeat the phase that raised the findings:
   - REVIEW -> targeted review verify
   - QUALITY_GATE -> arbiter re-verify of `FIX NOW` items
   - QA -> rerun QA
3. Update source-phase cycle counters only where the current shared state contract actually defines them:
   - `reports.review.cycles`
   - `reports.qa.cycles`

Do not require or invent top-level `cycles.*` fields that are not part of the current repo state model.

## Required Checks

Default:

```bash
{{checks.defaultShellBlock}}
```

Add task-specific checks only when directly related to the finding:

- schema changed -> {{checks.changedSchemaInline}}
