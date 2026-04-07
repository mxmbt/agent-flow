# Worktree Workflow

`develop` занят в `/Users/mburtikov/ZNAI` — checkout в других worktree невозможен. `main` свободен — никто не паркуется на нём постоянно (только release snapshots).

**Принцип парковки:** каждый worktree между задачами стоит на ветке `worktree/<dirname>`, где `<dirname>` — имя директории worktree. Ветка всегда указывает на `origin/develop`.

```bash
# 1. Начало задачи — создать ветку от origin/develop
git fetch origin
git checkout -b feature/ZN-S<N>-T<ID>-... origin/develop

# 2. PR ВСЕГДА в develop
gh pr create --base develop ...

# 3. Merge (squash) БЕЗ --delete-branch (develop заблокирован — это нормально)
gh pr merge <N> --squash

# 4. Cleanup и синхронизация ВСЕХ worktrees после delivery
gh api repos/mxmbt/znai/git/refs/heads/<branch> -X DELETE  # удалить remote branch

# Один fetch обновляет origin/* для всех local worktrees сразу
git fetch origin

# Основной worktree: подтянуть develop ТОЛЬКО если он на ветке develop
MAIN_BRANCH=$(git -C /Users/mburtikov/ZNAI branch --show-current)
if [[ "$MAIN_BRANCH" == "develop" ]]; then
  git -C /Users/mburtikov/ZNAI pull origin develop
else
  echo "⚠️  Основной worktree на ветке $MAIN_BRANCH — pull пропущен (rebase перед PR)"
fi

# СНАЧАЛА: переключить текущий worktree на парковку (иначе branch -D упадёт)
FEATURE_BRANCH=$(git branch --show-current)
git checkout -B worktree/$(basename $PWD) origin/develop

# Удалить рабочую ветку только если это task-ветка (feature/bugfix/hotfix)
[[ "$FEATURE_BRANCH" == feature/* || "$FEATURE_BRANCH" == bugfix/* || "$FEATURE_BRANCH" == hotfix/* ]] \
  && git branch -D "$FEATURE_BRANCH"

# Остальные worktrees на parking-ветках: сбросить на свежий origin/develop
git worktree list --porcelain \
  | awk '/^worktree/{wt=$2} /^branch refs\/heads\/worktree\//{print wt}' \
  | while read wt; do
      git -C "$wt" checkout -B worktree/$(basename "$wt") origin/develop
    done
```

**Правило синхронизации:** после merge `origin/develop` обновляется в облаке и все локальные парковки сбрасываются на него одним проходом. Параллельные задачи ребейзятся от `origin/develop` перед PR. Основной worktree обновляется только если он на `develop`; feature-ветки получат свежий develop при rebase перед своим PR.

- `main` — только release snapshots, НЕ цель для feature PR
- `worktree/$(basename $PWD)` — универсальная команда, работает в любом worktree

## Параллельные worktrees

Перед `gh pr create` — всегда rebase:

```bash
git fetch origin
git rebase origin/develop   # подтянуть изменения параллельных задач
git push --force-with-lease
```

| Ситуация | Параллельно? |
|----------|-------------|
| Задачи трогают разные файлы | ✅ GitHub мёрджит сам |
| Задача B дополняет файлы задачи A | ⚠️ rebase обязателен |
| Задача B требует завершения A | ❌ только последовательно |

Если rebase сломался с конфликтами — задача была зависимой, не должна идти параллельно.
