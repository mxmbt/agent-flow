---
name: simplify-phase
description: "SIMPLIFY phase: code review + manual checklist для changed files."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# SIMPLIFY Phase (Scoped)

## Когда использовать

После IMPLEMENTATION и до REVIEW.

## Подготовка

Orchestrator ОБЯЗАН прочитать state.json и извлечь:

```
- task.title, task.complexity
- reports.plan.scope
- reports.implementation.filesCreated
- reports.implementation.filesModified
```

## Агент

Вызови `code-simplifier`:

```
Task tool:
  subagent_type: "code-simplifier"
  prompt: "Фаза SIMPLIFY для ZN-S<N>-T<ID>.
  Задача: [task.title] (сложность: [complexity])

  ОБЯЗАТЕЛЬНО прочитай через Read tool ПЕРЕД началом работы:
  - `.claude/skills/simplify/SKILL.md` — manual checklist (complexity, redundancy, naming, structure, TypeScript)

  Scope реализации:
  [вставь reports.plan.scope]

  Файлы в scope (ТОЛЬКО эти файлы анализировать и фиксить):
  Created: [вставь filesCreated]
  Modified: [вставь filesModified]

  Workflow:
  1. Ручной анализ каждого файла по чеклисту из simplify/SKILL.md
     — ловит issues: complexity, redundancy, naming, structure, TypeScript
  2. Фикси ТОЛЬКО файлы из scope через Edit tool
  3. npm test && npm run type-check && npm run lint

  Iron Law: NEVER CHANGE BEHAVIOR.
  Не добавляй новый продуктовый scope.
  REVIEW будет идти сразу после этого диффа."
```

## Обработка результата

- `verdict: "DONE"` → перейти к REVIEW
- Любые открытые вопросы сохранить в `reports.simplify.openQuestions`

## State.json Updates

Записать в `reports.simplify`:
- `verdict`
- `filesReviewed`
- `filesChanged`
- `findings` — `{ total, fixed, skipped }`
- `summary`
- `openQuestions`
- `expertQuestions`
