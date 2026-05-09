---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: refactor-plan
description: 'Планирование многофайлового рефакторинга: последовательность, зависимости, и rollback.'
license: MIT (upstream: github/awesome-copilot)
---

# Refactor Plan

Use before a refactor that touches multiple files or contracts.

## Plan Requirements

1. identify the scope and dependency graph first
2. sequence type and contract changes before implementation cleanup
3. include intermediate verification points
4. include rollback strategy
5. keep behavior unchanged unless explicitly approved otherwise

## Verification Defaults

```bash
{{checks.defaultShellBlock}}
```

## Output Shape

- current state
- target state
- affected files
- phased sequence
- per-phase verification
- rollback plan
- main risks
