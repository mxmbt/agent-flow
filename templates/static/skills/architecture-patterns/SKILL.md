---
provenance_class: adapted_vendor
provenance_origin: upstream-adapted
upstream_sync_policy: baseline_only
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: attribution-pending
name: architecture-patterns
description: "Architecture patterns: Clean Architecture, Hexagonal boundaries, and DDD-style decomposition."
---

# Architecture Patterns

Use this skill as a concise reference when a task changes boundaries, data flow, or service composition.

## Core Ideas

### Clean Architecture

- dependencies point inward
- framework code stays at the edges
- business rules do not depend on transport or UI details

### Hexagonal Architecture

- define clear ports or contracts at boundaries
- keep adapters thin
- isolate infrastructure from domain logic

### DDD-Style Decomposition

- organize by bounded context or feature responsibility
- keep ubiquitous language aligned with product docs
- place invariants next to the code that owns them

## Practical Rules

1. keep handlers, routes, and UI entrypoints thin
2. place orchestration in service or use-case units
3. validate at boundaries
4. make contracts explicit and testable
5. avoid leaking provider-specific details deep into unrelated modules
6. prefer additive evolution over hidden breaking changes

## Common Smells

- business logic in route handlers or UI components
- services that mix transport, formatting, persistence, and policy logic
- hidden cross-module imports that blur ownership
- “temporary” infrastructure shortcuts that become permanent coupling

## Reference Checklist

For a lightweight boundary checklist, use `references/violation-checklist.md`.
