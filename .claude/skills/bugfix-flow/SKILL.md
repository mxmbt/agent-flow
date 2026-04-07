---
name: bugfix-flow
description: "Bugfix: systematic-debugging. Триггеры: 'fix', 'баг', 'не работает'."
argument-hint: "[описание бага]"
---

# Bugfix Flow

Когда пользователь просит починить баг ВНЕ полного Development Lifecycle.

### Контекстные скиллы (orchestrator подставляет по типу бага)

| Триггер | Что добавить в промпт |
|---------|----------------------|
| UI баг | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/frontend-design/SKILL.md ПЕРЕД исправлением UI.` + `Прочитай .claude/skills/ux-copy-review/SKILL.md для текстов.` + `Сверяй с docs/design/DESIGN-SYSTEM.md (токены, компоненты).` |
| BlockNote bug (блоки, slash menu, media upload/render, read-only) | `ОБЯЗАТЕЛЬНО прочитай docs/architecture/BLOCKNOTE-DEVELOPMENT.md ПЕРЕД исправлением.` |
| BlockNote style bug | `ОБЯЗАТЕЛЬНО прочитай docs/architecture/BLOCKNOTE-STYLING.md ПЕРЕД исправлением.` |
| RAG/AI баг | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/rag-implementation/SKILL.md ПЕРЕД исправлением.` |

## Вызов агента

```
Task tool:
  subagent_type: "feature-developer"
  prompt: "BUGFIX: [описание бага].

  ОБЯЗАТЕЛЬНО прочитай .claude/guides/systematic-debugging.md и следуй методу:
  1. Reproduce — воспроизведи баг
  2. Isolate — изолируй проблему
  3. Hypothesize — сформулируй гипотезу
  4. Test — проверь гипотезу
  5. Fix — исправь root cause
  6. Verify — добавь regression test

  [вставь контекстные скиллы по таблице выше]

  Контекст: [файлы, ошибки, логи, шаги воспроизведения]

  Обычные причины в ZNAI:
  - Missing organizationId в Prisma query → данные чужой org
  - Yjs conflict не обработан → document corruption
  - vLLM timeout не обработан → зависший запрос
  - Zod schema mismatch → tRPC validation error"
```

## После AGENT_REPORT

1. Проверь что баг исправлен и добавлен regression test
2. Если нужен delivery (PR, merge) → вызови `delivery-agent`
3. Если баг сложный → создай задачу в docs/sprints/sprint-<N>/tasks.md
