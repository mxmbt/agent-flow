# Agent Flow

Agent Flow installs and maintains project-local AI agent workflows for Claude Code and Codex.

```bash
npx @mxmbt/agent-flow init
```

The install writes:

- `.agent-flow/config.json`
- Claude Code targets under `CLAUDE.md` and `.claude/**`
- Codex targets under `AGENTS.md` and `.codex/**`
- shared agent artifact templates under `docs/templates/**`
- helper scripts under `scripts/**`
- optional MCP config when enabled packs require it

Generated files are managed by Agent Flow and can be refreshed safely.

```bash
npx @mxmbt/agent-flow update
npx @mxmbt/agent-flow validate --strict
npx @mxmbt/agent-flow doctor
```

## Quick Start

```bash
npx @mxmbt/agent-flow init
npx @mxmbt/agent-flow doctor
npx @mxmbt/agent-flow validate --strict
```

Profiles:

```bash
npx @mxmbt/agent-flow init --profile generic
npx @mxmbt/agent-flow init --profile webapp
npx @mxmbt/agent-flow init --profile finai.example
```

Packs:

```bash
npx @mxmbt/agent-flow pack list
npx @mxmbt/agent-flow pack add finance
npx @mxmbt/agent-flow pack add code-review-toolkit
npx @mxmbt/agent-flow pack remove finance
```

Inspection:

```bash
npx @mxmbt/agent-flow config list
npx @mxmbt/agent-flow config explain checks.defaultShellBlock
npx @mxmbt/agent-flow render --json
npx @mxmbt/agent-flow sync --diff
```

## Concepts

- **Core**: stack-neutral lifecycle, agent contracts, canonical templates, validators, and shared helper scripts.
- **Targets**: Claude Code and Codex rendered files. They are mirrored from canonical content with explicit target adapters.
- **Config**: project-local facts such as branches, checks, artifact paths, runtime URLs, MCP choices, and unresolved `needsReview` fields.
- **Packs**: optional capability modules such as `finance`, `cloudflare-worker`, `telegram`, `webapp`, `code-review-toolkit`, `code-review-graph`, `nextjs`, and `design`.
- **Profiles**: starter config overlays. `generic` is neutral, `webapp` enables browser QA/accessibility, and `finai.example` proves product-specific assumptions can live outside core.

## Tested Commands

The standard CI command is:

```bash
npm test
```

It builds the package, runs temp-repo install tests, validates mirror parity, exercises pack add/remove, and runs the universality scan.

Release-smoke commands before publishing:

```bash
npm run smoke:package
```

## Documentation

- [Config](docs/CONFIG.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Packs](docs/PACKS.md)
- [MCP](docs/MCP.md)
- [Migration](docs/MIGRATION.md)
- [Release](docs/RELEASE.md)
- [Roadmap](docs/roadmap/project-agnostic-core-roadmap.md)

## Development

```bash
npm install
npm test
```
