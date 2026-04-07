---
name: architecture-patterns
description: "Architecture patterns: Clean/Hexagonal Architecture, DDD."
---

# Architecture Patterns

Master proven backend architecture patterns including Clean Architecture, Hexagonal Architecture, and Domain-Driven Design to build maintainable, testable, and scalable systems.

## When to Use This Skill

- Designing new backend systems from scratch
- Refactoring monolithic applications for better maintainability
- Establishing architecture standards for your team
- Migrating from tightly coupled to loosely coupled architectures
- Implementing domain-driven design principles
- Creating testable and mockable codebases
- Planning microservices decomposition

## Core Concepts

### 1. Clean Architecture (Uncle Bob)

**Layers (dependency flows inward):**
- **Entities**: Core business models
- **Use Cases**: Application business rules
- **Interface Adapters**: Controllers, presenters, gateways
- **Frameworks & Drivers**: UI, database, external services

**Key Principles:**
- Dependencies point inward
- Inner layers know nothing about outer layers
- Business logic independent of frameworks
- Testable without UI, database, or external services

### 2. Hexagonal Architecture (Ports and Adapters)

**Components:**
- **Domain Core**: Business logic
- **Ports**: Interfaces defining interactions
- **Adapters**: Implementations of ports (database, REST, message queue)

**Benefits:**
- Swap implementations easily (mock for testing)
- Technology-agnostic core
- Clear separation of concerns

### 3. Domain-Driven Design (DDD)

**Strategic Patterns:**
- **Bounded Contexts**: Separate models for different domains
- **Context Mapping**: How contexts relate
- **Ubiquitous Language**: Shared terminology

**Tactical Patterns:**
- **Entities**: Objects with identity
- **Value Objects**: Immutable objects defined by attributes
- **Aggregates**: Consistency boundaries
- **Repositories**: Data access abstraction
- **Domain Events**: Things that happened

## ZNAI Architecture Mapping

| DDD Concept | ZNAI Implementation |
|-------------|-------------------|
| Bounded Context | `src/features/<module>/` |
| Entity | Prisma models |
| Repository | Service layer (`service.ts`) |
| Use Case | tRPC router procedures |
| Port | tRPC router interface (input/output Zod schemas) |
| Adapter | Prisma client, Redis client, Qdrant client |
| Domain Event | (future: Yjs awareness, webhooks) |

## Clean Architecture in ZNAI

```
src/
  features/           # Use Cases + Entities
    docs/
      router.ts       # Interface Adapter (tRPC)
      service.ts      # Use Case (business logic)
      schema.ts       # Port (Zod input/output contracts)
      types.ts        # Entity types
      components/     # Interface Adapter (UI)
  lib/                # Frameworks & Drivers
    prisma/           # Adapter (database)
    trpc/             # Framework (tRPC setup)
    ai/               # Adapter (vLLM client)
    qdrant/           # Adapter (vector store)
    redis/            # Adapter (cache)
  app/                # Framework (Next.js routing)
```

### Data Flow

```
UI Component → tRPC Router → Service → Prisma → PostgreSQL
     ↑              ↑           ↑
  Interface     Interface    Use Case
  Adapter       Adapter      (business logic)
```

### Key Rules

1. **Services never import from other features** — only through tRPC or props
2. **Prisma models stay in `lib/prisma/`** — features use service abstractions
3. **Multi-tenancy at Prisma middleware level** — never query without `organizationId`
4. **Zod schemas define contracts** — validated at tRPC boundary

## Hexagonal Architecture Example

```typescript
// Port (interface)
// features/docs/schema.ts
export const createDocInput = z.object({
  title: z.string().min(1),
  spaceId: z.string().uuid(),
});

// Use Case (business logic)
// features/docs/service.ts
export async function createDoc(
  input: z.infer<typeof createDocInput>,
  organizationId: string,
) {
  // Business rules here
  return prisma.document.create({
    data: { ...input, organizationId },
  });
}

// Adapter (tRPC)
// features/docs/router.ts
export const docsRouter = router({
  create: protectedProcedure
    .input(createDocInput)
    .mutation(({ input, ctx }) =>
      createDoc(input, ctx.session.organizationId)
    ),
});
```

## Best Practices

1. **Dependency Rule**: Dependencies always point inward
2. **Interface Segregation**: Small, focused interfaces
3. **Business Logic in Domain**: Keep frameworks out of core
4. **Test Independence**: Core testable without infrastructure
5. **Bounded Contexts**: Clear domain boundaries
6. **Ubiquitous Language**: Consistent terminology
7. **Thin Controllers**: Delegate to use cases
8. **Rich Domain Models**: Behavior with data

## Common Pitfalls

- **Anemic Domain**: Entities with only data, no behavior
- **Framework Coupling**: Business logic depends on frameworks
- **Fat Controllers**: Business logic in controllers
- **Repository Leakage**: Exposing ORM objects
- **Missing Abstractions**: Concrete dependencies in core
- **Over-Engineering**: Clean architecture for simple CRUD
