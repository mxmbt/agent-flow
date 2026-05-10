# Migration Guide

Use this guide when replacing manual `.claude` / `.codex` copies with Agent Flow.

## 1. Install In Preview

```bash
agent-flow init --dry-run
```

Review conflicts. Agent Flow does not overwrite unmanaged files by default.

## 2. Initialize

```bash
agent-flow init
```

For common starts:

```bash
agent-flow init --profile webapp
agent-flow init --profile finai.example
```

## 3. Review Config

```bash
agent-flow doctor
agent-flow config list
agent-flow config explain checks.defaultShellBlock
```

Resolve fields listed in `needsReview`.

## 4. Replace Manual Sync

Old manual sync commands such as repo-local `npm run agents:sync` should be replaced with:

```bash
agent-flow sync --diff
agent-flow sync
agent-flow validate --strict
```

## 5. Move Project-Specific Assumptions

Do not edit generated agent files by hand for durable project facts. Put those facts in:

- `.agent-flow/config.json` for paths, branches, checks, runtime URLs, and MCP choices
- packs for reusable domain/runtime/toolkit capability
- project docs for product, architecture, roadmap, QA, and design references

Generated Claude and Codex files should stay mirror-equivalent. `validate --strict` reports stale files and semantic drift.
