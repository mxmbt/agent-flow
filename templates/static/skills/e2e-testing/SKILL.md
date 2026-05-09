---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: e2e-testing
description: "End-to-end testing guidance for real browser user flows."
---

# E2E Testing

Use whatever browser automation capability is available in the current runtime. The goal is to exercise the flow the way a user would.

## Workflow

1. navigate to the target surface
2. inspect the initial state
3. perform the user actions
4. assert user-visible outcomes
5. capture evidence

## Preferred Assertions

- URL changes
- visible text
- enabled or disabled control state
- successful submission or explicit error state
- rendered data that matches the scenario

Avoid deep DOM-structure assertions unless there is no better user-facing contract.
