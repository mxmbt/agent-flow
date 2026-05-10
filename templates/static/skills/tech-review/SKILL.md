---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: tech-review
description: "Tech Review: architecture fit, failure modes, test strategy, and implementation risk."
---

# Tech Review

Tech Review turns product scope into an implementation-safe engineering plan.

## Deliverables

Produce concise but concrete outputs for the Design Document:

- architecture fit
- error and rescue map
- failure modes
- test plan
- performance or cost risks
- security and isolation considerations
- explicit open questions or prerequisites

## Method

1. identify the current repo pattern closest to this task
2. explain whether the task should extend that pattern or introduce a new one
3. map likely failure modes
4. define verification that would prove the task is done
5. set measurable targets when the task is performance- or reliability-sensitive

## Guardrails

- do not assume a fixed app architecture if the repo does not have one
- do not prescribe extra complexity without a clear payoff
- do not leave testing or rollback vague
