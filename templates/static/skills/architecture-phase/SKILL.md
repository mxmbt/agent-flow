---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: architecture-phase
description: "ARCHITECTURE phase: architect agent -> ADD/ADR for RED-complexity work."
argument-hint: "[<taskId>]"
---

# ARCHITECTURE Phase

Run this phase for `RED` tasks or when the approved plan crosses a real system boundary.

## Required Inputs

Before dispatching `architect`, load:

- current Design Document
- current state file
- canonical research pack
- `{{artifacts.architectureFile}}`
- `{{artifacts.userIsolationArchitectureFile}}` when data isolation or multi-user boundaries are involved
- relevant ADRs when the task extends or challenges an existing decision

Architectural reading inside the current DD should come primarily from:

- `DDREF:technical.analysis`
- `DDREF:expert.considerations`
- `DDREF:sprint.contract`

The DD is input context, not the final authority. The architect may confirm or overrule the proposed approach, but must explain why.

## Context Skills

Add what the task needs:

- always: `.claude/skills/architecture-designer/SKILL.md`
- boundary or layering work: `.claude/skills/architecture-patterns/SKILL.md`
- AI / retrieval / provider work: `.claude/skills/rag-implementation/SKILL.md`
- decomposition / deep-module cleanup: `.claude/skills/improve-codebase-architecture/SKILL.md`

## Architect Prompt Contract

The prompt must include:

- task ID
- phase token
- Design Document path
- state path
- research pack path
- explicit reason the task is `RED`
- affected boundaries
- architecture docs or ADRs that must be reconciled

The architect must:

- read the research pack first
- read the current DD and current state
- reconcile the proposal against actual repo constraints
- produce a concrete ADD or ADR in the configured repo-local architecture decision location
- state final decisions, risks, rollout notes, and open questions

If the architect overrules the DD:

- update the DD so downstream IMPLEMENTATION does not follow a stale plan
- record the rationale in the ADR

## Expected Output

The architect should produce:

- ADD / ADR path
- explicit decisions
- risk list
- rollout or migration notes
- unresolved questions if any remain

## State Update

Record:

- `reports.architecture.addFile`
- `reports.architecture.decisions`
- `reports.architecture.risks`

Then move to IMPLEMENTATION.
