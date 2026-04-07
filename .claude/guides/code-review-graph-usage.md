# code-review-graph: правила использования

SSOT для всех агентов и оркестратора. Читай перед первым вызовом MCP tools.

---

## Правило №1: Graph-First

Используй code-review-graph MCP **до** Grep/Glob/Read для поиска по коду.
Fallback на Grep/Glob/Read — только для конфигов, CSS, JSON/YAML/MD.

---

## Правило №2: Как писать query для semantic_search_nodes

Инструмент работает в двух режимах:
- **hybrid** (есть embeddings) — находит семантически близкое, tolerant к вариациям
- **keyword** (нет embeddings) — точное substring-совпадение по имени ноды

Многословные фразы **всегда** попадают в keyword mode и возвращают 0.

```
✅ CamelCase имя класса/функции:  query="IndexingService"
✅ kebab-case имя файла:           query="indexing-service"
✅ один технический термин:        query="chunk", query="embed", query="rag"

❌ концептуальная фраза:           query="RAG indexing pipeline"
❌ несколько слов через пробел:    query="knowledge source adapter"
```

Если первый запрос вернул 0 — это **не** значит что граф пустой. Попробуй:
1. Один токен вместо нескольких
2. CamelCase вариант (`"IndexingService"` вместо `"indexing service"`)
3. Другое слово из той же темы (`"embed"` вместо `"embedding"`)

**0 результатов ≠ граф пуст. Fallback на Grep разрешён только после 3+ попыток с разными query.**

---

## Правило №3: query_graph — файл, не директория

`children_of`, `importers_of`, `imports_of` принимают **точный путь к файлу**, не директорию.

```
✅ query_graph(pattern="children_of", target="src/features/ai/indexing-service.ts")
❌ query_graph(pattern="children_of", target="src/lib/intelligence")   # директория → not_found
```

---

## Правило №4: get_architecture_overview ненадёжен

Возвращает 0 communities для этого проекта — community detection не запускался.
**Не используй как индикатор работоспособности графа и не жди от него архитектурного контекста.**

Альтернативы:
```
query_graph(pattern="children_of", target="src/features/ai/router.ts")   # содержимое файла
query_graph(pattern="importers_of", target="src/features/ai/index.ts")   # кто использует модуль
```

---

## Quick Reference

| Задача | Tool | Пример |
|--------|------|--------|
| Найти файл по теме | `semantic_search_nodes` | `query="indexing-service", kind="File"` |
| Найти функцию/класс | `semantic_search_nodes` | `query="IndexingService", kind="Function"` |
| Содержимое файла | `query_graph children_of` | `target="src/features/ai/service.ts"` |
| Кто вызывает функцию | `query_graph callers_of` | `target="createPage"` |
| Кто импортирует модуль | `query_graph importers_of` | `target="src/features/docs/service.ts"` |
| Есть ли тесты | `query_graph tests_for` | `target="IndexingService"` |
| Blast radius изменений | `get_impact_radius` | `changed_files=["src/features/ai/service.ts"]` |
| Data flow для security | `get_affected_flows` | `function_name="validateSession"` |
| Контекст для ревью | `get_review_context` | `base="origin/develop", include_source=true` |
