---
name: delivery-phase
description: "DELIVERY phase: walkthrough, commit, PR, merge, cleanup."
argument-hint: "[ZN-S<N>-T<ID>]"
---

# DELIVERY Phase

## Вызов агента

```
Task tool:
  subagent_type: "delivery-agent"
  prompt: "Фаза DELIVERY для ZN-S<N>-T<ID>.
  ОБЯЗАТЕЛЬНО прочитай .claude/skills/commit/SKILL.md — методология коммитов.
  Прочитай state: docs/sprints/sprint-<N>/states/ZN-S<N>-T<ID>-state.json
  Включает: walkthrough, обновление tasks.md, commit, PR, merge, cleanup."
```

## Что делает delivery-agent

1. Финальные проверки: `npm test`, `npm run type-check`, `npm run lint`, `npm run build`, `npx tsx scripts/validate-skill-references.ts`
2. **Documentation Update** (см. ниже)
3. **Document Staleness Check** (см. ниже)
4. Walkthrough из state.json → `docs/sprints/sprint-<N>/walkthroughs/ZN-S<N>-T<ID>-walkthrough.md` (шаблон: `docs/templates/walkthrough-template.md`)
5. **Обновить tasks.md** → `docs/sprints/sprint-<N>/tasks.md` → изменить статус задачи с `📋 TODO` на `✅ DONE`
6. **Bisectable Commits** (см. ниже)
7. PR (НА РУССКОМ, base: develop)
8. **State.json + PR URL** (см. ниже) — commit & push ДО merge
9. Merge (squash) и зачистка веток
10. **Синхронизация всех worktree** (см. ниже)

## Documentation Update (ОБЯЗАТЕЛЬНО)

После каждой задачи delivery-agent ОБЯЗАН проверить и обновить проектную документацию.

### Что проверять

1. **Architecture docs** (`docs/architecture/`)
   - Если задача добавила/изменила модуль → обновить описание модуля
   - Если изменились связи между модулями → обновить dependency diagram
   - Если добавилась новая технология/библиотека → обновить tech stack section

2. **Module documentation** (README в каждом `src/features/<module>/`)
   - Если добавлен новый router/service/schema → обновить публичный API описание
   - Если изменился data flow → обновить

3. **Pattern catalog** (`docs/patterns/` или секция в architecture docs)
   - Если использован новый паттерн → задокументировать
   - Если паттерн переиспользован → убедиться что он задокументирован

4. **CLAUDE.md** (dev rules)
   - Если задача выявила новое правило/конвенцию → добавить
   - Если существующее правило оказалось неверным → обновить

5. **BlockNote development doc** (`docs/architecture/BLOCKNOTE-DEVELOPMENT.md`)
   - Проверять только если diff затронул `BlockNote` integration points (`src/features/editor/**`, `src/app/api/files/**`, related editor infra)
   - Обновлять только если задача выявила новый reusable gotcha, invariant или symptom → root cause
   - Если нового правила нет — зафиксировать `BlockNote docs review: no update needed`

### Правила обновления
- Auto-update: фактические изменения (paths, API endpoints, config values) — без подтверждения
- Narrative changes (описание архитектуры, принципов) — обновлять только если фактически противоречат новому коду. Если сомнение — не обновлять (YAGNI)
- НИКОГДА не перезаписывать целые файлы — только Edit с exact string matches
- Обновления включаются в тот же коммит что и код задачи

## Document Staleness Check

Перед PR creation — проверить актуальность документации:
- Do README, ARCHITECTURE, CONTRIBUTING, CLAUDE.md mention anything contradicted by this diff?
- Are there factual references (paths, counts, API endpoints) that changed?
- Auto-fix factual corrections (paths, counts, versions)
- Flag narrative/philosophy changes for review
- **CHANGELOG safety:** NEVER regenerate — only Edit with exact string matches
- Cross-doc consistency: do docs contradict each other after this change?

## Bisectable Commits

При коммите — split by logical unit если >50 строк и >3 файла:
1. Infrastructure / config changes
2. Schema / model changes
3. Service / business logic
4. UI / components
5. Tests

