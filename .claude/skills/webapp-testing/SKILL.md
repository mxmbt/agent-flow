---
name: webapp-testing
description: "Web app testing: OpenBrowser MCP, screenshots, logs."
---

# Web Application Testing

Тестирование веб-приложений через OpenBrowser MCP (`execute_code`). Все функции async — используй `await`.

## Quick Reference

```python
# Навигация
await navigate("http://localhost:3000/path")
await go_back()
await wait(2)  # ждать загрузки (max 30 сек)

# Состояние страницы
state = await browser.get_browser_state_summary()
# state.url, state.title, state.dom_state.selector_map

# Взаимодействие (index из selector_map)
await click(index=3)
await input_text(index=5, text="value")
await scroll(down=True, pages=1)
await send_keys("Enter")
await select_dropdown(index=7, text="Option")

# Скриншоты
await browser.take_screenshot(path="/abs/path/screenshot.png")
await browser.take_screenshot(path="/abs/path/full.png", full_page=True)
await browser.screenshot_element("css-selector", path="/abs/path/element.png")

# JavaScript в контексте страницы (возвращает Python-объект)
title = await evaluate("document.title")
items = await evaluate('Array.from(document.querySelectorAll(".item")).map(e => e.textContent)')
```

## Reconnaissance-Then-Action Pattern

1. **Navigate and inspect:**
   ```python
   await navigate("http://localhost:3000")
   await wait(2)
   state = await browser.get_browser_state_summary()
   for idx, el in state.dom_state.selector_map.items():
       print(f"[{idx}] <{el.tag_name}> {el.attributes}")
   ```

2. **Screenshot for visual context:**
   ```python
   await browser.take_screenshot(path="/abs/path/recon.png")
   ```

3. **Act on discovered elements:**
   ```python
   await input_text(index=3, text="test@example.com")
   await click(index=5)
   await wait(1)
   ```

4. **Assert results:**
   ```python
   state = await browser.get_browser_state_summary()
   assert "dashboard" in state.url, f"Expected dashboard, got {state.url}"
   ```

## Tips

- `state.dom_state.selector_map` — dict `{index: element}` всех интерактивных элементов
- `el.get_all_children_text(max_depth=1)` — текст внутри элемента
- `evaluate()` — JS в контексте страницы, возвращает Python dict/list/str
- Переменные сохраняются между вызовами `execute_code`
- Всегда `await wait(N)` после действий, вызывающих загрузку
- Скриншоты — только абсолютные пути
