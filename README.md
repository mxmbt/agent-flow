# Agent Flow

Agent Flow is a project-agnostic orchestration package for installing and maintaining AI agent workflows across Claude Code and Codex.

The target install flow is:

```bash
npx @mxmbt/agent-flow init
```

This repository is being rebuilt from an empty package baseline. FinAI remains a read-only reference implementation; public Agent Flow code, templates, profiles, and packs must stay project-agnostic.

## Current Status

The package scaffold and CLI command surface are in place. Most commands are skeletons until the renderer, config schema, validators, packs, and migration tasks land.

Available command groups:

```bash
agent-flow --help
agent-flow init --help
agent-flow update --help
agent-flow upgrade --help
agent-flow sync --help
agent-flow doctor --help
agent-flow render --help
agent-flow validate --help
agent-flow pack --help
```

## Development

```bash
npm install
npm test
```

## Architecture Direction

Agent Flow is split into:

- `core`: lifecycle mechanics, agent contracts, canonical templates, validators
- `packs`: optional domain/runtime modules
- `profiles`: starter configurations composed from core and packs
- `installer`: CLI commands for init, update, upgrade, sync, doctor, render, validate, and pack management

See [docs/roadmap/project-agnostic-core-roadmap.md](docs/roadmap/project-agnostic-core-roadmap.md) for the detailed implementation roadmap.
