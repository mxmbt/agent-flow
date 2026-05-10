---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: delivery-phase
description: "DELIVERY phase: walkthrough, doc sync, PR creation, squash merge, branch cleanup, worktree sync."
argument-hint: "[<taskId>]"
---

# DELIVERY Phase

DELIVERY packages completed work for human consumption and future maintenance.

## Required Inputs

- final state file
- Design Document
- final changed-file list
- QA and review outcomes
- `{{artifacts.statusFile}}` when the shipped diff changes current product or repo truth

## Git Workflow Contract

`delivery-agent` owns the git flow end-to-end, but must distinguish two modes:

1. **Task delivery** (default): feature branch -> PR -> squash merge into `{{git.integrationBranch}}` -> branch delete -> configured local cleanup.
2. **Release sync** (explicit): `{{git.integrationBranch}}` -> PR -> squash merge into `{{git.releaseBranch}}` -> hard-reset `{{git.integrationBranch}}` to `{{git.releaseRef}}` -> repoint parking branches.

Rules:

- Default `DELIVERY` means **task delivered to `{{git.integrationBranch}}`**, not released to `{{git.releaseBranch}}`.
- Release sync happens only when the user explicitly asks to ship/deploy/release to `{{git.releaseBranch}}`, or when the task itself is a release task.
- `{{git.integrationBranch}}` ahead of `{{git.releaseBranch}}` is normal between releases.
- {{git.releaseSyncAvailability}}
- Local cleanup is never evidence that `{{git.releaseBranchLabel}}` changed.
- Worktree parking mode: `{{git.worktreeParkingMode}}`.

For default task delivery:

1. {{git.protectedBranchRule}}
2. Create PR to `{{git.integrationBranch}}` via `gh pr create {{git.prBaseFlag}}`. PR body must follow the standard template in the next section.
3. Squash merge: `gh pr merge <N> --squash`.
4. Delete remote branch: `{{git.remoteBranchDeleteCommand}}`.
5. {{git.worktreeParkingAction}}
6. Prove delivery state by running `{{git.deliveryStateCommand}} --ref {{git.deliveryStateRef}}`.

Delivery is not complete until the report shows:

- `{{git.integrationBranch}}: merged`
- `{{git.worktreeHygieneSuccessLine}}`
- {{git.releaseCloseoutRequirement}}

PR creation alone is not a valid delivery stop-point unless the user explicitly requests PR-only output.

## GitHub CLI API/DNS Debug Protocol

Problem this prevents: `git fetch`, `git push`, or `git ls-remote` can work while GitHub API calls through `gh` fail with `error connecting to api.github.com`, `Timeout trying to log in`, or resolver timeouts. In that state, PR creation, PR merge, auth checks, and branch deletion are blocked even though git transport looks healthy.

Resolution:

1. Keep using terminal `gh` for GitHub operations; do not push directly to protected branches and do not replace the PR flow with a direct merge.
2. Diagnose the split:

   ```bash
   git ls-remote --heads {{git.remoteName}} {{git.integrationBranch}} <feature-branch>
   gh auth status
   gh pr list --head <feature-branch> {{git.prBaseFlag}} --state all
   ```

3. If `gh` cannot reach `api.github.com` but git transport works, rerun all GitHub CLI commands with Go's resolver:

   ```bash
   GODEBUG=netdns=go gh auth status
   GODEBUG=netdns=go gh pr create {{git.prBaseFlag}} --head <feature-branch> --title "<title>" --body-file <body.md>
   GODEBUG=netdns=go gh pr view <PR_NUMBER> --json state,mergeStateStatus,headRefOid,statusCheckRollup
   GODEBUG=netdns=go gh pr merge <PR_NUMBER> --squash
   GODEBUG=netdns=go gh api repos/<owner>/<repo>/git/refs/heads/<feature-branch> -X DELETE
   ```

4. If the first delivery attempt already wrote `pending`, `#TBD`, or "GitHub API unreachable" into state, tasks, or walkthrough artifacts, do not merge that as-is. Create the PR, replace placeholders with the real PR URL/number, mark the delivery artifacts consistently, commit and push that fix to the same PR, then squash merge.
5. After merge, run the normal cleanup sequence:

   ```bash
   git fetch {{git.remoteName}} --prune
   {{git.worktreeParkCommand}}
   {{git.deliveryStateCommand}} --ref <merge-commit-sha>
   ```