Каждый коммит independently compiles and runs.
Для простых задач (<50 строк) — один коммит.

## Синхронизация worktree после merge (ОБЯЗАТЕЛЬНО)

После squash merge в develop — все worktree должны получить свежий `origin/develop`:

```bash
# 1. Удалить remote ветку
gh api repos/{owner}/{repo}/git/refs/heads/<branch> -X DELETE

# 2. Один fetch обновляет origin/* для всех worktree
git fetch origin

# 3. Текущий worktree → парковка
FEATURE_BRANCH=$(git branch --show-current)
git checkout -B worktree/$(basename $PWD) origin/develop
git branch -D "$FEATURE_BRANCH"

# 4. Все остальные парковочные worktree → свежий origin/develop
git worktree list --porcelain \
  | awk '/^worktree/{wt=$2} /^branch refs\/heads\/worktree\//{print wt}' \
  | while read wt; do
      git -C "$wt" checkout -B worktree/$(basename "$wt") origin/develop
    done

# 5. Активные worktree (на рабочих ветках) — cherry-pick .claude/ и .codex/ изменений
#    если в коммите были изменения конфиг-файлов (.claude/, .codex/, AGENTS.md)
```

**Правило:** парковочные worktree (на `worktree/*`) сбрасываются автоматически. Активные worktree (на рабочих ветках) получают конфиг-изменения через cherry-pick, если таковые есть в коммите.

## Lessons → Auto-Memory (ОБЯЗАТЕЛЬНО)

После merge, перед завершением delivery-agent ОБЯЗАН:
1. Прочитать `state.json.memoryLessons[]` — там оркестратор накопил уроки из всех фаз
2. Если список не пуст — сохранить каждый урок в auto-memory Claude Code (просто проговорить "запомни: ...")
3. Записать `reports.delivery.lessonsSaved = true` в state.json

**Критерий memoryLessons:** только уроки достойные постоянной памяти ("пригодится через месяц"). Контекстные наблюдения текущей задачи → `lessons[]`, не `memoryLessons[]`.

Auto-memory хранится в `~/.claude/projects/*/memory/`, загружается автоматически при старте сессии. Дедупликация встроена.

## State.json Updates

Записать в `reports.delivery`:
- `commit`: hash и сообщение
- `pr`: номер и URL
- `walkthrough`: путь к файлу
- `lessonsSaved`: true/false

**ВАЖНО:** state.json ОБЯЗАН быть включён в один из bisectable commits (обычно последний — docs/delivery). Delivery-agent ОБЯЗАН обновить state.json ДО коммита, не после.

## State.json + PR URL (шаг 8, ДО merge)

**Проблема:** PR URL появляется только после `gh pr create` (шаг 7), но state.json уже закоммичен (шаг 6) без этого URL. Если не доложить — state.json с PR URL останется uncommitted навсегда.

**Решение — обязательная последовательность после создания PR:**

```bash
# 1. Обновить state.json с PR URL и commit hash
#    reports.delivery.pr = "https://github.com/owner/repo/pull/N"
#    reports.delivery.commit = "<hash>"

# 2. Commit & push в feature branch (PR уже создан, push обновит его)
git add docs/sprints/sprint-<N>/states/ZN-S<N>-T<ID>-state.json
git commit -m "docs(state): PR URL в state.json"
git push

# 3. Только ПОСЛЕ этого → merge (шаг 9)
```

**Правило:** между `gh pr create` и `gh pr merge` ОБЯЗАН быть коммит с PR URL в state.json. Merge без этого коммита = потерянный PR URL.

## Zero Uncommitted Files (ОБЯЗАТЕЛЬНО)

После КАЖДОГО шага delivery (commits, merge, sync) — `git status` должен показывать чистое состояние.

**Финальная проверка перед завершением:**
```bash
git status
# Ожидание: nothing to commit, working tree clean
```

Если есть uncommitted files — закоммитить и запушить в develop. Затем **повторить синхронизацию worktrees** (пункт 9) — любой push в develop требует ре-синхронизации всех worktrees.

**Правило:** каждый push в develop → синхронизация worktrees. Не только merge, а ЛЮБОЙ push.
