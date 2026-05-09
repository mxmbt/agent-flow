# Migration Review Decisions

**Created:** 2026-05-08
**Purpose:** Shared decision register for recurring migration findings.

Use this file when the same pattern appears across multiple agents, skills, guides, or templates. The migration workflow is:

1. create a copy-as-is baseline,
2. run similarity and advisory universality scans,
3. record recurring decisions here,
4. apply those decisions consistently in later files.

---

## Decisions

| ID | Pattern | Decision | Route | Applies To | Rationale | Status |
|----|---------|----------|-------|------------|-----------|--------|
| MRD-0001 | Links to `.claude/guides/**`, `.claude/skills/**`, `.codex/guides/**`, `.codex/skills/**` | Keep | Agent Flow package | Agents, skills, guides | Agent Flow installs orchestration, agents, guides, and skills together. Internal links are part of the package contract, not optional external dependencies. Target renderers may adapt `.claude` paths to `.codex` paths for Codex output. | Accepted |
| MRD-0002 | Copy-as-is migrated agent or skill contains project-specific assumptions | Keep in baseline, then review | Manual review | All migrated docs | The first migration artifact should preserve source behavior. Project-specific assumptions are recorded as review findings and only changed after an explicit decision. | Accepted |
| MRD-0003 | Hardcoded app root such as `cf/` | Review for config | Config | Agents, skills, scripts | App roots vary by project. Keep in copy-as-is baseline; later public-core rewrite should source this from project config. | Accepted |
| MRD-0004 | Financial correctness, no-look-ahead, finance-domain invariants | Review for finance pack | Pack | Agents, skills, quality gates | These are reusable but domain-specific. Keep in copy-as-is baseline; later public-core rewrite should route through the finance pack if still needed. | Accepted |
| MRD-0005 | Cloudflare Worker, Wrangler, worker bindings, D1/R2/KV | Review for cloudflare-worker pack | Pack | Agents, skills, scripts | These are reusable runtime rules, not core behavior. Keep in copy-as-is baseline; later public-core rewrite should route through the cloudflare-worker pack. | Accepted |
| MRD-0006 | Planning and design artifacts such as `research pack`, `Design Document`, `DDREF`, `ADD`, and `ADR` | Keep | Core | Agents, skills, guides, artifacts | These artifacts are part of the Agent Flow planning and design workflow and are referenced across agents and skills. They should be migrated with the core orchestration instead of treated as optional packs. | Accepted |
| MRD-0007 | Source-specific wording such as `Preferred path in FinAI` | Rewrite during universality pass | Manual review | Agents, skills, guides | This is not a reusable capability or pack. It is wording from the source project and should become neutral Agent Flow wording, such as `Preferred path`, after the copy-as-is baseline is validated. | Accepted |
| MRD-0008 | Hardcoded GitHub repository references such as `id-bu/AI_Finance_Manager` | Review for config | Config | Agents, skills, scripts | Repository owner/name varies by installed project. Keep in copy-as-is baseline; later public-core rewrite should source repository refs from project config or runtime discovery. | Accepted |
| MRD-0009 | Hardcoded branch and release-flow names such as `develop`, `master`, `origin/develop`, or `origin/master` | Review for config | Config | Agents, skills, scripts | Branch policy varies by project. Keep in copy-as-is baseline; later public-core rewrite should source integration/release branches and diff bases from git config. | Accepted |
| MRD-0010 | Repo-native context blocks that name a concrete runtime, storage, or user surface | Rewrite to configured project context | Config + Pack | Architectures, agents, skills | Core agents may require the agent to consider runtime, storage, deployment, and user-facing surfaces, but concrete choices such as Cloudflare Workers, D1/R2, or Telegram belong to config or packs. | Accepted |
| MRD-0011 | `user isolation` as an architecture/security concern | Keep | Core | Architects, reviewers, quality gates | User/data isolation is a generic multi-user system concern, not a FinAI-specific finance invariant. Finance terms such as financial correctness and no-look-ahead still route to domain packs. | Accepted |
| MRD-0012 | Project architecture document paths such as `docs/ARCHITECTURE.md` or `ARCHITECTURE_MULTI_USER.md` | Render from config | Config | Architects, agents, artifact contracts | Architecture references are core concepts, but concrete file paths vary by project. Agent templates should use `artifacts.*ArchitectureFile` placeholders and expose them through `agent-flow config explain`. | Accepted |

---

## Notes

- Accepted decisions should be applied without reopening the same debate unless new evidence appears.
- Proposed decisions are guidance for the next manual review pass.
- This file does not replace per-file migration status. Each migrated row still records file-specific evidence in `docs/roadmap/document-migration-status.md`.
