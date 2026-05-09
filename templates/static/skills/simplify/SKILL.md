---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: simplify
description: "Code simplification: упрощение кода без изменения поведения."
---

# Code Simplification

Use this skill for small, behavior-preserving clarity improvements on code already in scope.

## Checklist

- reduce unnecessary nesting
- improve names
- remove dead branches or duplication
- keep one concept per function or file where practical
- prefer readability over cleverness

## Verification

```bash
{{checks.defaultShellBlock}}
```

Do not add new abstractions or dependencies just to make the code “look cleaner”.
