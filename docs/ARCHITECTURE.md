# Agent Flow Architecture

Agent Flow renders project-local agent files from canonical templates, config, and packs.

```text
core templates + static skills
        +
project config
        +
enabled packs
        |
        v
Claude Code targets + Codex targets + shared docs/scripts
```

## Core

Core contains lifecycle mechanics, agent contracts, quality gates, shared artifact templates, validators, and delivery helpers. Core must stay stack-neutral and product-neutral.

## Targets

Targets are tool-native outputs:

- `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/agents/**`, `.claude/guides/**`, `.claude/skills/**`
- `AGENTS.md`, `.codex/orchestration-policy.md`, `.codex/claude-interop.md`, `.codex/agents/**`, `.codex/guides/**`, `.codex/skills/**`

Claude and Codex mirrors are checked by `agent-flow validate --strict`. Allowed differences are limited to target syntax, tool paths, frontmatter, and target-specific invocation wording.

## Config

Config owns local facts: branches, checks, artifact paths, runtime URLs, MCP choices, and unresolved onboarding fields. Templates use placeholders instead of hardcoded project assumptions.

## Packs

Packs add optional capability: agents, guides, skills, validators, checks, MCP recommendations, deployment-impact surfaces, and quality invariants.

## Profiles

Profiles are starter config overlays. They are not runtime modes. A project can start with `generic`, `webapp`, or `finai.example`, then add/remove packs over time.
