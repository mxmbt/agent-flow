---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: webapp-testing
description: "Browser-surface testing: reconnaissance, interaction, assertions, screenshots."
---

# Web Application Testing

Use this skill to inspect and exercise a web surface before or during QA.

## Reconnaissance-Then-Action

1. open the target page
2. inspect the current state and actionable controls
3. capture a screenshot if visual context matters
4. interact only after the page structure is understood
5. assert the result with user-visible evidence

## Capture

- page URL and title
- actionable elements
- visible copy or banners
- screenshots for failures or important states

## Rules

- prefer stable accessible labels or visible text over brittle selectors
- wait for state changes, not arbitrary timeouts
- use absolute paths for saved screenshots when required by the runtime
