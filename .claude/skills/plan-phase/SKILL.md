---
name: plan-phase
description: "PLAN phase: RESEARCH → /product-review → /brainstorming → /tech-review → /devils-advocate → Design Document → Codex review. ВСЕ шаги обязательны."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# PLAN Phase

> ⚠️ **ВСЕ 8 шагов обязательны для ЛЮБОЙ задачи** (🟢, 🟡, 🔴).
> Пропуск product-review, brainstorming, tech-review или devils-advocate **недопустим** — они формируют scope, error map, test plan и adversarial challenge для downstream фаз.
> PLAN фаза — это диалог с пользователем. Не экономь на ней.

## Шаг 1: RESEARCH — ОБЯЗАТЕЛЬНО

**ПЕРЕД входом в plan mode. Исследование кодовой базы — первый шаг.**

> ⚠️ **GRAPH-FIRST: используй code-review-graph MCP tools ДО любого Grep/Glob/Read.**
> Граф экономит токены (структурный контекст вместо raw file reads) и даёт связи (callers, imports, tests) которые Grep не видит.
> **Grep/Glob/Read — только fallback**, когда граф не покрывает нужное (напр. содержимое конфиг-файлов, CSS, текст ошибок).

Auto-memory Claude Code загружается автоматически — уроки по области задачи доступны в контексте.

### code-review-graph MCP

**Прочитай перед использованием:** `.claude/guides/code-review-graph-usage.md` (правила запросов, fallback, gotchas).

Для RESEARCH выполни все три шага:
```
# 1. Поиск — короткий идентификатор (CamelCase или kebab), не фраза:
mcp__code-review-graph__semantic_search_nodes_tool(query="ИмяКласса", kind="Function")
mcp__code-review-graph__semantic_search_nodes_tool(query="имя-файла", kind="File")

# 2. Зависимости найденных файлов:
mcp__code-review-graph__query_graph_tool(pattern="importers_of", target="src/features/module/file.ts")
mcp__code-review-graph__query_graph_tool(pattern="tests_for", target="ИмяФункции")

# 3. Blast radius:
mcp__code-review-graph__get_impact_radius_tool(changed_files=["src/features/module/file.ts"])
```

### Fallback: Grep/Glob/Read

Только после 3+ graph queries с разными терминами, только для конфигов, CSS, JSON/YAML/MD.

## Шаг 2: Product Review — ОБЯЗАТЕЛЬНО

После RESEARCH вызови skill `/product-review`.

Определяет: правильную ли проблему решаем, mode (EXPANSION/HOLD/REDUCTION), scope direction,
complexity (🟢/🟡/🔴), NOT in scope. Для UI-задач — design pre-check.

## Шаг 3: Brainstorming — ОБЯЗАТЕЛЬНО

После product-review вызови skill `/brainstorming`.

Конкретизирует requirements, user flows, scope details в рамках direction из product-review.

## Шаг 4: Tech Review — ОБЯЗАТЕЛЬНО

После brainstorming вызови skill `/tech-review`.

Превращает scope в buildable plan: architecture, Error & Rescue Map, Failure Modes Registry,
Test Diagram, Test Plan Artifact, performance preview. Результаты передаются downstream
в IMPL, AUDIT и QA.

## Шаг 5: Devil's Advocate — ОБЯЗАТЕЛЬНО

После tech-review вызови skill `/devils-advocate`.

Челленджит план через pre-mortem, инверсию, Сократ. Проверяет AI blind spots (happy path bias,
scope acceptance, over-abstraction) и engineering blind spots (security, multi-tenancy, failure modes).

**Input для devils-advocate:**
- Результаты product-review (mode, scope, premise challenge)
- Результаты brainstorming (requirements, user flows)
- Результаты tech-review (architecture, Error Map, Failure Modes)
- Codebase research (затронутые файлы, зависимости)

**Verdict → действие:**
- **Ship it** → переходим к Design Document (шаг 6)
- **Ship with changes** → автоправка плана по findings, затем Design Document
- **Rethink this** → блокер: AskUserQuestion с описанием фундаментальной проблемы

## Шаг 6: Design Document (черновик — ДО EnterPlanMode)

> ⚠️ **EnterPlanMode вызывается ТОЛЬКО в Шаге 8** — после Codex review.
> Сейчас создаём черновик для внутреннего ревью, пользователь увидит уже проверенную версию.

Начинай работу над Design Document с:
- результатом codebase research
- результатом memory tools
- результатом `/product-review`
- результатом `/brainstorming`
- результатом `/tech-review`
- результатом `/devils-advocate` (findings учтены в плане)

Создай **подробный Design Document** (черновик, сохрани локально в памяти или во временный файл).

### Требования к Design Document

**Критерий качества:** документ должен быть настолько детальным, что любой разработчик (включая джуна) сможет реализовать задачу, не задавая вопросов. Каждый шаг — конкретный, actionable, с примерами кода там где нужно.

