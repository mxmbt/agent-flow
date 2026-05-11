# Changelog

## 0.1.4

- Writes generated helper scripts with executable mode `0755` so they can be invoked as `./scripts/...`.
- Repairs mode-only drift during `agent-flow update`/`sync` when managed scripts already match rendered content but are not executable.

## 0.1.3

- Enables the code-review-toolkit pack during `agent-flow init` for fresh projects.
- Installs the six `prt-*` review agents and `pr-review-toolkit` skill as part of the default onboarding bundle.

## 0.1.2

- Enables the code-review-graph pack as the default planning discovery provider during `agent-flow init`.
- Renders portable CRG MCP config for fresh installs so `agent-flow doctor` no longer warns about a missing code graph provider after onboarding.

## 0.1.1

- Creates a starter `package.json` during `agent-flow init` when the project does not already have one.
- Removes first-run review blockers for inferred task prefixes, integration branches, default checks, code graph defaults, and starter dev URLs.
- Treats the default `npm init` failing test script as an unconfigured project and uses a passing starter validation command until real tests are added.

## 0.1.0

Initial Agent Flow release.

This release replaces the old manual-copy workflow for Claude Code and Codex agent files with a config-driven installer and renderer:

- installs canonical core agent orchestration into Claude and Codex targets;
- keeps Claude/Codex mirrors checkable with strict validation;
- supports optional packs for domain/tool capabilities;
- detects common project checks and marks uncertain values in `needsReview`;
- generates MCP config from installed packs instead of copying machine-local settings;
- provides public docs for config, packs, MCP, architecture, and migration;
- includes clean-repo package smoke testing through `npm run smoke:package`.