This is a recovery path inside the standard delivery contract, not an alternate delivery path. Delivery still ends only when `{{git.integrationBranch}}: merged` and `Local worktree hygiene: pass` are proven.

## PR Body Template

Every feature PR body must use this structure. Delivery-agent fills each section from state, walkthrough, and diff evidence:

```markdown
## Summary
<what changed, technical>

## User-facing change
<one-sentence product-voice line, or the literal string "Internal/infra only — no user-facing change">

## Deployment impact
- Migrations: <none | list of migration files + apply order>
- Bindings: <none | new/changed configured runtime bindings in {{runtime.bindingConfigFile}}>
- Secrets: <none | new secret names required, without values>
- Cron: <none | schedule or handler changes>
- Runtime routes: <none | new/changed HTTP routes>
- Operator notes: <optional free text; e.g., manual backfill needed>

## Verification
<commands actually run + key results>

## Known risks
<explicit residual risk or "none">
```

## Deployment Impact Check

Delivery-agent must compute Deployment Impact from the final diff before opening the PR:

- default task delivery -> diff against `{{git.integrationRef}}...HEAD`
- release sync -> diff against `{{git.releaseRef}}...{{git.integrationRef}}`

- scan the mode-appropriate diff against this surface list:
  - `{{runtime.migrationsGlob}}` -> Migrations
  - `{{runtime.bindingConfigFile}}` (binding, storage, namespace, or trigger changes) -> Bindings, Cron, Secrets
  - `{{runtime.routeEntrypoint}}` route additions -> Runtime routes
  - `{{runtime.routeEntrypoint}}` scheduled-task or cron handlers -> Cron
  - `.github/workflows/**` -> Operator notes
  - any new `env.<NAME>` reference without matching configured secret-management documentation -> Secrets
- each surface must resolve to either "none" or a concrete operator-actionable line
- if the change is a migration, record apply order and whether it is online-safe
- populate `reports.delivery.deploymentImpact` in state with the same content
- the walkthrough file mirrors this section verbatim

A "none" verdict is acceptable and expected for doc-only or infra-only changes. What is not acceptable is leaving the section blank.

## User-facing Change Authoring

Delivery-agent writes the "User-facing change" line itself by default. Rule:

- read the final diff, `reports.qa.summary`, `reports.qualityGate.uxExpert`, and the walkthrough
- write one sentence in product voice, directly useful to configured release-notes aggregation (no task IDs, no internal phase slang)
- self-assess `productVoiceConfidence` as `high` or `low`

Set `productVoiceConfidence: "low"` when any of the following are true:

- task complexity was `RED`
- `uxExpert` produced accepted findings in QUALITY_GATE
- diff touches agent prompt contracts or tier-1 prompt assembly
- diff changes user-visible copy, status rendering, or notifier fan-out
- diff changes approval-flow or registration flow semantics

On `low`, route a single lightweight `product-manager` call with the draft line and ask for a pass/revise verdict. Use the revised line in the PR body. Do not loop — one round.

On `high`, ship the line as drafted.

If `hasUserImpact` is false (internal refactor, CI fix, infra-only change), the literal text `Internal/infra only — no user-facing change` goes in the PR body. Release-notes aggregation skips these entries.

## Release Announcement Authoring

**This step runs after User-facing Change authoring and before PR open.**

Call the delivery-agent's expanded contract (step 6a) to produce the two operator-paste strings:

- **`releaseAnnouncementAdmins`** (always): deployment-impact-flavored block for the configured operator/admin release-announcement destination. Prefix `Deploy <date> — <one-line summary>`, body covers migrations / secrets / cron / bindings, append the user-facing line if applicable.
- **`releaseAnnouncementUsers`** (only when `userFacingChange ≠ "Internal/infra only — no user-facing change"` literal): operator-readable copy of the user-facing line for the configured user-facing release-announcement destination.

Surface both strings in:
- The PR body under copy-prefix headings:
  `## Copy into configured admin release announcement destination`
  `## Copy into configured user release announcement destination` (only when authored)
- The walkthrough's **Release-notes disposition** section.

Write both into `reports.delivery.releaseAnnouncementAdmins` and `reports.delivery.releaseAnnouncementUsers` in state. Blank values are a contract bug; omitting `releaseAnnouncementUsers` when it is not applicable is correct.

