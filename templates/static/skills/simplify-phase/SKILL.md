---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: simplify-phase
description: "SIMPLIFY phase: behavior-preserving cleanup on changed files before REVIEW."
argument-hint: "[<taskId>]"
---

# SIMPLIFY Phase

Run after IMPLEMENTATION and before REVIEW.

## Preparation

Before dispatching `code-simplifier`, read the current state and extract:

- task ID
- top-level `designDocument`
- canonical research pack path from `reports.plan.analysis.researchPack`
- `reports.plan.scope`
- `reports.implementation.filesCreated`
- `reports.implementation.filesModified`

Only pass the implementation diff scope. SIMPLIFY is not a second implementation pass over the whole repo.

## Agent Prompt

Call `code-simplifier` with:

- task ID
- Design Document path
- research pack path
- implementation scope
- created/modified files only

Prompt requirements:

- read `.claude/skills/simplify/SKILL.md`
- read the research pack first
- read the current Design Document
- work only on provided files
- preserve behavior and public contracts
- do not add product scope
- do not expand into adjacent modules unless a tiny supporting change is required for correctness

For UI-bearing files, also read the current UI contract from `DDREF:ui.*` and relevant design docs.

## Required Checks

Run repo-native checks after simplification:

```bash
{{checks.defaultShellBlock}}
```

If simplification touched schema or generated/runtime config surfaces, re-run the same extra checks required by IMPLEMENTATION.

## Result Handling

- successful simplify pass -> move to REVIEW
- if a simplification would require behavior change, public API change, or broader refactor, stop and report it instead of forcing it through

## State Update

Record in `reports.simplify`:

- `verdict`
- `filesReviewed`
- `filesChanged`
- `findings`
- `summary`

Use the shared state contract only. Do not require extra simplify-only fields that are not part of the current repo state model.
