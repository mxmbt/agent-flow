# Review Checklist

## Methodology
Two-pass review. Pass 1 finds blockers (ASK user via orchestrator). Pass 2 finds improvements (classify AUTO_FIX_CANDIDATE vs ASK).

## Pass 1: CRITICAL (default: MUST DECIDE — fix через /fix-phase. ASK только если fix меняет публичный API или поведение фичи)
- Database query safety (injection vectors, raw queries, missing parameterization)
- Race conditions (concurrent access, TOCTOU, transaction isolation)
- Trust boundaries (user input → business logic → external service trust transitions)
- Enum/state completeness (read code OUTSIDE diff to trace all possible states)
- Auth & tenant isolation (are all data queries scoped to authorized context?)

## Pass 2: INFORMATIONAL (classify: AUTO_FIX_CANDIDATE or ASK)
- Conditional side effects (if/else with side effects in one branch only)
- Magic numbers (unexplained constants)
- Dead code (unreachable paths, unused imports)
- Test gaps (new codepaths without tests — cross-ref with Test Diagram from tech-review)
- Input validation gaps (user input without schema validation)
- Error messages (clear enough for user to act?)
- Console/debug output left in production code

## Fix-First Classification
Review is READ-ONLY. Reviewer CLASSIFIES findings, does NOT fix.
- AUTO_FIX_CANDIDATE: mechanical, single-file, zero judgment (magic number → constant, missing import, typo)
- ASK: design decision, multi-file impact, ambiguous trade-off, security-related

If AUTO_FIX_CANDIDATEs found → orchestrator calls /fix-phase → re-runs review.

## Suppressions
Format: `- [описание] — Причина: [почему не флагируем]. Добавлено: [дата].`
Review suppressions periodically (manually, 1x per sprint).
