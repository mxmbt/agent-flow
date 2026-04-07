---
name: test-driven-development
description: "Iron Law TDD: write failing test first, verify it fails for right reason, write minimal code to pass. ОБЯЗАТЕЛЬНО вызвать В НАЧАЛЕ каждой задачи feature-developer — перед любым production-кодом."
---

# Test-Driven Development

## Iron Law

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

If you didn't watch the test fail, you don't know if it tests the right thing.
If the test passes immediately — you're testing nothing. Delete and start over.

---

## RED -> GREEN -> REFACTOR

### RED: Write One Failing Test

One minimal test demonstrating desired behavior.

**Requirements:**
- One behavior per test
- Clear name = expected behavior
- Real code — minimize mocks
- If name contains "and" -> split into two tests

```typescript
// Good
test('rejects empty email', async () => {
  const result = await submitForm({ email: '' });
  expect(result.error).toBe('Email required');
});

// Bad — tests multiple things
test('validates email and domain and whitespace', async () => { ... });
```

### Verify RED (MANDATORY)

Run: `npm test -- path/to/test.test.ts`

**Confirm ALL THREE:**
1. Test **fails** (not errors — error = broken setup, not missing feature)
2. Failure message is **expected** (you predicted this output)
3. Failure stems from **missing feature**, not typos/imports/syntax

**If test passes immediately -> STOP. Delete code. Start over.**

### GREEN: Write Minimal Code

The **simplest** code that makes the test pass.

- No extra features
- No refactoring
- No "while I'm here" changes
- YAGNI — only what the test demands

### Verify GREEN (MANDATORY)

Run: `npm test -- path/to/test.test.ts`

**Confirm ALL THREE:**
1. New test **passes**
2. All other tests still **pass**
3. No errors or warnings in output

### REFACTOR: Improve Without Changing Behavior

After green only:
- Remove duplication
- Improve names
- Extract helpers (only if pattern repeats)

Keep tests green. Don't add behavior.

---

## Red Flags — STOP and Start Over

If ANY of these happen — delete the code, start fresh with RED:

- Wrote production code before test
- Test passes immediately (wasn't testing anything)
- Cannot explain WHY test should fail
- "I'll add tests after"
- "Keep existing code as reference"
- "Adapt existing code while writing tests"
- "Too simple to need a test"
- "I already manually tested it"
- "Tests after achieve the same goals"
- "TDD is dogmatic, I'm being pragmatic"

**All mean: Delete code. Start over with RED.**

---

## Test Quality

| Quality | Do | Don't |
|---------|-----|-------|
| **Minimal** | One assertion per test | `test('validates and saves and sends')` |
| **Descriptive** | Name = expected behavior | `test('test1')`, `test('should work')` |
| **Real** | Real code, real dependencies | Mock everything |
| **Independent** | No test order dependency | Tests that fail when run alone |

### Selector Priority (UI tests)
`getByRole` > `getByLabelText` > `getByText` > `getByTestId`

---

## Bug Fix TDD

Bug found?
1. Write failing test that **reproduces** the bug
2. Verify RED — test fails showing the bug
3. Fix the code (GREEN)
4. Test proves fix AND prevents regression

**Never fix bugs without a test.**

---

## When Stuck

| Problem | Solution |
|---------|----------|
| Don't know how to test | Write the assertion first — what should the result be? |
| Test too complicated | Design too complicated — simplify the interface |
| Must mock everything | Code too coupled — use dependency injection |
| Test setup huge | Extract test helpers; still complex -> simplify design |

---

## Verification Checklist (before marking complete)

- [ ] Every new function/method has a test
- [ ] Watched each test fail before implementing
- [ ] Each test failed for **expected reason** (missing feature, not typo)
- [ ] Wrote **minimal** code to pass each test
- [ ] All tests pass: `npm test`
- [ ] No errors or warnings in output
- [ ] Tests use real code (mocks only when unavoidable)
- [ ] Edge cases and error paths covered
- [ ] Coverage >= 80%

Cannot check all boxes? You skipped TDD. Start over.
