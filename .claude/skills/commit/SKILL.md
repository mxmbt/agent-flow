---
name: commit
description: Методология создания git-коммитов. Conventional Commits на русском, bisectable commits, правила staging.
---

# Git Commit Methodology

## Формат коммита

```
<type>(<scope>): описание на русском

Тело (если нужно): что и почему, не как

Co-Authored-By: Claude <noreply@anthropic.com>
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

Модуль из `src/features/` или `src/lib/`: `docs`, `ai`, `spaces`, `auth`, `editor`, `prisma`, `trpc`

## Правила

### Bisectable Commits (>50 строк изменений)

Каждый коммит должен:
- Компилироваться (`npm run type-check`)
- Проходить тесты (`npm test`)
- Быть атомарным (одно логическое изменение)

### Что НЕ коммитить

- `.env`, credentials, secrets
- `console.log` в production коде
- Незавершённые изменения
- Файлы >10MB без LFS

### Staging

```bash
# ✅ Конкретные файлы
git add src/features/docs/service.ts src/features/docs/service.test.ts

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
feat(docs): добавлен компонент боковой навигации

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

7. `git status` — подтвердить успех

## Примеры хороших коммитов

```
feat(auth): реализована авторизация через Keycloak
fix(editor): исправлен краш при пустом документе
refactor(ai): вынесен RAG pipeline в отдельный сервис
test(spaces): unit-тесты для CRUD операций
docs(architecture): обновлён модульный граф зависимостей
chore(deps): обновлён @prisma/client до 6.x
```

## Примеры плохих коммитов

```
fix: фикс           ← нет scope, нет описания
update              ← нет type, нет scope
WIP                 ← незавершённая работа
feat: всё починил   ← неинформативно
```
