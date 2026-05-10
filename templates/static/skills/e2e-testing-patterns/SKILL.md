---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: e2e-testing-patterns
description: "Browser-driven end-to-end testing patterns for stable, evidence-first QA."
---

# E2E Testing Patterns

Use this reference together with `.claude/skills/e2e-testing/SKILL.md` and `.claude/skills/webapp-testing/SKILL.md` when you need stable browser-driven verification.

## Principles

- verify real user journeys, not implementation details
- use hypothesis -> action -> expected -> actual -> evidence
- prefer visible, stable UI contracts
- wait for conditions, not arbitrary sleeps
- capture evidence while the state is fresh

## Coverage Priorities

1. smoke against the live local surface
2. primary user journey
3. error / empty / loading states
4. at least one negative or boundary case

## Anti-Patterns

- brittle selector chains
- CSS-only assertions
- tests that depend on previous run state
- PASS claims without captured evidence
