---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: review-phase
description: "REVIEW phase: built-in review plus deep-reviewer, with explicit triage, negotiation, and bounded FIX cycles."
argument-hint: "[<taskId>]"
---

# REVIEW Phase (Deliberative Review)

Review is deliberative, not mechanical.

## Overview

Two-stage review with a **negotiation protocol** — the orchestrator triages findings, discusses with the reviewer, fixes only accepted issues, and verifies targeted.

1. **Primary review** — standard problems (max 3 cycles)
2. **deep-reviewer** — deep review: race conditions, business logic, data isolation, query/resource bounds (max 3 cycles)

**Anti-pattern:** blindly fixing all findings → re-review → new findings → infinite loop.
**Correct:** triage → negotiate → fix accepted → targeted verify.

If a finding goes to `DEFER`, classify it with `kind/priority/complexity/module/revisitTrigger` and a clear `deferTarget`. A DEFER without these fields is considered incomplete.

---

## Stage 1: Primary Review (or equivalent)

### 0. Collect diff from diffBase

```bash
DIFF_BASE=$(read from state.json → reports.implementation.diffBase)
git diff $DIFF_BASE...HEAD --name-only   # file list
git diff $DIFF_BASE...HEAD               # diff content
```

Before the first review call, also load:

- canonical research pack from `reports.plan.analysis.researchPack`
- current Design Document
- current state file
- simplify summary when the simplify pass changed code

### 1. First review call

Pass task context + configured project rules as additional guidelines.

```
Review prompt for <taskId>: [task title]

## Task context
[description from state.json]

## Research pack
[summary / risks / affected files from canonical research pack]

## Design Document
[current DD path]

## Changed files
[file list]

## Diff
[git diff]

## Project-specific guidelines (supplement standard review)

- data isolation: every data access path touching scoped data MUST contain the configured authorization boundary — missing = P0
- Input validation: all user-facing inputs must be validated — missing = P1
- Domain correctness: enforce configured invariants from project config and installed packs — violation = P0
- No debug output left in released or user-visible code
- No hardcoded secrets/credentials
- UTC handling: all timestamps must be stored and compared in UTC
- Runtime constraints: configured runtime and pack-contributed limits must be respected
```

**Save the threadId** from the response — it is needed for follow-up replies.

### 2. TRIAGE — orchestrator classifies findings

For each finding, determine disposition:

| Criterion | Disposition | Action |
|-----------|-------------|--------|
| P0/P1 + confidence >= 0.7 + real bug/security | **ACCEPT** | Goes to FIX |
| P0/P1 + confidence < 0.7 or disputed context | **CHALLENGE** | Discussion via reply |
| P2 + confidence >= 0.8 + concrete fix | **ACCEPT** | Goes to FIX |
| P2 + confidence < 0.8 or subjective | **CHALLENGE** | Discussion via reply |
| P3, style, theoretical, YAGNI | **REJECT** | Justify via reply |
| Duplicate of configured static analysis/type checks | **REJECT** | Already covered by toolchain |

**Principle:** the orchestrator is a **senior engineer**, not a secretary. Evaluate findings critically, taking into account the task and codebase context.

### 3. NEGOTIATE — discussion via reply

```
Reply prompt:

Thanks for the review. Here are my decisions on findings:

## ACCEPT (going to FIX)
- #1 (P0, missing data-isolation boundary): agreed, critical
- #4 (P1, missing input validation): agreed, will fix

## CHALLENGE (please argue)
- #2 (P1, race condition in X): We use a unique constraint as guard — duplicate insert returns error, not data corruption. Is this sufficient?
- #5 (P2, error handling): Error is propagated through the error boundary — why an additional catch?

## REJECT (will not fix)
- #3 (P3, naming): style matter, covered by configured static checks
- #7 (P3, theoretical edge case): confidence 0.4, no real attack vector

Please confirm REJECT and argue the CHALLENGE items.
```

### 4. Processing the negotiation response

