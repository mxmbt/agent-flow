---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: ux-copy-review
description: "UX Copy Review: проверка UI-текстов по UX-WRITING-GUIDE.md."
argument-hint: "[file paths or component names to review]"
---

# UX Copy Review

Review user-facing copy for clarity, consistency, and actionability.

## Checklist

- tone matches the intended surface
- buttons use concrete verbs
- errors explain what happened and what to do next
- empty states explain value and next action
- terminology matches the project glossary
- no placeholders, stack traces, or internal IDs leak into UX text

## Output

Classify issues as:

- `CRITICAL` -> misleading or technical text reaching the user
- `MAJOR` -> unclear CTA, inconsistent terminology, weak guidance
- `MINOR` -> style, length, punctuation, polish
