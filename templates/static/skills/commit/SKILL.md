---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: commit
description: Методология создания git-коммитов. Conventional Commits на русском, bisectable commits, правила staging.
---

# Git Commit Methodology

## Формат коммита

```
<type>(<scope>): short imperative description in English

Body (if needed): what and why, not how

Co-Authored-By: {{target.agentName}} <noreply@example.invalid>
```

### Types

| Type | Когда |
|------|-------|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `refactor` | Рефакторинг без изменения поведения |
| `test` | Добавление/изменение тестов |
| `docs` | Документация |
| `chore` | Конфигурация, CI/CD, зависимости |
| `style` | Форматирование, пробелы, точки с запятой |
| `perf` | Оптимизация производительности |

### Scope

Scope бери из реального surface: `webhook`, `auth`, `db`, `tools`, `agents`, `jobs`, `orchestrator`, `infra`, `docs`

## Правила

### Bisectable Commits (>50 строк изменений)

Каждый коммит должен:
- Проходить configured checks:

```bash
{{checks.defaultShellBlock}}
```
- Быть атомарным (одно логическое изменение)

### Что НЕ коммитить

- `.env`, credentials, secrets
- `console.log` в production коде
- Незавершённые изменения
- Файлы >10MB без LFS

### Staging

```bash
# ✅ Конкретные файлы
git add <project-root>/src/agents/orchestrator.ts <project-root>/src/__tests__/orchestrator.test.ts

# ❌ НЕ использовать
git add -A  # может захватить .env, node_modules, лишнее
git add .   # то же самое
```

## Process

1. `git status` — проверить что коммитим
2. `git diff HEAD` — проверить staged + unstaged
3. `git log --oneline -5` — стиль предыдущих коммитов
4. Сформировать сообщение по формату
5. `git add <specific files>`
6. `git commit` через HEREDOC:

```bash
git commit -m "$(cat <<'EOF'
feat(agents): add per-user cron loop for M4

Co-Authored-By: {{target.agentName}} <noreply@example.invalid>
EOF
)"
```

7. `git status` — подтвердить успех

## Примеры хороших коммитов

```
feat(agents): added per-user cron loop for M4
fix(auth): fixed invite validation race on registration
refactor(orchestrator): extracted tool dispatch into separate module
test(webhook): added tests for multi-user message routing
docs(architecture): updated data flow for task context
chore(deps): bumped runtime dependency
```

## Примеры плохих коммитов

```
fix: фикс           ← нет scope, нет описания
update              ← нет type, нет scope
WIP                 ← незавершённая работа
feat: всё починил   ← неинформативно
```