The reviewer may:
- **Agree with REJECT** → confirmed REJECT, do not fix
- **Insist on CHALLENGE item** with argument → evaluate the argument:
  - Convincing argument (concrete attack vector, real scenario) → **ACCEPT**
  - Theoretical argument / repeats the same thing → **REJECT** (orchestrator's final decision)
- **Insist on REJECT item** → one more round ONLY for P0/P1. P2+ → final REJECT

**One-round rule:** for each finding, maximum 1 challenge round. After the reviewer's response — orchestrator's final decision. Endless debate is not allowed.

### 5. FIX — only ACCEPTED findings

Record disposition in state.json → `reports.review.primaryReviewTriage`:
```json
{
  "accepted": [{ "id": 1, "summary": "..." }],
  "rejected": [{ "id": 3, "reason": "style/static-check" }],
  "challengeResolved": [{ "id": 2, "resolution": "ACCEPT", "reason": "convincing attack vector" }]
}
```

Invoke `/fix-phase` ONLY with ACCEPTED findings.

If every finding is rejected or deferred, do not manufacture a FIX cycle. Record the triage and move on.

### 6. TARGETED VERIFY — via targeted reply (NOT a new session)

After FIX — verify in the same thread:

```
Reply prompt:

Fixes applied. Check ONLY the following:

## Fixed findings
- #1: added data-isolation boundary in [file:line]
- #4: added input validation for [field]

## Updated diff (only changed files)
[git diff for specific files]

## Important
Check ONLY the listed fixes. New findings outside the scope of these fixes are not needed.
```

### 7. Handling verify response

- **All fixes OK** → APPROVED → proceed to Stage 2
- **A fix broke something** → new cycle (increment `cycles.review`), ONLY for the broken fix
- **Reviewer found new issues outside scope** → TRIAGE again (step 2) with elevated threshold:
  - Cycle 2: only P0/P1 accepted, P2+ → DEFER
  - Cycle 3: only P0 accepted, P1+ → DEFER

### 8. Hard cap: 3 cycles

After 3 cycles:
- All remaining P0 → FIX (mandatory)
- All P1+ → DEFER to phase tasks or ROADMAP
- Proceed to Stage 2 regardless

---

## Stage 2: Deep Review

```
Agent contract:
  subagent_type: "deep-reviewer"
  prompt: "Deep code review for <taskId>.
  Task: <taskId> [optional human title if available]

  Read research pack first:
  {{artifacts.phaseRoot}}/phase-<phase-token>/research/<taskId>-research-pack.md

  Diff from diffBase:
  [git diff $DIFF_BASE...HEAD]

  Design Document:
  {{artifacts.phaseRoot}}/phase-<phase-token>/design/<taskId>-design.md

  State file:
  {{artifacts.phaseRoot}}/phase-<phase-token>/states/<taskId>-state.json

  Configured project focus:
  - data-isolation and authorization boundaries on scoped data
  - temporal-leakage or causal-ordering constraints from project config and installed packs
  - UTC handling for timestamps
  - configured domain correctness invariants: {{quality.invariantSummary}}
  - configured runtime and pack-contributed constraints"
```

### Deep Review TRIAGE (orchestrator)

Same principles as for Stage 1 — orchestrator triages findings:

- **CRITICAL** + concrete scenario → ACCEPT → FIX
- **CRITICAL** + theoretical → CHALLENGE (request concrete reproduction scenario)
- **MAJOR** + concrete → ACCEPT → FIX
- **MAJOR** + subjective / YAGNI → REJECT with justification

### Deep Review FIX cycle

- `verdict: "APPROVED"` → proceed to QUALITY_GATE
- `verdict: "NEEDS_CHANGES"` → TRIAGE → FIX only ACCEPTED → targeted deep-reviewer verify
- Increment `cycles.review` in state.json

### Hard cap: 3 cycles for Deep Review

After 3 cycles:
- CRITICAL → FIX (mandatory)
- MAJOR → DEFER
- Proceed to QUALITY_GATE regardless

---

## Diminishing Returns Rule

| Cycle | What to fix |
|-------|-------------|
| 1 | P0 + P1 + P2 (confident) |
| 2 | Only P0 + P1 |
| 3 | Only P0 |

Everything else → DEFER. Routing by priority:

1. **Phase tasks** — finding is related to the current module, can be done in this phase → `{{artifacts.phaseRoot}}/phase-<phase-token>/tasks.md`
2. **ROADMAP section** — finding relates to a specific roadmap area → `{{artifacts.roadmapFile}}` in the relevant section
3. **ROADMAP Tech Debt** — doesn't fit a phase or milestone → `{{artifacts.roadmapFile}}` → `Tech Debt / Improvements` section

For each deferred item, record: `kind`, `priority`, `complexity`, `module`, `revisitTrigger`, `deferTarget`.

Do not mix different modules or types of work in one deferred item.
Do not send `security` / `data isolation` / `correctness` items with P0/P1 to generic backlog without a milestone.

---

## State.json Updates

Record in `reports.review`:
- `verdict`: final (APPROVED only when both stages APPROVED or hard cap reached)
- `primaryReviewIssues`: all issues from the review (raw)
- `primaryReviewTriage`: disposition per finding (accepted/rejected/challenged)
- `primaryReviewThreadId`: threadId for audit
- `deepReviewIssues`: issues from deep-reviewer
- `deepReviewTriage`: disposition per finding
- `deferred`: findings deferred by diminishing returns rule; for each DEFER record `kind`, `priority`, `complexity`, `module`, `revisitTrigger`, `deferTarget`
- `cycles`: number of iterations (total)

---

## Orchestrator Checklist

- [ ] ThreadId saved after first review call
- [ ] Each finding has a disposition (ACCEPT/REJECT/CHALLENGE)
- [ ] REJECT contains justification (not just "disagree")
- [ ] FIX sent only with ACCEPTED findings
- [ ] Verify done via targeted reply (not a new session)
- [ ] Verify asks to check ONLY fixes (not full re-review)
- [ ] Hard cap observed (3 primary-review cycles, 3 deep-reviewer cycles)
- [ ] Deferred items recorded in phase tasks / ROADMAP
