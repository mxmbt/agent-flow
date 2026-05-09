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
agent-flow render --help
agent-flow validate --help
agent-flow pack --help
```

`agent-flow config explain <key>` is the transparency tool for template placeholders. It shows the current rendered value, where it comes from in `.agent-flow/config.json` or enabled packs, and which agent templates use it.

`agent-flow init` creates `.agent-flow/config.json`, generated Claude/Codex targets, and starter project documents for configured artifact paths such as `PROJECT_STATUS.md`, `docs/ROADMAP.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/ARCHITECTURE_MULTI_USER.md`, and `docs/ARCHITECTURE_SCHEDULING.md`. In an existing project, `init` reuses common existing document paths such as `ROADMAP.md`, `docs/product/README.md`, `docs/architecture/README.md`, `docs/SECURITY.md`, or `docs/JOBS.md` and writes those paths into config instead of creating duplicate docs. Existing unmanaged generated targets are reported as conflicts instead of overwritten.

`agent-flow sync --diff` previews generated `.claude/**` and `.codex/**` changes before writing, so users can inspect how config and packs affect the final agent files.

## Development

```bash
npm install
npm test
```

## Architecture Direction

Agent Flow is split into:

- `core`: lifecycle mechanics, agent contracts, canonical templates, validators
- `packs`: optional domain/runtime modules
- `config`: project-local values such as checks, branches, runtime roots, and repository refs
- `installer`: CLI commands for init, update, upgrade, sync, doctor, config inspection, render, validate, and pack management

See [docs/roadmap/project-agnostic-core-roadmap.md](docs/roadmap/project-agnostic-core-roadmap.md) for the detailed implementation roadmap.