### Формат Design Document

```markdown
# Design Document: ZN-S<N>-T<ID> — [Название задачи]

**Статус:** Draft → Approved
**Дата:** YYYY-MM-DD
**Сложность:** 🟢/🟡/🔴

---

## 1. Контекст и цель

[Зачем это делается? Какую проблему решает? Ссылка на задачу в tasks.md]

---

## 2. Product Direction (от /product-review)

[Premise Challenge, Mode, Scope IN/NOT IN, Persona & CJM, Dream State Delta, Сложность]

---

## 3. Codebase Research (из code-review-graph)

### Затронутые файлы
[результат semantic_search_nodes — файлы и функции по ключевым словам задачи]

### Зависимости
[результат query_graph — callers_of, imports_of, importers_of, tests_for]

### Blast radius
[результат get_impact_radius — какие файлы/функции затронет изменение]

### Сложность
[hotspots — из find_large_functions или architecture_overview]

---

## 4. Архитектурное решение

### Подход
[Описание выбранного подхода. Если рассматривались альтернативы — объясни почему выбран этот.]

### Изменения в данных (Prisma)
[Если есть — schema changes, новые модели, обязательно с organizationId]

```prisma
model Example {
  id             String   @id @default(cuid())
  organizationId String
  ...
}
```

### API контракт (tRPC)
[Если есть — новые/измененные процедуры с Zod schemas]

```typescript
// router: src/features/<domain>/router.ts
export const exampleRouter = router({
  create: protectedProcedure
    .input(z.object({ ... }))
    .mutation(async ({ ctx, input }) => { ... }),
});
```

---

## 5. Пошаговая реализация

Каждый шаг — конкретное действие. Выполняй строго по порядку.

### Шаг 1: [Название]
**Файл:** `src/features/<domain>/...`
**Действие:** [что именно создать/изменить]
```typescript
// пример кода если нужен
```

### Шаг 2: [Название]
...

### Шаг N: Запустить проверки
```bash
npm test
npm run type-check
npm run lint
```

---

## 6. Technical Analysis (от /tech-review)

[Scope Challenge, Architecture, Error & Rescue Map, Failure Modes Registry, Test Diagram,
Test Plan Artifact, Code Quality Notes, Performance Notes, Completion Summary]

---

## 7. Тест-план (TDD, обогащён Test Plan Artifact из tech-review)

### Unit тесты
| Тест | Файл | Что проверяет |
|------|------|---------------|
| ... | `src/features/.../__.test.ts` | ... |

### Integration тесты
[Если нужны]

### E2E тесты
[Если нужны — user flow]

**Coverage target:** ≥ 80%

---

## 8. UI/UX Design (для UI-задач)

> Пропустить если задача не затрагивает UI.
> **Перед заполнением** прочитай:
> - `docs/design/DESIGN-SYSTEM.md` — токены, компоненты, layout
> - `docs/design/UX-WRITING-GUIDE.md` — тон, формулы текстов, глоссарий

### 6a. Дизайн-направление
- Прочитай `docs/design/DESIGN-SYSTEM.md` — компоненты, токены, layout (секции 10-12, 16)
- Используй skill `/frontend-design` для определения визуального направления: тон, композиция, акценты
- Зафиксируй выбранные DS-компоненты и токены

### 6b. UX-тексты и копирайтинг — skill `/ux-copy-review`
- Определи режим тона: system UI / onboarding / published / AI / enterprise
- Специфицируй тексты:
  - Заголовки: [тексты]
  - Кнопки/CTA: [тексты]
  - Ошибки: [по формуле: что случилось + что делать]
  - Empty states: [icon + heading + description + CTA]
  - Tooltips: [≤80 символов]
  - AI-сообщения: [если применимо]

### 6c. Customer Journey
- Прочитай `product/CJM.md` — на каком этапе пути пользователя этот экран?
- Учти боли и эмоции персоны (Марина P0 / Алексей P1)

### 6d. Information Architecture & Interaction Design (для задач с layout)
- **Приоритизация контента:** что primary (видно сразу, крупно) / secondary (видно, но меньше) / tertiary (по запросу)? Для каждого элемента — обоснование
- **Группировка:** какие данные вместе (по ментальной модели пользователя, не по API-структуре)? Что рядом = связано (Gestalt proximity)
- **Interaction cost:** сколько кликов/шагов до основного действия? Цель: ≤2 для primary task. Описать primary user flow: [открыл страницу] → [клик] → [результат]
- **Progressive disclosure:**
  - Tier 1 (всегда видно, 0 кликов): [что]
  - Tier 2 (1 клик — expand/tooltip/drawer): [что]
  - Tier 3 (навигация на другую страницу): [что]
- **Сканирование:** F-pattern (текст, таблицы, settings) или Z-pattern (карточки, landing)? Самое важное — top-left

> **Downstream:** ux-expert при QUALITY_GATE проверяет соответствие реализации секциям 6a-6d.

---

## 9. Sprint Contract (что считается DONE)

### Hard Success Criteria (binary — pass or fail)
- [ ] Criterion 1: [конкретный testable outcome]
- [ ] Criterion 2: [конкретный testable outcome]
- [ ] ...

### Kill Criteria (когда пивотить)
- Если [условие] → отказаться от подхода X и перейти к Y

### Scope Boundary (что explicitly NOT included)
- НЕ: [список]

> **Downstream use:** feature-developer читает contract → definition of done.
> qa-expert тестирует ИМЕННО эти критерии. Orchestrator оценивает QA по contract.

---

## 10. Expert Considerations

### Security
- Multi-tenancy: organizationId присутствует на всех Prisma queries?
- Input validation: Zod на всех tRPC inputs?
- [Другие security соображения]

### Performance
- N+1 в Prisma queries?
- Redis caching нужен?
- Что произойдёт при 10,000 документах?

### UX / Simplicity
- Loading/error/offline states описаны?
- Module boundaries соблюдены?
- Код понятен без комментариев?

---

## 11. Риски и mitigation

| Риск | Вероятность | Mitigation |
|------|-------------|-----------|
| ... | High/Med/Low | ... |

---

## 12. Codex Review

- **Verdict:** APPROVED / NEEDS_REVISION
- **Iterations:** [число]
- **Принятые предложения:** [что внедрено в документ]
- **Отклонённые (с обоснованием):** [что отложено и почему]
```

