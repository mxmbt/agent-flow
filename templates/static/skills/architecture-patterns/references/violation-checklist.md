# Architecture Violation Checklist

Use this list to spot boundary violations quickly during planning, review, or quality-gate work.

## Dependency Direction

- runtime modules do not import each other in cycles
- domain or service logic does not depend on UI or transport details
- infrastructure adapters do not become the de facto domain layer

## Boundary Discipline

- handlers and routes remain thin
- validation happens at entry boundaries
- storage or provider details do not leak into unrelated modules
- privileged operations stay behind explicit contracts

## Change Safety

- changed boundaries have tests at the right level
- breaking contract changes are explicit
- migration or rollback is defined when storage or runtime behavior changes

## Numeric / Data Correctness

- precise arithmetic where high-value numeric or regulated values matter
- no hidden future-data dependency
- scoped or protected data remains isolated to the right actor
