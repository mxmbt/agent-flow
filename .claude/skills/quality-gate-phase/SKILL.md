---
name: quality-gate-phase
description: "QUALITY_GATE phase: paranoid-architect + performance-expert + ux-expert параллельно → findings-arbiter disposition."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# QUALITY_GATE Phase

Объединённая фаза аудита и оптимизации. Три агента параллельно анализируют код, затем findings-arbiter принимает решения по findings.

## Шаг 1: Подготовка контекста (ПЕРЕД агентами!)

Orchestrator читает state.json и извлекает:

```
Из state.json:
- task.title, task.complexity
- reports.plan.scope — что реализовано
- reports.plan.techReview.failureModes — Failure Modes Registry (для paranoid-architect)
- reports.plan.techReview.criticalGaps — CRITICAL GAPS (для верификации)
- reports.implementation.filesCreated — новые файлы
- reports.implementation.filesModified — измененные файлы
- reports.implementation.branch — ветка
- reports.review.issues — замечания из code review (если есть)
```

## Шаг 2: Три агента параллельно

Вызови **все три агента параллельно**. **Передавай конкретный контекст, а не ссылку на state.json!**

**paranoid-architect:**
```
Task tool:
  subagent_type: "paranoid-architect"
  prompt: "Фаза QUALITY_GATE (security) для ZN-S<N>-T<ID>.
  Задача: [task.title] (сложность: [complexity])

  Scope реализации:
  [вставь reports.plan.scope — список шагов]

  Измененные файлы:
  [вставь filesCreated + filesModified — полные пути]

  Ветка: [branch]

  Замечания из REVIEW:
  [вставь review.issues или 'все исправлены']

  Failure Modes Registry из PLAN:
  [вставь reports.plan.techReview.failureModes]
  → Верифицируй что каждый CRITICAL GAP закрыт (тест + error handling + user-visible error).

  Критически важно проверить:
  - organizationId на всех Prisma queries для tenant-данных
  - Zod validation на всех tRPC inputs
  - Нет hardcoded secrets
  - Prompt injection защита (если код передаёт user input в vLLM)

  Проверь каждый файл на безопасность и resilience.

  Expert Questions (ОБЯЗАТЕЛЬНО):
  - Что мы забыли (безопасность)?
  - Что мы сделали неправильно (безопасность)?
  - Что можно улучшить (resilience)?"
```

**performance-expert:**
```
Task tool:
  subagent_type: "performance-expert"
  prompt: "Фаза QUALITY_GATE (performance) для ZN-S<N>-T<ID>.
  Задача: [task.title] (сложность: [complexity])

  Scope реализации:
  [вставь reports.plan.scope]

  Измененные файлы:
  [вставь filesCreated + filesModified]

  Обрати внимание на:
  - N+1 в Prisma queries
  - Redis caching для дорогих операций
  - vLLM streaming включён?
  - Qdrant payload index на organizationId?
  - Yjs awareness memory bounds?

  Expert Questions (ОБЯЗАТЕЛЬНО):
  - Что можно улучшить (производительность)?
  - Что мы сделали неправильно (производительность)?
  - Что мы забыли (производительность)?"
```

**ux-expert:**
```
Task tool:
  subagent_type: "ux-expert"
  prompt: "Фаза QUALITY_GATE (design + copy + accessibility) для ZN-S<N>-T<ID>.
  Задача: [task.title] (сложность: [complexity])

  Scope реализации:
  [вставь reports.plan.scope — список шагов]

  Измененные файлы (UI-релевантные):
  [вставь filesCreated + filesModified — полные пути]

  ПРИОРИТЕТ проверок (именно в этом порядке):
  1. Design quality & DS compliance — .claude/skills/design-audit/SKILL.md (80-item checklist)
  2. UX copy quality — .claude/skills/ux-copy-review/SKILL.md
  3. Accessibility — .claude/skills/accessibility-audit/SKILL.md

  Для UI-задач: ОБЯЗАТЕЛЬНО прочитай .claude/skills/design-audit/SKILL.md — 80-item checklist.
  Для UI-задач: ОБЯЗАТЕЛЬНО прочитай .claude/skills/shadcn-ui/SKILL.md — Shadcn composition.
  Для UI-задач: ОБЯЗАТЕЛЬНО прочитай .claude/skills/frontend-design/SKILL.md — design quality.
  Для копирайтинга: ОБЯЗАТЕЛЬНО прочитай .claude/skills/ux-copy-review/SKILL.md.
  ОБЯЗАТЕЛЬНО прочитай .claude/skills/accessibility-audit/SKILL.md — WCAG 2.1 чеклист.

  Включи в AGENT_REPORT: designScore (A-F) и aiSlopScore (A-F).
  Обрати внимание на: loading/error/offline states, BlockNote UX если есть editor-компоненты.
  Для UI-задач: проверь соответствие реализации Design Document секциям 6a-6d.
    Секция 6d (IA): правильно ли расставлены приоритеты контента (primary/secondary/tertiary)?
    Interaction cost ≤2 для primary task? Progressive disclosure tiers соблюдены?
  Для structural findings (layout changes): используй Redesign Spec Template из agent definition.

  Expert Questions (ОБЯЗАТЕЛЬНО):
  - Достаточно ли качественный и смелый UI?
  - Интуитивен ли user flow?
  - Ясны ли тексты с первого прочтения?
  - Что мы забыли (design/copy/accessibility)?"
```

