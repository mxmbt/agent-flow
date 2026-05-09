---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: bugfix-flow
description: "Standalone bugfix flow: reproduce -> isolate -> fix -> verify."
argument-hint: "[bug description]"
---

# Bugfix Flow

Use this flow when the user asks to fix a bug directly outside the full lifecycle.

## Sequence

1. reproduce with `.claude/guides/systematic-debugging.md`
2. isolate the real failing boundary
3. route the code change through `feature-developer`
4. add or update a regression test when the surface is testable
5. run repo-native verification
6. if behavior changed or the bug touched a user-facing/runtime surface, require QA before claiming done

## When To Escalate Into Full Lifecycle

Do not keep a bugfix in this shortcut flow if it turns into:

- boundary or architecture work
- schema / migration work
- auth / isolation work with significant scope
- multi-surface product change

In those cases, switch to the normal lifecycle starting at PLAN.

## Common Bug Classes

- handler or contract drift
- invalid input or missing validation
- stale state or caching mismatch
- retry / idempotency mistakes
- timestamp or timezone mistakes
- data-isolation leaks
- incorrect domain arithmetic or aggregation

## Context Skills

Add only what the bug needs:

- UI bug -> `.claude/skills/frontend-design/SKILL.md`, `{{artifacts.designSystemFile}}`, `{{artifacts.uxWritingGuideFile}}`, relevant design docs
- AI / provider bug -> `.claude/skills/rag-implementation/SKILL.md`

## Required Checks

```bash
{{checks.defaultShellBlock}}
```

Add schema or runtime checks when the fix touches those surfaces.
