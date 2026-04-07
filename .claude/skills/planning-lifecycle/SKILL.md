---
name: planning-lifecycle
description: "Planning Lifecycle: sprint/epic/retro. Триггеры: 'спринт', 'декомпозируй'."
argument-hint: "[действие: sprint/epic/retro]"
---

# Planning Lifecycle

```
BRAINSTORMING → ANALYSIS (опц.) → PLANNING → ARCHITECTURE (если 🔴) → HANDOFF
```

## BRAINSTORMING

Выступай как напарник по планированию, а не интервьюер. Каждый вопрос должен сопровождаться твоими идеями и предложениями — пользователь уточняет и корректирует, а не отвечает с нуля.

**Принципы:**
- **Приходи с предложениями.** Перед вопросом прочитай `product/ROADMAP.md` и `product/PLAN.md`, сформулируй собственную гипотезу о целях и фичах — и предложи её. Пользователь исправляет, дополняет, соглашается.
- **Один вопрос за раз** — не перегружай несколькими вопросами сразу.
- **Предлагай варианты** — для каждого решения 2-3 подхода с trade-offs и своей рекомендацией.
- **YAGNI** — при избыточных идеях явно предлагай исключить "на потом".

**Структура диалога:**
1. Прочитай `product/ROADMAP.md` → предложи цели спринта исходя из текущей фазы
2. Предложи список фич с приоритетами → пользователь правит
3. Укажи зависимости и риски которые видишь → пользователь подтверждает

По итогам диалога держи результат в контексте — файл не сохраняется. Цели, фичи и ограничения вставляются инлайн в промпты ANALYSIS и PLANNING ниже.

## ANALYSIS (опционально)

Если нужен контекст кодовой базы для планирования.

### Подготовка

Orchestrator передаёт результаты brainstorming:

```
Из brainstorming извлеки:
- Цели спринта (что хотим достичь по product/ROADMAP.md Phase N)
- Список фич/задач для анализа
- Ключевые области кода
```

### Вызов

```
Task tool:
  subagent_type: "analyst"
  prompt: "ANALYSIS для спринта N.

  Цели спринта:
  [вставь цели из brainstorming]

  Фичи для анализа:
  [вставь список]

  Для каждой фичи определи:
  1. Какие files/features/ затронуты
  2. Зависимости и impact (Grep/Glob/Read)
  3. Сложность: 🟢/🟡/🔴
  4. Риски

  Читай product/PLAN.md для технического контекста."
```

## PLANNING

### Вызов

```
Task tool:
  subagent_type: "product-manager"
  prompt: "PLANNING для спринта N.

  Цели спринта:
  [вставь цели]

  Фичи и приоритеты:
  [вставь список из brainstorming]

  Результаты анализа:
  [сложность, риски, затронутые модули]

  Создай задачи в формате JTBD с TDD планом.
  Персоны: product/PRODUCT.md
  Роадмап: product/ROADMAP.md"
```

**product-manager создаёт:**
- `docs/sprints/sprint-<N>/tasks.md`
- `docs/sprints/sprint-<N>/quality-metrics.md`
- `docs/sprints/sprint-<N>/states/`

## ARCHITECTURE (для 🔴 задач)

```
Task tool:
  subagent_type: "architect"
  prompt: "Создай ADD для задачи ZN-S<N>-T<ID>: [название задачи].

  Сложность: 🔴

  Контекст задачи:
  [описание из tasks.md]

  Результаты анализа:
  [затронутые файлы и зависимости от analyst]

  Сохрани ADD в docs/ADRs/ADD-<slug>.md"
```

## RETROSPECTIVE

### Вызов

```
Task tool:
  subagent_type: "product-manager"
  prompt: "RETROSPECTIVE для спринта N.

  Задачи спринта:
  [список из tasks.md с финальными статусами]

  Метрики:
  [для каждой задачи: review cycles, audit verdicts, blocking issues, FIX count]

  Уроки (из state.json):
  [lessons из всех state файлов]

  Создай отчёт: что хорошо, что плохо, что улучшить."
```
