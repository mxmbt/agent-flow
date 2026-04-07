---
name: phase-check
description: "Валидатор lifecycle: state.json, reports, пропущенные фазы."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# Phase Check (Валидатор)

Вызывается для проверки корректности прохождения фаз.

## Что проверить

1. **Прочитай state.json** из `docs/sprints/sprint-<N>/states/ZN-S<N>-T<ID>-state.json`

2. **Проверь каждую фазу до currentPhase:**
   - `phases.<phase>.status` должен быть `"completed"` или `"skipped"`
   - `reports.<phase>` должен быть заполнен (не пустой объект и не null)

3. **Проверь текущую фазу:**
   - `phases.<currentPhase>.status` должен быть `"in_progress"` или `"completed"`

4. **Проверь lifecycle flow:**
   - Development: PLAN → [ARCH] → IMPL → SIMPLIFY → REVIEW → AUDIT → OPT → QA → DELIVERY
   - Нет ли пропущенных фаз между completed фазами
   - SIMPLIFY обязательна между IMPL и REVIEW (не должна быть пропущена)

5. **Проверь PLAN артефакты (если plan completed):**
   - `reports.plan.productReview` заполнен (mode, premiseChallenge не null)
   - `reports.plan.techReview` заполнен (errorMap, failureModes, testDiagram не пустые)
   - `reports.plan.techReview.criticalGaps` — если есть gaps, проверить что в IMPL они закрыты

6. **Проверь diffBase (если implementation completed):**
   - `reports.implementation.diffBase` не null (нужен для REVIEW и QA)

5. **Проверь FIX циклы:**
   - Если `cycles > 0`, должен быть соответствующий FIX report

## Формат ответа

```
PHASE CHECK RESULTS:
✅ PLAN: completed, report filled
✅ IMPLEMENTATION: completed, report filled
❌ REVIEW: completed, BUT report is EMPTY → need to fill reports.review
⚠️  AUDIT: pending (current phase)
```

## Действия при ошибках

- **Report пуст** → вернись к фазе и вызови соответствующий skill
- **Фаза пропущена** → выполни пропущенную фазу
- **Все ОК** → продолжай текущую фазу
