---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: refactor
description: 'Хирургический рефакторинг кода для улучшения сопровождаемости без изменения поведения.'
license: MIT (upstream: github/awesome-copilot)
---

# Refactor

Use this skill for behavior-preserving refactors on real code, not for speculative rewrites.

## Principles

1. behavior stays the same
2. refactor in small, reviewable steps
3. let tests and type checks protect each step
4. stop if the refactor starts turning into feature work

## Common Targets

- long functions
- duplicated logic
- unclear names
- mixed concerns in one module
- dead code
- brittle condition trees

## Safe Process

1. understand the current behavior and impact radius
2. identify the smallest useful refactor slice
3. change one thing at a time
4. run verification after each meaningful step
5. keep public contracts stable unless the task explicitly changes them

## Repo-Native Verification

```bash
{{checks.defaultShellBlock}}
```

Add narrower task-specific checks when they exist, but do not invent missing repo scripts.
