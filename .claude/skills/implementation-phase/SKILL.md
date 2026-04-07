---
name: implementation-phase
description: "IMPLEMENTATION phase: feature-developer, TDD."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# IMPLEMENTATION Phase

## Подготовка (ПЕРЕД вызовом агента!)

### diffBase (ОБЯЗАТЕЛЬНО)
При создании feature branch — вычислить и записать merge-base:
```bash
DIFF_BASE=$(git merge-base HEAD origin/develop)
```
Записать в state.json → `reports.implementation.diffBase` = `$DIFF_BASE`.
Все downstream фазы (REVIEW, QA) используют этот SHA для `git diff <diffBase>...HEAD`.

### Контекст из PLAN (downstream артефакты)
Извлечь из state.json:
- `reports.plan.techReview.errorMap` — Error & Rescue Map
- `reports.plan.techReview.testPlanArtifact` — Test Plan Artifact
- `reports.plan.techReview.criticalGaps` — CRITICAL GAPS для закрытия

### Контекстные скиллы (orchestrator подставляет по типу задачи)

Оркестратор ОБЯЗАН определить тип задачи и добавить в промпт соответствующие скиллы:

| Триггер | Что добавить в промпт |
|---------|----------------------|
| Задача затрагивает UI | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/frontend-design/SKILL.md и .claude/skills/shadcn-ui/SKILL.md ПЕРЕД написанием UI кода.` |
| Задача затрагивает BlockNote блоки / slash menu / media upload / read-only editor | `ОБЯЗАТЕЛЬНО прочитай docs/architecture/BLOCKNOTE-DEVELOPMENT.md ПЕРЕД написанием кода.` |
| Задача затрагивает BlockNote / Mantine editor styles | `ОБЯЗАТЕЛЬНО прочитай docs/architecture/BLOCKNOTE-STYLING.md ПЕРЕД написанием кода.` |
| Задача включает E2E тесты | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/e2e-testing-patterns/SKILL.md ПЕРЕД написанием E2E тестов.` |
| Задача связана с RAG/AI | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/rag-implementation/SKILL.md ПЕРЕД реализацией.` |

## Вызов агента

```
Task tool:
  subagent_type: "feature-developer"
  prompt: "Фаза IMPLEMENTATION для ZN-S<N>-T<ID>.

  ОБЯЗАТЕЛЬНО прочитай .claude/guides/test-driven-development.md — Iron Law TDD.
  ОБЯЗАТЕЛЬНО прочитай .claude/skills/next-best-practices/SKILL.md — Next.js App Router patterns.

  Прочитай Design Document: docs/sprints/sprint-<N>/plans/ZN-S<N>-T<ID>-design.md
  Прочитай state: docs/sprints/sprint-<N>/states/ZN-S<N>-T<ID>-state.json

  Выполни TDD: RED → verify FAIL → GREEN → verify PASS → REFACTOR.

  [вставь контекстные скиллы по таблице выше]

  ## Downstream артефакты из PLAN (обрати внимание!)

  Error & Rescue Map:
  [вставь reports.plan.techReview.errorMap]
  → Для каждого метода с Rescued=N — реализуй error handling.

  Test Plan Artifact:
  [вставь reports.plan.techReview.testPlanArtifact]
  → Напиши тест для каждого codepath. Critical Paths — в первую очередь.

  CRITICAL GAPS:
  [вставь reports.plan.techReview.criticalGaps]
  → Каждый gap ОБЯЗАН быть закрыт (тест + error handling + user-visible error).

  Обязательно:
  - Все Prisma queries с organizationId для tenant-данных
  - Zod validation на всех tRPC inputs
  - Module boundaries: новый код в src/features/<domain>/, публичный API через index.ts

  Для UI-задач: следуй Design Document секциям 6a-6c и своим UI/UX правилам.

  ## Quality Gates (ОБЯЗАТЕЛЬНО перед AGENT_REPORT)
  После TDD и рефакторинга — пройди механические quality gates:
  1. Structure Scan: функции ≤30 строк, вложенность ≤3, One File ≤200 строк, no circular imports, naming по конвенциям
  2. Security Scan: organizationId в Prisma queries, Zod на tRPC inputs, нет console.log, нет hardcoded secrets, error messages не раскрывают internals
  3. npm test && npm run type-check && npm run lint
  Включи результаты в AGENT_REPORT → qualityGates."
```

## После AGENT_REPORT

Записать в state.json → `reports.implementation`:
- `branch`: название ветки
- `diffBase`: merge-base SHA (уже записан в подготовке)
- `filesCreated`, `filesModified`, `filesDeleted`: списки файлов
- `tdd`: { red, green, refactor } статусы
- `checks`: результаты npm test, type-check, lint

Перейти к SIMPLIFY.
