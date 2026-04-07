# agent-flow

Система оркестрации AI-агентов для Claude Code. Полный development lifecycle от задачи до деплоя через специализированных агентов.

> Извлечено из production-репозитория [ZNAI](https://github.com/mxmbt/znai) — платформы документации с AI-ассистентом. Адаптируй под свой стек.

---

## Концепция

Один оркестратор (`CLAUDE.md`) управляет армией специализированных агентов. Каждый агент — эксперт в своей области с жёстко ограниченным scope. Агенты не общаются напрямую — только через оркестратор.

```
Пользователь → Оркестратор → Агенты → AGENT_REPORT → Оркестратор → следующая фаза
```

**Ключевые принципы:**
- **Code Ownership** — оркестратор никогда не пишет код. Даже однострочный фикс — через агента
- **AGENT_REPORT** — стандартизированный двухуровневый ответ агента (compact для оркестратора + handoff файл с деталями)
- **State.json** — персистентное состояние задачи. Пользователь читает его чтобы понять что происходит
- **Autonomous execution** — после утверждения плана оркестратор работает без вопросов до DELIVERY

---

## Development Lifecycle

```
PLAN → [ARCH если 🔴] → IMPL → SIMPLIFY → REVIEW ↔ FIX → QUALITY_GATE ↔ FIX → QA ↔ FIX → DELIVERY
```

### Маршрутизация по триггеру

| Что говорит пользователь | Что запускается |
|--------------------------|-----------------|
| "начни спринт", "декомпозируй эпик", "ретроспектива" | Planning lifecycle |
| "добавь задачу", "новая задача" | Brainstorming → product-manager |
| ID задачи, "сделай", "реализуй", "рефакторинг" | Development lifecycle |
| "исправь баг", "fix", "не работает" | Bugfix flow |

### Сложность задачи

| Уровень | Architect? | Примеры |
|---------|-----------|---------|
| 🟢 ПРОСТАЯ | Нет | UI компоненты, стили, мелкие багфиксы |
| 🟡 СРЕДНЯЯ | Нет | API роутер, service метод, рефакторинг |
| 🔴 СЛОЖНАЯ | ДА (ADD) | Новые таблицы БД, auth/permissions, внешние интеграции, RAG pipeline |

---

## Агенты

### Оркестратор

**`CLAUDE.md`** — центральный оркестратор. Это не отдельный агент, а системный промпт главной сессии. Единственный кто:
- Вызывает агентов через Task tool
- Читает AGENT_REPORT и принимает решения
- Задаёт вопросы пользователю (AskUserQuestion)
- Пишет в state.json и handoff файлы

### Специализированные агенты

#### PLAN фаза
| Агент | Роль | Модель |
|-------|------|--------|
| **`product-manager`** | Декомпозиция задач, sprint planning, ретроспективы | sonnet |
| **`analyst`** | DISCOVERY: читает кодовую базу, строит карту зависимостей для задачи | sonnet |
| **`architect`** | Проектирует архитектуру для 🔴 задач. Создаёт ADD и ADR | opus |

#### IMPLEMENTATION фаза
| Агент | Роль | Модель |
|-------|------|--------|
| **`feature-developer`** | 10x Engineer. TDD, Clean Code, production-ready с первого раза. IMPL + FIX + BUGFIX | sonnet |
| **`code-simplifier`** | SIMPLIFY фаза: упрощает код без изменения поведения | sonnet |

#### REVIEW фаза
| Агент | Роль | Модель |
|-------|------|--------|
| **`deep-reviewer`** | Principal-level review: race conditions, business logic edge cases, multi-tenancy, архитектурные нарушения | opus |

#### QUALITY_GATE фаза (параллельно)
| Агент | Роль | Модель |
|-------|------|--------|
| **`paranoid-architect`** | Security expert: уязвимости, attack vectors, data isolation | sonnet |
| **`performance-expert`** | Производительность: N+1, slow queries, memory leaks | sonnet |
| **`ux-expert`** | UX/Accessibility: design quality → UX copy → WCAG | sonnet |
| **`findings-arbiter`** | Тriage findings от трёх агентов выше. FIX NOW / DEFER / SKIP с аргументацией и ТЗ | opus |

#### QA + DELIVERY фазы
| Агент | Роль | Модель |
|-------|------|--------|
| **`qa-expert`** | E2E тестирование через браузер (OpenBrowser MCP) и curl. Self-contained: сам запускает сервер | sonnet |
| **`delivery-agent`** | Git commit, PR, документация, cleanup. Финальная фаза | sonnet |

---

## Lifecycle в деталях

### PLAN
```
auto-memory recall
→ code-review-graph research
→ /product-review (scope, CJM, риски)
→ /brainstorming (варианты решения)
→ /tech-review (архитектура, failure modes)
→ /devils-advocate (adversarial challenge)
→ Design Document draft
→ Codex review
→ EnterPlanMode (пользователь утверждает)
```
После утверждения плана — полностью автономное выполнение.

### IMPLEMENTATION
`feature-developer` работает по TDD:
```
🔴 RED   → написать failing test
🟢 GREEN → минимальный код чтобы тест прошёл
🔄 REFACTOR → улучшить без изменения поведения
```
Перед AGENT_REPORT — quality gates: structure scan + security scan + `npm test && type-check && lint`.

### REVIEW (Deliberative Protocol)
Оркестратор не просто пересылает findings — он тоже **senior engineer**:
```
Codex review → TRIAGE (classify) → NEGOTIATE (codex-reply в том же треде) → FIX (только ACCEPTED) → TARGETED VERIFY
```
Diminishing returns: цикл 2 = только P0/P1, цикл 3 = только P0. Hard cap: 3 цикла.

### QUALITY_GATE
Три агента запускаются параллельно, `findings-arbiter` принимает решения:
- **FIX NOW** → конкретное ТЗ → `feature-developer` → arbiter re-verify
- **DEFER** → sprint tasks / ROADMAP / Tech Debt backlog
- **SKIP** → с обоснованием (YAGNI/KISS фильтр)

### FIX Cycles

| Источник | Max циклов |
|----------|------------|
| REVIEW (Codex) | 3 |
| REVIEW (deep-reviewer) | 3 |
| QA | 3, потом BLOCKED |

Hard cap: 30 fixes на задачу.

---

## AGENT_REPORT

Стандартный формат ответа каждого агента. Двухуровневый:

**Уровень 1 (compact) — для оркестратора:**
```json
{
  "verdict": "APPROVED | NEEDS_CHANGES | BLOCKED",
  "score": 8,
  "findings": [
    { "severity": "MAJOR", "file": "src/features/auth/service.ts", "description": "..." }
  ],
  "selfCritique": "что мог упустить",
  "handoffFile": "docs/sprints/sprint-N/handoffs/taskId/phase-detail.md",
  "lessons": ["контекстные наблюдения для этой задачи"],
  "memoryLessons": ["уроки достойные постоянной памяти"]
}
```

**Уровень 2 (detail) — handoff файл:** полные snippets, how-to-fix, reasoning.

`memoryLessons` — оркестратор сохраняет в Claude Code auto-memory. Накапливаются между сессиями.

---

## Pre-Submit Self-Critique

Каждый агент перед финализацией AGENT_REPORT обязан проверить себя в adversary mode:
- `feature-developer`: "что бы hostile reviewer нашёл?" → исправляет сам
- `deep-reviewer`: "это реальная проблема или теоретическая?"
- `findings-arbiter`: "я слишком мягкий? слишком строгий? ТЗ достаточно конкретное?"

---

## GAN Protocol

Когда два варианта одинаково valid — adversarial decision making:
- Агент-защитник аргументирует вариант A
- Агент-атакующий находит слабые места
- Синтез → лучшее решение

Подробности: `.claude/guides/gan-protocol.md`

---

## Структура репозитория

```
.claude/
  CLAUDE.md                    # Центральный оркестратор — главный системный промпт
  settings.json                # Хуки: auto-update графа при Edit/Write, pre-commit checks

  agents/                      # Системные промпты для специализированных агентов
    feature-developer.md       # 10x engineer: IMPL + FIX + BUGFIX
    deep-reviewer.md           # Principal-level code review
    findings-arbiter.md        # Triage findings: FIX NOW / DEFER / SKIP
    paranoid-architect.md      # Security expert
    performance-expert.md      # Performance expert
    ux-expert.md               # UX/Accessibility expert
    qa-expert.md               # E2E тестирование
    delivery-agent.md          # Git, PR, документация
    architect.md               # Архитектура для сложных задач (ADD/ADR)
    product-manager.md         # Sprint planning, декомпозиция
    analyst.md                 # Исследование кодовой базы
    code-simplifier.md         # Упрощение кода без изменения поведения

  skills/                      # Расширенные промпты для фаз (читаются через Read tool)
    plan-phase/                # PLAN: полный флоу с sub-skills
    implementation-phase/      # IMPL: TDD workflow, quality gates
    review-phase/              # REVIEW: deliberative protocol, checklist
    simplify-phase/            # SIMPLIFY: manual checklist
    fix-phase/                 # FIX: targeted fixes по findings
    quality-gate-phase/        # QUALITY_GATE: параллельный аудит
    testing-phase/             # QA: E2E, browser, API
    delivery-phase/            # DELIVERY: commit, PR, docs
    bugfix-flow/               # Bugfix: systematic debugging
    devils-advocate/           # Adversarial challenge плана
    tech-review/               # Технический ревью архитектуры
    product-review/            # Product scope review
    design-audit/              # UI: 80-item checklist
    frontend-design/           # Frontend: anti-AI-slop design
    ...и другие

  guides/                      # Референсные гайды (читаются агентами по триггеру)
    test-driven-development.md # Iron Law TDD: RED → GREEN → REFACTOR
    systematic-debugging.md    # Reproduce → Isolate → Hypothesize → Fix
    verification-before-completion.md  # Evidence-based completion
    worktree-workflow.md       # Git worktrees для параллельных задач
    gan-protocol.md            # Adversarial decision making
    code-review-graph-usage.md # Graph-first codebase navigation
```

---

## Адаптация под свой проект

### 1. Скопируй `.claude/` в корень своего репозитория

### 2. Обнови `CLAUDE.md`
Замени ZNAI-специфичные части:
- Пути к `state.json` (шаблон: `docs/sprints/sprint-<N>/states/`)
- Стек (Next.js/tRPC/Prisma → твой стек)
- Multi-tenancy правила (если не нужны — убери)
- Ссылки на design system документы

### 3. Обнови агентов
В `feature-developer.md` замени:
- Tech-specific правила (organizationId, Zod, tRPC) → твои правила
- Ссылки на architecture docs → твои docs
- Команды проверки (`npm test && npm run type-check && npm run lint`) → твои команды

### 4. Настрой `settings.json`
Хуки завязаны на `code-review-graph` MCP — замени на свой инструмент или убери.

### 5. Адаптируй skills
`plan-phase/SKILL.md` содержит ZNAI-специфичный флоу. Адаптируй шаги под свой planning процесс.

---

## Требования

- [Claude Code](https://claude.ai/code) с поддержкой subagents (Task tool)
- Модели: Sonnet для большинства агентов, Opus для `architect`, `deep-reviewer`, `findings-arbiter`
- Опционально: [code-review-graph](https://github.com/mxmbt/znai) MCP для graph-first навигации по кодовой базе

---

## Связанное

- [mxmbt/znai](https://github.com/mxmbt/znai) — исходный репозиторий, откуда извлечена система
