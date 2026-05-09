# Agent Flow

Agent Flow is a project-agnostic orchestration package for installing and maintaining AI agent workflows across Claude Code and Codex.

The target install flow is:

```bash
npx @mxmbt/agent-flow init
```

This repository is being rebuilt from an empty package baseline. FinAI remains a read-only reference implementation; public Agent Flow code, templates, profiles, and packs must stay project-agnostic.

## Current Status

The package scaffold, config schema, renderer, initial packs, migrated core agents, and first working installer paths are in place. Some maintenance commands are still skeletons while migration continues.

Available command groups:

```bash
agent-flow --help
agent-flow init --help
agent-flow update --help
agent-flow upgrade --help
agent-flow sync --help
agent-flow sync --diff
agent-flow doctor --help
agent-flow config --help
agent-flow config list
agent-flow config explain checks.defaultShellBlock
agent-flow config explain checks.focusedTestCommand
agent-flow render --help
agent-flow validate --help
agent-flow pack --help
```

`agent-flow config explain <key>` is the transparency tool for template placeholders. It shows the current rendered value, where it comes from in `.agent-flow/config.json` or enabled packs, and which agent or guide templates use it.

`agent-flow init` creates `.agent-flow/config.json`, generated Claude/Codex targets, and starter project documents for configured artifact paths such as `PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/ARCHITECTURE_MULTI_USER.md`, `docs/ARCHITECTURE_SCHEDULING.md`, `docs/tasks.md`, `docs/UI-UX-SPECIFICATION.md`, `docs/design/DESIGN-SYSTEM.md`, `docs/design/UX-WRITING-GUIDE.md`, and `docs/testing/QA-SHARED-ACCOUNT.md`. In an existing project, `init` reuses common existing document paths such as `ROADMAP.md`, `docs/product/README.md`, `docs/architecture/README.md`, `docs/SECURITY.md`, `docs/JOBS.md`, `docs/backlog.md`, `docs/UX.md`, `docs/design/README.md`, `docs/content/UX-WRITING-GUIDE.md`, or `docs/qa/shared-account.md` and writes those paths into config instead of creating duplicate docs. Existing unmanaged generated targets are reported as conflicts instead of overwritten.

For coding projects, planning needs a code discovery provider for codebase maps, impact analysis, and affected-flow discovery. During onboarding, `agent-flow init` detects a code project from `package.json`; if there is no existing Agent Flow config, it enables the `code-review-graph` pack as the default provider and renders its guide. It also enables the `code-review-toolkit` pack so users can manually invoke auxiliary review agents when useful. Projects with another graph/indexing tool can set `discovery.codeGraphProvider` to `custom`, describe it in `discovery.customProvider`, and remove or replace the graph pack.

`agent-flow sync --diff` previews generated `.claude/**` and `.codex/**` changes before writing, so users can inspect how config and packs affect the final agent files.

## Development

```bash
npm install
npm test
```

## Architecture Direction

Agent Flow is split into:

- `core`: lifecycle mechanics, agent contracts, canonical templates, validators
- `packs`: optional domain/runtime/toolkit modules such as `finance`, `cloudflare-worker`, `telegram`, `webapp`, `code-review-toolkit`, `code-review-graph`, and `design`
- `config`: project-local values such as checks, branches, runtime roots, and repository refs
- `installer`: CLI commands for init, update, upgrade, sync, doctor, config inspection, render, validate, and pack management

See [docs/roadmap/project-agnostic-core-roadmap.md](docs/roadmap/project-agnostic-core-roadmap.md) for the detailed implementation roadmap.
