---
name: testing-phase
description: "QA phase: qa-expert, browser + curl тесты."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# QA Phase

## Когда вызывать

**Стандартная фаза** — вызывается ВСЕГДА после QUALITY_GATE, кроме:
- Изменения только в docs/, .claude/, .codex/ (указать `reason` в state.json при skip, установить `phases.qa.status = "skipped"`)

## Подготовка (минимальная — агент делает pre-work сам)

Orchestrator извлекает из state.json:

```
- task.title — название задачи
- reports.plan.scope — что реализовано
- reports.implementation.filesCreated — новые файлы
- reports.implementation.filesModified — измененные файлы
- reports.implementation.diffBase — для diff-aware scoping
- reports.qualityGate — ключевые findings (если были)
```

### Контекстные скиллы (orchestrator подставляет ВСЕ релевантные по типу задачи)

| Триггер | Что добавить в промпт |
|---------|----------------------|
| UI задача (ВСЕГДА для UI) | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/webapp-testing/SKILL.md — Reconnaissance-Then-Action паттерн.` |
| UI задача (ВСЕГДА для UI) | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/e2e-testing/SKILL.md — user flows, assertions, multi-step.` |
| UI задача (ВСЕГДА для UI) | `ОБЯЗАТЕЛЬНО прочитай .claude/skills/accessibility-audit/SKILL.md — WCAG 2.1 чеклист.` |
| ВСЕГДА | `ОБЯЗАТЕЛЬНО прочитай .claude/guides/verification-before-completion.md — evidence-based verification перед вердиктом.` |

## Вызов агента

```
Task tool:
  subagent_type: "qa-expert"
  prompt: "Фаза QA для ZN-S<N>-T<ID>.

  [вставь контекстные скиллы по таблице выше]
  Задача: [task.title]

  Scope: [plan.scope]
  Тип: [UI | API | Mixed]

  Изменённые файлы:
  [filesCreated + filesModified]

  diffBase: [diffBase SHA]

  Фокус из QUALITY_GATE:
  [ключевые findings если были]

  ## Pre-work (ТЫ делаешь сам, не оркестратор)

  1. Проверь dev-сервер: curl -s -o /dev/null -w '%{http_code}' http://localhost:3000
     Если не отвечает → запусти: npm run dev & и дождись готовности (до 60 сек polling).
     НИКОГДА не возвращай BLOCKED из-за незапущенного сервера — запусти его сам.

  2. Прогони E2E тесты: npm run test:e2e
     Если падают → включи failed output в AGENT_REPORT как NEEDS_FIX.

  3. Определи QA Tier по размеру diff:
     - Quick: hotfix, <20 строк → Critical + High only
     - Standard: всё остальное → + Medium
     - Exhaustive: 🔴 задачи → + Low + Cosmetic

  4. Прочитай shared QA account credentials из docs/testing/QA-SHARED-ACCOUNT.md

  ## Инструкция

  1. Pre-flight: curl localhost:3000 (уже выполнено в pre-work).
  2. Составь тест-план (система + пользователь). Для каждого кейса: hypothesis + action + expected.
  3. Исполни тесты пытаясь сломать: smoke → happy path → edge cases → негативные → security.
  4. Обязательно: попробуй получить данные другой организации (multi-tenancy test).
  5. Для UI-задач: проверь что error/empty/loading state тексты соответствуют UX-WRITING-GUIDE.md, UI соответствует DESIGN-SYSTEM.md
  6. Верни AGENT_REPORT с verdict и полной документацией каждого кейса.

  ОБЯЗАТЕЛЬНО: Сохрани QA-репорт в файл:
  docs/sprints/sprint-<N>/qa-reports/ZN-S<N>-T<ID>-qa-report.md
  Шаблон: docs/templates/qa-report-template.md
  Не копируй QA credentials в репорт."
```

## Health Score (informational, NOT gate)

QA-агент вычисляет Health Score по рубрике:

| Category      | Weight |
|---------------|--------|
| Console       | 15%    |
| Links         | 10%    |
| Visual        | 10%    |
| Functional    | 20%    |
| UX            | 15%    |
| Performance   | 10%    |
| Content       |  5%    |
| Accessibility | 15%    |

Health Score = informational telemetry. Verdict (APPROVED/NEEDS_FIX/BLOCKED) остаётся primary decision.

## После AGENT_REPORT

1. **Проверь наличие QA-репорта**: файл должен существовать.
2. Обработай verdict:
   - `verdict == "APPROVED"` → перейти к DELIVERY
   - `verdict == "NEEDS_FIX"` → инкрементировать `cycles.qa` → `/fix-phase` → повторный QA
   - `verdict == "BLOCKED"` → СТОП, сообщить пользователю (**не идти в FIX**)

**Max 3 QA-цикла** с `NEEDS_FIX`. При исчерпании → `status: "BLOCKED"`, DELIVERY запрещена.