## Release Notes Aggregation

Feature-PR deliveries do not write directly to the configured release-notes artifact.

On a `{{git.releaseFlow}}` release-sync delivery only, delivery-agent:

1. Finds all squash commits between the previous release tip and the new one.
2. For each PR, reads its "User-facing change" section.
3. Aggregates non-empty entries into a new configured release-notes block with:
   - date
   - release PR link
   - **What's new** — user-facing lines, deduplicated and lightly grouped
   - **Under the hood** — operator-visible items pulled from "Deployment impact" (migrations, new cron, new secrets)
   - **Links** — collapsed footer with task IDs + PR links
4. Prepends the block to the configured release-notes artifact. Never rewrites prior blocks.

## Required Agent Instructions

The `delivery-agent` prompt must require:

- walkthrough creation from `the repo-local walkthrough template`
- repo-doc updates for changed contracts
- `{{artifacts.statusFile}}` hygiene and updates when shipped work changes current product or repo truth
- fresh verification evidence, not invented commands
- Deployment Impact computed from final diff, mirrored into state and walkthrough
- User-facing change authored by delivery-agent with `productVoiceConfidence` self-assessment; lightweight `product-manager` pass only on `low`
- Release announcement strings authored per step 6a: `releaseAnnouncementAdmins` always, `releaseAnnouncementUsers` only when user-facing; surfaced in PR body under copy-prefix headings and in the walkthrough Release-notes disposition section
- release-notes aggregation only on `{{git.releaseFlow}}` release-sync deliveries
- full git flow: PR → squash merge → branch delete → configured local cleanup
- explicit worktree postcondition evidence after cleanup: {{git.worktreePostcondition}}
- explicit evidence from `{{git.deliveryStateCommand}}`, not hand-written git status paraphrase
- explicit close-out wording that separates `{{git.integrationBranch}}` delivery, `{{git.releaseBranchLabel}}` release status, and local worktree parking status
- no PR-only stop unless the user explicitly asks for it

## Task Source Close-out

If the task originated in a backlog file (`{{artifacts.backlogFile}}` or `{{artifacts.phaseRoot}}/<phase-token>/tasks.md`), mark it as completed there **in the same delivery PR**, not as a follow-up.

This is the rule that prevents stale-status drift: shipped tickets that don't carry SHIPPED markers confuse future sessions and reconciliation passes.

Concrete contract:

1. **In the same diff that closes the task**, update both:
   - the **Task Index row** in `{{artifacts.phaseRoot}}/phase-<phase-token>/tasks.md` (Status column → `SHIPPED [#N](url)`)
   - the **task body** `Status:` field (recommended literal: `✅ SHIPPED — [PR #N](url)`)
2. **Pre-flight grep** before opening the delivery PR:

   ```bash
   grep -n "<taskId>" {{artifacts.backlogFile}} {{artifacts.phaseRoot}}/phase-<phase-token>/tasks.md
   ```

   Confirm the SHIPPED marker is present on every match. If a Task Index header table exists for the phase, confirm the Status cell is filled — empty cells are the recurring failure mode.
3. Index row + body must agree. Mismatch is a contract bug.

If no source backlog entry exists for the task, skip this step.

**Splitting the SHIPPED marker into a follow-up doc-tracker PR is forbidden.** It has caused real downstream confusion in this repo. The marker change is small (one or two lines) and belongs in the delivery PR alongside the actual change.

## State Update

Record:

- `walkthroughFile`
- `docsUpdated`
- `commit`
- `pr`
- `followUpsCaptured`
- `lessonsSaved`
- `userFacingChange` — the line written for the PR body, or `"Internal/infra only — no user-facing change"`
- `releaseAnnouncementAdmins` — always authored; deployment-impact-flavored block for the configured operator/admin release-announcement destination
- `releaseAnnouncementUsers` — authored only when `userFacingChange ≠ "Internal/infra only — no user-facing change"`; omit when not applicable
- `productVoiceConfidence` — `high` or `low`; must be `high` by the time delivery closes (post-PM pass if needed)
- `deploymentImpact` — structured object mirroring the PR body section (migrations, bindings, secrets, cron, runtimeRoutes, operatorNotes)
- `releaseNotesAggregated` — `true` only on release-sync deliveries that updated the configured release-notes artifact
