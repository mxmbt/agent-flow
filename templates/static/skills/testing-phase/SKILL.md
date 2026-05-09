---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: testing-phase
description: "QA phase: adversarial live-service verification after QUALITY_GATE."
argument-hint: "[<taskId>]"
---

# QA Phase

QA runs after QUALITY_GATE for any task that changes behavior, runtime, or user-visible output.

## Skip Conditions

You may skip QA only for changes limited to repo docs or orchestration metadata. Record the reason in state.

## Required Inputs

Before dispatching `qa-expert`, load:

- task ID
- top-level `designDocument`
- canonical research pack path from `reports.plan.analysis.researchPack`
- `reports.plan.scope`
- `reports.implementation.filesCreated`
- `reports.implementation.filesModified`
- `reports.implementation.diffBase`
- `reports.qualityGate`
- current state path

Do not depend on non-guaranteed fields such as `task title`.

## Required QA Instructions

The `qa-expert` prompt must require:

- reading the research pack first
- reading `.claude/guides/verification-before-completion.md`
- reading `{{artifacts.qaSharedAccountFile}}`
- reading `.claude/skills/webapp-testing/SKILL.md` for browser surfaces
- reading `.claude/skills/e2e-testing/SKILL.md` for multi-step user flows when relevant
- reading `.claude/skills/e2e-testing-patterns/SKILL.md` for stable browser heuristics when relevant
- reading `.claude/skills/accessibility-audit/SKILL.md` when accessibility-sensitive UI changed
- confirming a live response from `{{dev.startUrl}}`
- starting `{{dev.startCommand}}` if needed
- running configured checks:

```bash
{{checks.defaultShellBlock}}
```

- smoke + happy path + edge/negative coverage
- at least one boundary test when auth, isolation, or storage changed

## QA Artifacts

Primary evidence should live in the AGENT_REPORT.

If QA finds failures, the detailed failure handoff file belongs at:

```text
{{artifacts.phaseRoot}}/phase-<phase-token>/handoffs/<taskId>/qa-detail.md
```

Use the repo-local QA report template only if a fuller repo-local QA report is actually produced. Do not require a second file when AGENT_REPORT plus `qa-detail.md` already cover the evidence.

## Routing After QA

- `APPROVED` -> DELIVERY
- `NEEDS_FIX` -> FIX -> QA again
- `BLOCKED` -> stop and report to the user

Max 3 `NEEDS_FIX` QA cycles, then `BLOCKED`.
