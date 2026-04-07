---
name: verification-before-completion
description: Evidence-based verification before completion claims. Iron Law — no completion claims without fresh verification evidence. Use in QA and after implementation to verify work is truly done.
---

# Verification Before Completion

## Iron Law

**NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.**

If you haven't executed the verification command in your current session, you cannot claim success.

## The Gate Function

Before claiming ANY status (tests pass, build succeeds, bug fixed), execute this 5-step process:

### 1. IDENTIFY
What command proves this claim?

### 2. RUN
Execute the complete command fresh. Not from memory. Not from a previous run.

### 3. READ
Check FULL output AND exit codes. Not just the last line.

### 4. VERIFY
Does the evidence support the claim?
- **NO** → State actual status with evidence
- **YES** → State claim WITH evidence

### 5. ONLY THEN
Make the claim.

**Skipping steps equals dishonesty, not efficiency.**

## Red Flags — STOP

If you catch yourself:
- Using "should," "probably," "seems to"
- Expressing satisfaction before verification
- Trusting agent success reports without checking
- Relying on partial checks
- "It worked last time"
- Any wording implying success without running verification

**ALL mean: you haven't verified. Run the command.**

## Common Failures

| Claim | Requires | Insufficient |
|-------|----------|-------------|
| "Tests pass" | Test output: 0 failures | Previous runs, assumptions |
| "Build succeeds" | Build exit code: 0 | Linter passing |
| "Bug fixed" | Original symptom gone in test | Code changes alone |
| "Feature complete" | All acceptance criteria verified | "Looks right" |
| "No regressions" | Full test suite green | "Only touched X" |

## Verification Commands (ZNAI Project)

```bash
# Tests pass
npm test                    # Exit code 0, 0 failures

# Types correct
npm run type-check          # Exit code 0

# Lint clean
npm run lint                # Exit code 0

# Build succeeds
npm run build               # Exit code 0

# Quality gate
npm run audit:gate          # All checks pass

# Architecture
npm run audit:arch          # No circular deps
```

## Why This Matters

From documented failures:
- Broken trust from false completion claims
- Undefined functions shipping to production
- Missing requirements discovered in QA
- Wasted rework time from "it works" that didn't
- Violations of core engineering honesty

## Anti-Rationalizations

| Excuse | Reality |
|--------|---------|
| "I already tested it" | When? Show the output. |
| "The test passed earlier" | Run it again. Environments change. |
| "It's a trivial change" | Trivial changes break things too. Verify. |
| "I'll test later" | Later never comes. Test now. |
| "The agent said it worked" | Agent reports are not evidence. Run the command yourself. |

## Integration with TDD

This skill complements TDD (`.claude/guides/test-driven-development.md`):
- TDD: write test → watch fail → write code → watch pass
- Verification: before claiming DONE → run ALL commands → show evidence

TDD ensures correctness during development.
Verification ensures honesty during reporting.
