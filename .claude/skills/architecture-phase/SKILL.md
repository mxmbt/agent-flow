---
name: architecture-phase
description: "ARCHITECTURE phase: architect agent → ADD. Только для 🔴."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# ARCHITECTURE Phase

**Когда:** Только для 🔴 задач (новые Prisma модели, API с бизнес-логикой, auth/RBAC, внешние API, RAG pipeline, Yjs integration).

### Контекстные скиллы (orchestrator подставляет по типу задачи)

| Триггер | Что добавить в промпт |
|---------|----------------------|
| RAG/AI задача | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/rag-implementation/SKILL.md ПЕРЕД проектированием.` |
| Всегда | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/architecture-patterns/SKILL.md для выбора паттерна.` |

## Вызов агента

```
Task tool:
  subagent_type: "architect"
  prompt: "Создай ADD для задачи ZN-S<N>-T<ID>.

  [вставь контекстные скиллы по таблице выше]

  Design Document: docs/sprints/sprint-<N>/plans/ZN-S<N>-T<ID>-design.md
  Сложность: 🔴

  ADD должен включать:
  - Контекст и проблему
  - Варианты решения
  - Выбранный подход с обоснованием
  - Prisma schema (с organizationId на всех tenant-моделях)
  - tRPC роутер дизайн (Zod schemas)
  - Риски и mitigation

  Сохрани ADD в docs/ADRs/ADD-<slug>.md"
```

## После AGENT_REPORT

- ADD создан в `docs/ADRs/`
- Записать в state.json → `reports.architecture.addFile`
- Перейти к IMPLEMENTATION
