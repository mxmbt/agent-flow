# MCP Setup

Agent Flow renders MCP configuration from `.agent-flow/config.json` and enabled packs.

Generated files:

- `.mcp.json` for shared MCP-aware tooling
- `.claude/settings.json` for Claude Code project settings
- `.codex/mcp.codex.json` for Codex-side MCP configuration

The renderer only emits portable commands. Generated MCP files must not contain machine-local absolute paths such as `/Users/<name>/...`; use project-relative paths, package commands, or environment variables.

Run:

```bash
agent-flow sync
agent-flow doctor
```

`doctor --strict` fails when required MCP setup is missing or when generated MCP config contains unsafe absolute paths. Optional MCP setup is reported as a warning so projects can continue with fallback discovery or manual tooling.
