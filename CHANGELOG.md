# Changelog

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
