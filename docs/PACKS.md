# Packs

Packs are optional capability modules installed on top of core.

```bash
agent-flow pack list
agent-flow pack add finance
agent-flow pack remove finance
```

Current built-in packs:

- `finance`: financial correctness rules, invariants, and optional math/domain reviewer.
- `cloudflare-worker`: Worker runtime surfaces, schema checks, and MCP/browser recommendations.
- `telegram`: Telegram delivery, QA, webhook, and copy constraints.
- `webapp`: browser QA, accessibility, and frontend workflow hints without assuming a framework.
- `code-review-toolkit`: auxiliary code review and simplification agents.
- `code-review-graph`: graph-first code discovery guide, helper skills, and MCP recommendation.
- `nextjs`: Next.js App Router best-practice skill.
- `design`: UI/UX, brand, slides, and design-system skills.

Packs may contribute:

- agents
- guides
- skills
- validators
- MCP servers
- checks
- deployment-impact surfaces
- quality invariants

`pack add` updates `.agent-flow/config.json` and rerenders managed files. `pack remove` updates config and deletes obsolete managed files that are no longer contributed by the selected pack set.
