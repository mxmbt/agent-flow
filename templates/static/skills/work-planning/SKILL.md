---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: work-planning
description: "High-level roadmap and milestone planning: define what and why before detailed implementation planning."
argument-hint: "[planning action]"
---

# Work Planning

Use this skill for milestone decomposition, follow-up task creation, and retrospectives.

## Required Context

- `{{artifacts.statusFile}}`
- `{{artifacts.productFile}}`
- `{{artifacts.roadmapFile}}`
- relevant phase artifacts when they already exist

## Core Flow

1. read `{{artifacts.statusFile}}`, `{{artifacts.productFile}}`, and `{{artifacts.roadmapFile}}`
2. inspect current phase artifacts if they exist
3. use `product-manager` for scope, priority, and sequencing
4. use `analyst` only when codebase discovery affects planning quality
5. update phase task or retrospective artifacts and compact `{{artifacts.statusFile}}` if the current-state snapshot is stale or noisy

## Task Sources

There are two managed task sources in this repo. Both follow the same tasks.md format and are subject to the same delivery close-out rule.

| Source | When to use |
|--------|-------------|
| `{{artifacts.phaseRoot}}/phase-<phase-token>/tasks.md` | Milestone or phase-scoped work |
| `{{artifacts.backlogFile}}` | Cross-phase fix/planned backlog (`{{project.taskPrefix}}-FIX-*`, `{{project.taskPrefix}}-PLAN-*`) |

`{{artifacts.backlogFile}}` is created and maintained by work-planning, not ad-hoc. When a new fix sprint or cross-phase backlog is needed, work-planning owns creating and structuring it.

## Phase Directory Scaffold

When creating a new phase, `product-manager` must create the following structure if it does not already exist:

```
{{artifacts.phaseRoot}}/phase-<phase-token>/
  tasks.md          ← task list (see format below)
  research/         ← per-task research packs created by PLAN
  states/           ← one state.json per task
  design/           ← one design doc per task
  handoffs/         ← per-task handoff detail files
  retrospective.md  ← filled at retrospective time
```

Do not create task-level files that the phase does not yet need. `retrospective.md` is created at retrospective time, not at planning time. PLAN bootstraps each task's `research/`, `states/`, and `design/` artifacts when execution for that task actually begins.

## tasks.md Format

Every `tasks.md` (phase-level or root-level backlog) must follow this structure:

```markdown
# Phase <phase-token> — Tasks
<!-- or: # Cross-Phase Fix Now and Planned Work  for the configured backlog file -->

**Phase:** <human-readable phase name>
**Milestone:** <one-line goal>
**Created:** YYYY-MM-DD
**Status:** IN FLIGHT | CLOSED

---

## Task Index

| ID | Title | Complexity | Dependencies | Status |
|----|-------|------------|--------------|--------|
| [{{project.taskPrefix}}-X-T1](#{{project.taskPrefix}}-x-t1) | Short title | 🔴 | — | 🔲 TODO |
| [{{project.taskPrefix}}-X-T2](#{{project.taskPrefix}}-x-t2) | Short title | 🟡 | T1 | ✅ DONE |

---

## Tasks

---

### {{project.taskPrefix}}-X-T1

**Title:** Short title
**Status:** TODO | IN PROGRESS | ✅ DONE — [PR #N](url) | ➡️ DEFERRED
**Complexity:** 🔴 / 🟡 / 🟢
**Dependencies:** none | T2, T3
**Design doc:** {{artifacts.phaseRoot}}/phase-<token>/design/{{project.taskPrefix}}-X-T1-design.md

---

#### JTBD

When <persona> <does action>, I want <outcome>, so that <benefit>.

---

#### Acceptance Criteria

- criterion one
- criterion two

---

#### TDD Focus

- test scenario one
- test scenario two
```

**Status values:**

| Value | Meaning |
|-------|---------|
| `🔲 TODO` | not started |
| `🔄 IN PROGRESS` | currently being worked |
| `✅ DONE — [PR #N](url)` | shipped and merged |
| `➡️ DEFERRED` | moved to a future phase or roadmap |

The Status column in the Task Index and the **Status:** field in the task body must stay in sync. Delivery updates both.

## Outputs

- `{{artifacts.phaseRoot}}/phase-<phase-token>/tasks.md` (created with directory scaffold if new phase)
- `{{artifacts.phaseRoot}}/phase-<phase-token>/retrospective.md` (at retrospective time only)
- `{{artifacts.backlogFile}}` (when managing the cross-phase fix/planned backlog)
- roadmap notes when the plan changes milestone sequencing
- `{{artifacts.statusFile}}` only when the current-state snapshot needs hygiene or compaction

## Rules

- keep tasks atomic
- keep acceptance criteria testable
- separate delivery scope from follow-up debt
- keep `{{artifacts.statusFile}}` concise: remove stale blockers, compress old shipped detail, and do not turn it into a roadmap
- when a new phase is planned, always create the directory scaffold, including `research/`, and a properly formatted `tasks.md` — do not leave the phase without a task source
- task status in both the Task Index table and the task body must reflect ground truth; delivery is responsible for closing them out
