# Agent Flow Config

Agent Flow reads `.agent-flow/config.json`. `agent-flow init` creates it, and `agent-flow config explain <key>` shows how rendered placeholders use it.

Top-level sections:

- `needsReview`: setup fields the installer inferred but wants the user to confirm.
- `project`: project name, task prefix, and task ID pattern.
- `artifacts`: paths for status, roadmap, product, architecture, backlog, design, QA, phase, and walkthrough docs.
- `git`: remote name, repository, integration branch, optional release branch, branch prefixes, and worktree parking.
- `checks`: default checks, focused test command, optional checks, and changed-scope checks.
- `dev`: local start command and runtime URL.
- `runtime`: app root and deployment-impact surfaces.
- `discovery`: code graph provider contract.
- `quality`: enabled expert agents and project invariants.
- `packs`: installed optional capability packs.
- `mcp`: enabled/required MCP servers.
- `features`: target feature flags.

Common commands:

```bash
agent-flow config list
agent-flow config explain checks.defaultShellBlock
agent-flow config explain git.integrationBranch
agent-flow doctor
```

Unknown or uncertain values should stay in `needsReview` until the project owner confirms them. `doctor` reports those fields so onboarding does not silently depend on guesses.
