---
name: fix-phase
description: "FIX phase: feature-developer fixes REVIEW/AUDIT/OPT/QA issues."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# FIX Phase

FIX вызывается после любой фазы, которая нашла проблемы: REVIEW (Codex/deep-reviewer), QUALITY_GATE (findings-arbiter disposition), QA.

**Принцип Code Ownership:** Orchestrator НИКОГДА не пишет код напрямую. Даже 1-line fix идёт через feature-developer. Orchestrator передаёт ТЗ из handoff файлов или формирует своё для Codex/QA findings.

**Важно: Deliberative Review Protocol.** Для REVIEW фазы — FIX получает только **ACCEPTED findings** после triage и negotiation. Оркестратор уже отфильтровал P3/стилистические/теоретические замечания. Feature-developer фиксит только то, что прошло фильтр — не нужно ревьюить disposition решения оркестратора.

## Подготовка ТЗ (orchestrator, ДО вызова агента)

Orchestrator ОБЯЗАН трансформировать raw findings в структурированное ТЗ.

### Шаг 1: Группировка

Сгруппируй findings по файлам/модулям. Если >10 fixes — разбей на 2-3 агента по группам файлов. **Связанные fixes** (один зависит от другого) — в одну группу. **Параллельные агенты** не должны трогать одни и те же файлы.

### Шаг 2: Для каждого fix — структурированная инструкция

```
### N. [SEVERITY]: краткое описание

Файл: `path/to/file.ts`, строка ~NN

**Что сломано:** Описание текущего (неправильного) поведения.
**Почему:** Какое правило/инвариант/контракт нарушен.
**Как исправить:** Конкретный пример кода или чёткий алгоритм действий.

```typescript
// Пример исправленного кода — копипастить можно
```
```

**Антипаттерн:** "Вот issues, исправь" — Sonnet не знает контекста и может сделать не то.
**Правильно:** Для каждого issue — файл, строка, пример кода, обоснование.

### Шаг 3: Constraints и verification

В конце промпта ОБЯЗАТЕЛЬНО:

```
## Constraints
- НЕ трогай: [файлы занятые другим агентом]
- Паттерны: [ссылки на DS, UX Guide если UI/copy fixes]
- При параллельных агентах: [какие файлы "заняты"]

## Verification
- npm test && npm run type-check && npm run lint
- [дополнительные проверки если нужны]
```

### Контекстные скиллы (orchestrator подставляет по типу fixes)

| Триггер | Что добавить в промпт |
|---------|----------------------|
| Fixes затрагивают UI/компоненты | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/frontend-design/SKILL.md и .claude/skills/shadcn-ui/SKILL.md ПЕРЕД исправлением UI.` + `Прочитай .claude/skills/ux-copy-review/SKILL.md для текстов.` + `Сверяй с docs/design/DESIGN-SYSTEM.md (токены, компоненты).` + `Сверяй с Design Document секциями 6a-6c.` |
| Fixes затрагивают BlockNote блоки / slash menu / media upload / read-only flow | `ОБЯЗАТЕЛЬНО прочитай docs/architecture/BLOCKNOTE-DEVELOPMENT.md ПЕРЕД исправлением.` |
| Fixes затрагивают BlockNote / Mantine editor styles | `ОБЯЗАТЕЛЬНО прочитай docs/architecture/BLOCKNOTE-STYLING.md ПЕРЕД исправлением.` |
| Fixes связаны с RAG/AI | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/rag-implementation/SKILL.md ПЕРЕД исправлением.` |

## Вызов агента

```
Task tool:
  subagent_type: "feature-developer"
  prompt: "Фаза FIX для ZN-S<N>-T<ID>.
  Источник: [REVIEW|AUDIT|OPTIMIZATION|TESTING|PR_REVIEW].

  [вставь контекстные скиллы по таблице выше]

  ## Fixes

  ### 1. [SEVERITY]: описание
  Файл: `path/file.ts`, строка ~NN
  **Что сломано:** ...
  **Почему:** ...
  **Как исправить:**
  ```typescript
  // конкретный код
  ```

  ### 2. [SEVERITY]: описание
  ...

  ## Контекст
  - State: docs/sprints/sprint-<N>/states/ZN-S<N>-T<ID>-state.json
  - Design Document: docs/sprints/sprint-<N>/plans/ZN-S<N>-T<ID>-design.md

  ## UI/UX references (если есть UI/copy fixes)
  - Copy: `docs/design/UX-WRITING-GUIDE.md` и Design Document секция 6b
  - DS: `docs/design/DESIGN-SYSTEM.md` — только DS-токены
  - Accessibility: WCAG 2.1 AA
  - Layout: Design Document секция 6a

  ## Constraints
  - НЕ трогай: [список файлов]
  - [другие ограничения]

  ## Verification
  - npm test && npm run type-check && npm run lint"
```

## Параллельные FIX агенты

Когда fixes >10 — разбей на параллельные агенты:

| Группа | Файлы | Что фиксит |
|--------|-------|------------|
| Agent A | service.ts, schema.ts | Backend logic |
| Agent B | route.ts, middleware.ts | API layer |
| Agent C | components/*.tsx | UI/copy |

**Правило:** один файл = один агент. Если два агента должны трогать один файл — sequential, не parallel.

## Self-Regulation (WTF-Likelihood Heuristic)

Предотвращает спираль бесконечных фиксов. Orchestrator отслеживает метрику.

```
WTF-Likelihood:
Start at 0%.
  Each revert:                +15%
  Each fix touching >3 files: +5%
  After 15th fix:             +1% per additional fix
  Touching unrelated files:   +20%

STOP if exceeds 20%.
→ Orchestrator спрашивает пользователя: "WTF-likelihood at N%. Продолжать?"

Hard cap: 30 fixes суммарно на задачу (все FIX-вызовы всех фаз).
```

Запись в state.json:
- `cycles.wtfLikelihood` — текущее значение
- `cycles.totalFixes` — суммарное число фиксов

## После AGENT_REPORT

1. Инкрементируй top-level `cycles.<phase>` (review/audit/optimization/qa) и `cycles.totalFixes`
2. Обнови top-level `cycles.wtfLikelihood` по формуле выше
   (НЕ `reports.<phase>.cycles` — top-level `cycles` объект единственный source of truth для FIX tracking)
3. Если `wtfLikelihood > 20%` или `totalFixes >= 30` → STOP, спроси пользователя
4. **Повтори фазу, которая выдала замечания:**
   - REVIEW (Codex) → повторный Codex review
   - REVIEW (deep-reviewer) → повторный deep-reviewer (не Codex)
   - QUALITY_GATE → findings-arbiter re-verify (targeted проверка FIX NOW items, не full re-audit)
   - TESTING → вызови `/testing-phase` (qa-expert заново)