## Шаг 3: Findings Arbiter (Opus)

После получения AGENT_REPORT от всех трёх агентов — вызови Arbiter для принятия решений.

```
Task tool:
  subagent_type: "findings-arbiter"
  model: "opus"
  prompt: "Findings Disposition для ZN-S<N>-T<ID>.
  Задача: [task.title] (сложность: [complexity])

  Scope реализации:
  [вставь reports.plan.scope]

  ## Security findings (paranoid-architect, score: N/10)
  [вставь compact findings + selfCritique]
  Handoff: [path]

  ## Performance findings (performance-expert, score: N/10)
  [вставь compact findings + selfCritique]
  Handoff: [path]

  ## UX findings (ux-expert, score: N/10)
  [вставь compact findings + selfCritique]
  Handoff: [path]

  Прими решение по КАЖДОМУ finding: FIX NOW / DEFER / SKIP.
  Для FIX NOW — сформируй конкретное ТЗ (файл, строка, как исправить).
  Для DEFER — укажи deferTarget: sprint | roadmap:<секция> | techdebt.
  Аргументируй каждое решение.
  Принцип: не накапливать техдолг, но YAGNI/KISS фильтр обязателен."
```

## Шаг 4: Обработка Arbiter результата

### DEFER Routing (оркестратор делает сам)

Сразу после получения Arbiter report — запиши все DEFER items в целевые файлы:

| `deferTarget` | Куда писать | Формат |
|---------------|-------------|--------|
| `"sprint"` | `docs/sprints/sprint-<N>/tasks.md` | Новая задача с описанием finding |
| `"roadmap:<секция>"` | `product/ROADMAP.md` → указанная секция | Строка в таблицу секции |
| `"techdebt"` | `product/ROADMAP.md` → `Tech Debt / Улучшения (backlog)` | `TD-N \| Область \| Описание \| QUALITY_GATE (ZN-S<N>-T<ID>)` |

Это документы планирования, не код — правило "оркестратор не пишет код" не применяется.

### FIX Routing

- Arbiter `verdict: "APPROVED"` (нет FIX NOW) → перейти к QA
- Arbiter имеет FIX NOW findings → `/fix-phase` с ТЗ из Arbiter → Arbiter re-verify (targeted)

### FIX → Re-verify цикл

1. Передай Arbiter handoff file в `/fix-phase`
2. После FIX → вызови Arbiter в режиме re-verify:

```
Task tool:
  subagent_type: "findings-arbiter"
  model: "opus"
  prompt: "Re-verify FIX NOW items для ZN-S<N>-T<ID>.

  FIX NOW items были:
  [вставь список FIX NOW из предыдущего Arbiter report]

  Проверь что каждый item закрыт. Прочитай конкретные файлы.
  НЕ делай полный re-audit — только targeted проверка."
```

3. Arbiter `VERIFIED` → QA. Arbiter `NEEDS_CHANGES` → ещё FIX цикл (с WTF cap)

## State.json Updates

Записать в `reports.qualityGate`:
- `paranoidArchitect`: verdict + score + blockingIssues + warnings + selfCritique + handoffFile
- `performanceExpert`: verdict + score + suggestions + metrics + selfCritique + handoffFile
- `uxExpert`: verdict + score + blockingIssues + warnings + designScore (A-F) + aiSlopScore (A-F) + selfCritique + handoffFile
- `expertQuestions`: { security: [], performance: [], ux: [] }
- `arbiterDisposition`: массив { source, finding, decision, reason, fixInstructions?, deferTarget? }
- `arbiterVerdict`: APPROVED | FIX_REQUIRED
- `arbiterHandoffFile`: path
