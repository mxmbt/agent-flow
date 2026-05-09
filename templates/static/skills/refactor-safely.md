---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: Refactor Safely
description: Plan and execute safe refactoring using dependency analysis
---

## Refactor Safely

Use graph/dependency analysis before changing shared code.

## Rules

- inspect callers and importers first
- avoid changing public contracts unless the task explicitly requires it
- verify after each meaningful step
- prefer rollback-friendly sequences over large atomic rewrites
