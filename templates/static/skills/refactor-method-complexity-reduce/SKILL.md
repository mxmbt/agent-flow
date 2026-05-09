---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: refactor-method-complexity-reduce
description: 'Снизить когнитивную сложность конкретного метода до указанного порога, извлекая helper-методы и guard clauses.'
license: MIT (upstream: github/awesome-copilot)
---

# Refactor Method to Reduce Cognitive Complexity

Use when one method is too hard to read, reason about, or test.

## Goal

- reduce nesting
- isolate helper responsibilities
- preserve all current invariants and edge handling

## Tactics

- guard clauses for early exits
- extract focused helper methods
- replace large condition trees with smaller named steps
- keep the main method readable as a high-level flow

## Verification

```bash
{{checks.defaultShellBlock}}
```

## Completion Checklist

- complexity is below the requested threshold
- behavior is unchanged
- no critical invariants were lost
- no debug logging or temporary scaffolding remains
