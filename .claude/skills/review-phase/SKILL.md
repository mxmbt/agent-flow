---
name: review-phase
description: "REVIEW phase: Codex MCP → deep-reviewer → Deliberative Review с triage, negotiation и FIX cycles → APPROVED."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# REVIEW Phase (Deliberative Review)

## Обзор

Двухэтапное ревью с **negotiation protocol** — оркестратор триажит findings, дискутирует с ревьюером через `codex-reply`, фиксит только принятые замечания, верифицирует точечно.

1. **Codex MCP** — стандартные проблемы (max 3 цикла)
2. **deep-reviewer** — deep review: race conditions, бизнес-логика, multi-tenancy, module boundaries (max 3 цикла)

**Антипаттерн:** слепое исправление всех findings → re-review → новые findings → бесконечный цикл.
**Правильно:** triage → negotiate → fix accepted → targeted verify.

---

## Этап 1: Codex Review

### 0. Собери diff от diffBase

```bash
DIFF_BASE=$(читай из state.json → reports.implementation.diffBase)
git diff $DIFF_BASE...HEAD --name-only   # Список файлов
git diff $DIFF_BASE...HEAD               # Содержимое изменений
```

### 1. Первый вызов Codex

Codex использует встроенную инструкцию ревью — **не перебивай её кастомным форматом**.
Передай только контекст задачи + project-specific правила как дополнительные guidelines.

```
codex(
  prompt="Code review для задачи ZN-S<N>-T<ID>: [название]

## Контекст задачи
[описание из state.json]

## Измененные файлы
[список файлов]

## Diff
[git diff]

## Project-specific guidelines (дополняют стандартные)

- Multi-tenancy: каждый Prisma query ОБЯЗАН содержать фильтр по `organizationId` — отсутствие = P0
- Zod валидация: все tRPC inputs обязаны иметь Zod схему — отсутствие = P1
- `console.log` в production коде запрещён
- Hardcoded секреты/credentials запрещены
- Module boundaries: `features/X` не может импортировать напрямую из `features/Y` — только через tRPC или props",
  approval-policy="never",
  sandbox="read-only"
)
```

**Сохрани `threadId`** из ответа — он нужен для `codex-reply`.

### 2. TRIAGE — оркестратор классифицирует findings

Для каждого finding определи disposition:

| Критерий | Disposition | Действие |
|----------|------------|----------|
| P0/P1 + confidence ≥ 0.7 + реальный bug/security | **ACCEPT** | Пойдёт в FIX |
| P0/P1 + confidence < 0.7 или спорный контекст | **CHALLENGE** | Дискуссия через codex-reply |
| P2 + confidence ≥ 0.8 + конкретный fix | **ACCEPT** | Пойдёт в FIX |
| P2 + confidence < 0.8 или субъективный | **CHALLENGE** | Дискуссия через codex-reply |
| P3, стиль, теоретическое, YAGNI | **REJECT** | Обосновать через codex-reply |
| Дубликат линтера/TypeScript | **REJECT** | Уже покрыто toolchain |

**Принцип:** оркестратор — не секретарь, а **senior engineer**. Он оценивает findings критически, учитывая контекст задачи и кодовой базы.

### 3. NEGOTIATE — дискуссия через codex-reply

Используй `codex-reply` с сохранённым `threadId`:

```
codex-reply(
  threadId="<saved threadId>",
  prompt="Спасибо за ревью. Вот мои решения по findings:

## ACCEPT (пойдут в FIX)
- #1 (P0, organizationId missing): согласен, критично
- #4 (P1, Zod validation): согласен, исправим

## CHALLENGE (прошу аргументировать)
- #2 (P1, race condition в register): Мы используем unique constraint в БД как guard — duplicate insert вернёт ошибку, не data corruption. Это достаточная защита?
- #5 (P2, error handling): Ошибка пробрасывается через tRPC error boundary — зачем дополнительный catch?

## REJECT (не будем фиксить)
- #3 (P3, naming): стилистика, покрыта линтером
- #7 (P3, теоретический edge case): confidence 0.4, нет реального attack vector
- #8 (P3, 'consider using X'): YAGNI, текущее решение работает

Прошу подтвердить REJECT и аргументировать по CHALLENGE items."
)
```

### 4. Обработка ответа Codex на negotiation

Codex может:
- **Согласиться с REJECT** → confirmed REJECT, не фиксим
- **Настоять на CHALLENGE item** с аргументом → оцени аргумент:
  - Аргумент убедительный (конкретный attack vector, реальный сценарий) → **ACCEPT**
  - Аргумент теоретический / повторяет то же самое → **REJECT** (финальное решение оркестратора)
- **Настоять на REJECT item** → ещё один раунд ТОЛЬКО если P0/P1. P2+ → финальный REJECT

**Правило одного раунда:** на каждый finding максимум 1 раунд challenge. После ответа Codex — финальное решение оркестратора. Бесконечные дебаты запрещены.

### 5. FIX — только ACCEPTED findings

Записать disposition в state.json → `reports.review.codexTriage`:
```json
{
  "accepted": [{ "id": 1, "summary": "..." }, { "id": 4, "summary": "..." }],
  "rejected": [{ "id": 3, "reason": "style/linter" }, { "id": 7, "reason": "theoretical, low confidence" }],
  "challengeResolved": [{ "id": 2, "resolution": "ACCEPT", "reason": "убедительный attack vector" }]
}
```

