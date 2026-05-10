---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: phase-check
description: "Валидатор lifecycle: state.json, reports, пропущенные фазы."
argument-hint: "[<taskId>]"
---

# Phase Check

Use this skill before every phase transition to verify that the current task state is coherent with the active Agent Flow lifecycle.

## What To Read

Read the task state from:

`{{artifacts.phaseRoot}}/phase-<phase-token>/states/<taskId>-state.json`

When relevant, also check:

- top-level `designDocument`
- canonical research pack from `reports.plan.analysis.researchPack`
- current phase `tasks.md`

## What To Validate

### 1. Phase status integrity

For every phase before `currentPhase`:

- `phases.<phase>.status` must be `completed` or `skipped`
- corresponding `reports.<phase>` must contain meaningful data

For the current phase:

- phase status must be `in_progress`, `completed`, or `skipped` when skipping is explicitly allowed

### 2. PLAN bootstrap and completion

If PLAN is in progress:

- top-level `designDocument` is present
- `reports.plan.progress.artifactsBootstrapped = true`
- `reports.plan.analysis.researchPack` is present
- design document file exists on disk
- research-pack file exists on disk, or its absence is a currently explained bootstrap gap being fixed immediately

If PLAN is completed:

- `reports.plan.complexity` is filled
- `reports.plan.scope.in` and `reports.plan.scope.out` are present
- `reports.plan.approvedAt` is filled
- `reports.plan.productReview` is filled
- `reports.plan.techReview` is filled
- `reports.plan.devilsAdvocate` is filled

### 3. Lifecycle order

Active lifecycle:

`{{lifecycle.sequence}}`

Check that:

- SIMPLIFY is not skipped between IMPLEMENTATION and REVIEW
- QUALITY_GATE is not skipped between REVIEW and QA
- ARCHITECTURE is skipped only when the task is not `RED`

### 4. Implementation handoff quality

If IMPLEMENTATION is completed:

- `reports.implementation.diffBase` exists
- implementation file lists are present
- verification checks are present

### 5. Review / QA cycle integrity

If REVIEW is completed:

- `reports.review.primaryReviewIssues`
- `reports.review.primaryReviewTriage`
- `reports.review.deepReviewIssues`
- `reports.review.deepReviewTriage`
- `reports.review.cycles`

If QA is completed:

- `reports.qa.testPlan`
- `reports.qa.verdict`
- `reports.qa.summary`
- `reports.qa.cycles`

Do not require phantom FIX reports or unsupported top-level `cycles.*` objects.

## Output Format

Return concise validation results, for example:

```text
PHASE CHECK RESULTS:
✅ PLAN: completed, required plan artifacts present
✅ IMPLEMENTATION: completed, diffBase and checks present
❌ REVIEW: completed, but reports.review.primaryReviewTriage is empty
⚠️ QA: pending (current phase)
```

## Error Handling

- empty or missing report -> return to that phase and complete it properly
- skipped required phase -> run the missing phase
- incomplete PLAN bootstrap -> run Step 0 from `plan-phase` immediately
- missing design document or research pack -> restore the canonical artifact before continuing
- all checks pass -> continue to the target phase
