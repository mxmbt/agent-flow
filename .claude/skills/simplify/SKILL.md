---
name: simplify
description: "Code simplification: упрощение кода без изменения поведения."
---

# Code Simplification

> Чеклист для ручного анализа и упрощения кода в фазе SIMPLIFY.

## Iron Law

**NEVER CHANGE BEHAVIOR.** Only change HOW code does something, not WHAT it does.

## When to Apply

- After implementing a feature (implementation-phase)
- After fixing bugs (fix-phase)
- After refactoring
- Before code review

## Process

### Step 1: Identify Recently Modified Code

```bash
git diff --name-only HEAD~1  # or diffBase from state.json
```

Focus ONLY on changed files unless explicitly told otherwise.

### Step 2: Analyze for Simplification Opportunities

For each file, check:

| Category | Look For |
|----------|---------|
| **Complexity** | Deep nesting (>3 levels), long functions (>30 lines), complex conditionals |
| **Redundancy** | Duplicated logic, unnecessary abstractions, dead code |
| **Naming** | Unclear variable/function names, inconsistent conventions |
| **Structure** | Mixed concerns, poor separation, unclear data flow |
| **TypeScript** | Missing types, `any` usage, overly complex generics |

### Step 3: Apply Simplifications

**DO:**
- Reduce nesting (early returns, guard clauses)
- Improve variable/function names
- Extract repeated logic (only if pattern repeats 3+ times)
- Remove dead code
- Simplify conditionals (remove double negatives, flatten)
- Use clear TypeScript types

**DON'T:**
- Change behavior or output
- Add features
- Refactor code you didn't touch
- Create abstractions for one-time use
- Prefer "fewer lines" over readability
- Use nested ternaries (prefer if/else or switch)

### Step 4: Verify

```bash
npm test           # All tests still pass
npm run type-check # Types still valid
npm run lint       # No new violations
```

## Red Flags — STOP

- Tests fail after your changes → REVERT
- You're adding new dependencies
- You're changing function signatures used by other modules
- You're "improving" code you didn't touch
- The "simplified" version is harder to understand

## Examples

```typescript
// ❌ Before: deep nesting
function process(user: User) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission('edit')) {
        return doEdit(user);
      }
    }
  }
  return null;
}

// ✅ After: guard clauses
function process(user: User) {
  if (!user || !user.isActive || !user.hasPermission('edit')) {
    return null;
  }
  return doEdit(user);
}
```

```typescript
// ❌ Before: unclear naming
const d = items.filter(i => i.s === 'active').map(i => i.v);

// ✅ After: clear naming
const activeValues = items
  .filter(item => item.status === 'active')
  .map(item => item.value);
```

```typescript
// ❌ Before: nested ternary
const label = isAdmin ? 'Admin' : isEditor ? 'Editor' : isViewer ? 'Viewer' : 'Guest';

// ✅ After: clear switch
function getRoleLabel(role: Role): string {
  switch (role) {
    case 'admin': return 'Admin';
    case 'editor': return 'Editor';
    case 'viewer': return 'Viewer';
    default: return 'Guest';
  }
}
```

## Balance Principles

1. **Preserve all functionality** — no behavior changes, ever
2. **Apply project standards** — CLAUDE.md conventions, TypeScript strict, naming
3. **Enhance clarity** — reduce complexity, improve names, remove dead code
4. **Maintain balance** — don't over-simplify, don't create overly clever code
5. **Focus scope** — only refine recently modified files

## Checklist (before marking complete)

- [ ] All tests pass (`npm test`)
- [ ] Type-check passes (`npm run type-check`)
- [ ] Lint passes (`npm run lint`)
- [ ] No behavior changes
- [ ] Code is more readable, not less
- [ ] No unnecessary abstractions added
- [ ] Only touched recently modified files