Вызови `/fix-phase` ТОЛЬКО с ACCEPTED findings. Формат ТЗ — по стандарту fix-phase.

### 6. TARGETED VERIFY — через codex-reply (НЕ новая сессия)

После FIX — верификация в том же треде:

```
codex-reply(
  threadId="<same threadId>",
  prompt="Исправления внесены. Проверь ТОЛЬКО следующие фиксы:

## Исправленные findings
- #1: добавлен organizationId filter в [файл:строка]
- #2: добавлен mutex lock в register flow
- #4: добавлена Zod schema для input

## Обновлённый diff (только изменённые файлы)
[git diff для конкретных файлов]

## Важно
Проверяй ТОЛЬКО перечисленные фиксы. Новые findings вне scope этих исправлений — не нужны."
)
```

### 7. Обработка verify response

- **Все фиксы ОК** → Codex APPROVED → перейти к Этапу 2
- **Фикс сломал что-то** → новый цикл (increment `cycles.review`), но ТОЛЬКО для сломанного фикса
- **Codex нашёл новые issues вне scope** → TRIAGE заново (шаг 2), но с повышенным порогом:
  - Цикл 2: только P0/P1 принимаются, P2+ → DEFER
  - Цикл 3: только P0 принимаются, P1+ → DEFER

### 8. Hard cap: 3 цикла для Codex

После 3 цикла:
- Все оставшиеся P0 → FIX (обязательно)
- Все P1+ → DEFER в sprint tasks или ROADMAP
- Перейти к Этапу 2 в любом случае

---

## Этап 2: Deep Review (Opus)

```
Task tool:
  subagent_type: "deep-reviewer"
  model: "opus"
  prompt: "Deep code review для ZN-S<N>-T<ID>.
  Задача: [task.title]

  Diff от diffBase:
  [git diff $DIFF_BASE...HEAD]

  Design Document:
  docs/sprints/sprint-<N>/plans/ZN-S<N>-T<ID>-design.md"
```

### Deep Review TRIAGE (оркестратор)

Те же принципы что и для Codex — оркестратор триажит findings:

- **CRITICAL** + конкретный сценарий → ACCEPT → FIX
- **CRITICAL** + теоретический → CHALLENGE (запросить attack vector у deep-reviewer через повторный вызов)
- **MAJOR** + конкретный → ACCEPT → FIX
- **MAJOR** + субъективный / YAGNI → REJECT с обоснованием

Для challenge deep-reviewer: вызвать его повторно с targeted prompt:

```
"По finding #2 (race condition в X): объясни конкретный сценарий воспроизведения.
Текущая защита: [описание]. Почему её недостаточно?"
```

### Deep Review FIX цикл

- `verdict: "APPROVED"` → перейти к QUALITY_GATE
- `verdict: "NEEDS_CHANGES"` → TRIAGE → FIX только ACCEPTED → повторный deep-reviewer (targeted)
- Инкрементируй `cycles.review` в state.json

### Hard cap: 3 цикла для Deep Review

После 3 цикла:
- CRITICAL → FIX (обязательно)
- MAJOR → DEFER
- Перейти к QUALITY_GATE в любом случае

---

## Diminishing Returns Rule

| Цикл | Codex: что фиксим | Deep-reviewer: что фиксим |
|------|--------------------|---------------------------|
| 1 | P0 + P1 + P2 (confident) | CRITICAL + MAJOR (конкретные) |
| 2 | Только P0 + P1 | Только CRITICAL + MAJOR (с конкретным attack vector) |
| 3 | Только P0 | Только CRITICAL |

Всё остальное → DEFER. Маршруты по приоритету:
1. **Sprint tasks** — finding связан с текущим модулем, можно сделать в рамках спринта → `docs/sprints/sprint-<N>/tasks.md`
2. **ROADMAP секция** — finding относится к конкретной области roadmap → `product/ROADMAP.md` в соответствующую секцию
3. **ROADMAP Tech Debt** — не подходит ни к спринту, ни к milestone → `product/ROADMAP.md` → секция `Tech Debt / Улучшения (backlog)`

---

## State.json Updates

Записать в `reports.review`:
- `verdict`: финальный (APPROVED только когда оба этапа APPROVED или hard cap reached)
- `codexIssues`: все issues из Codex (raw)
- `codexTriage`: disposition по каждому finding (accepted/rejected/challenged)
- `codexThreadId`: threadId для аудита
- `deepReviewIssues`: issues из deep-reviewer
- `deepReviewTriage`: disposition по каждому finding
- `deferred`: findings отложенные по diminishing returns rule
- `cycles`: количество итераций (суммарно)

---

## Чеклист оркестратора

- [ ] threadId сохранён после первого вызова Codex
- [ ] Каждый finding имеет disposition (ACCEPT/REJECT/CHALLENGE)
- [ ] REJECT содержит обоснование (не просто "не согласен")
- [ ] FIX отправлен только с ACCEPTED findings
- [ ] Verify через codex-reply (не новая сессия)
- [ ] Verify просит проверить ТОЛЬКО фиксы (не full re-review)
- [ ] Hard cap соблюдён (3 Codex, 2 deep-reviewer)
- [ ] Deferred items записаны в sprint tasks / ROADMAP