---

## Шаг 7: Codex Review черновика плана

> Это внутренний quality gate — до показа пользователю. Цель: найти дыры пока дёшево.

```
codex(
  prompt="Оцени Design Document для ZN-S<N>-T<ID>.

## Design Document
[полное содержимое документа]

## Контекст
Это план реализации фичи. Reviewer — adversarial. Ищи пробелы, а не подтверждай качество.
Если документ достаточно детален и нет критичных пробелов — APPROVED.

## Чек-лист проверки

**Реализуемость (главное):**
- Может ли джун реализовать каждый шаг без вопросов?
- Есть ли ambiguity или пропущенные шаги между step N и step N+1?
- Где нужны примеры кода, но их нет?

**Система и безопасность:**
- organizationId на всех Prisma queries (multi-tenancy)?
- Zod валидация на всех tRPC inputs?
- Edge cases покрыты в тест-плане (null, пустые строки, concurrent requests)?
- N+1 queries, memory leaks?

**Полнота:**
- Sprint Contract (секция 9): success criteria testable и конкретны?
- Error & Rescue Map присутствует?
- Module boundaries соблюдены (features/ не импортируют из features/ напрямую)?

Верни JSON:
{
  \"verdict\": \"APPROVED\" | \"NEEDS_REVISION\",
  \"concerns\": [
    { \"id\": 1, \"severity\": \"CRITICAL|MAJOR|MINOR\", \"section\": \"секция документа\", \"text\": \"...\", \"suggestion\": \"...\" }
  ]
}",
  approval-policy="never",
  sandbox="read-only"
)
```

**Если NEEDS_REVISION** → доработай документ → `codex-reply`. Max 3 итерации.
**CRITICAL concerns** → обязательно устранить до APPROVED.
**MINOR** → можно принять с обоснованием.

---

## Шаг 8: EnterPlanMode → показ пользователю → ExitPlanMode

**Только после Codex APPROVED** (или после устранения CRITICAL concerns):

1. **EnterPlanMode**
2. Покажи пользователю **финальный Design Document** (уже прошедший Codex review)
3. В секции 12 документа зафиксируй результат Codex review:
   - Verdict, итерации, принятые/отклонённые предложения
4. **ExitPlanMode** → пользователь одобряет

5. **Сохрани Design Document:**
   ```
   docs/sprints/sprint-<N>/plans/ZN-S<N>-T<ID>-design.md
   ```

6. **Роутинг:** 🔴 → ARCHITECTURE, иначе → IMPLEMENTATION

---

## State.json Updates

Записать в `reports.plan`:
- `complexity`: 🟢/🟡/🔴
- `designDocument`: путь `docs/sprints/sprint-<N>/plans/ZN-S<N>-T<ID>-design.md`
- `scope`: затронутые файлы/модули
- `approvedAt`: timestamp
- `productReview`: { mode, premiseChallenge, dreamStateDelta, notInScope, complexity } — от /product-review
- `techReview`: { scopeChallenge, errorMap, failureModes, testDiagram, testPlanArtifact, criticalGaps, completionSummary } — от /tech-review
- `devilsAdvocate`: { verdict, concerns: [{ concern, severity, framework, action }], changesApplied } — от /devils-advocate
