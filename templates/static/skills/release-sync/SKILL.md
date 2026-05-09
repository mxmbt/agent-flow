---
provenance_class: repo_local
provenance_origin: repo-local
upstream_sync_policy: repo_canonical
provenance_reference: docs/architecture/AI-SKILL-PROVENANCE.md
provenance_url: repo-local
name: release-sync
description: "Explicit release operation: ship the configured integration branch to the configured release branch, then re-align parked worktrees."
argument-hint: "[<release-name>]"
---

# Release Sync

Use this skill only when the user explicitly asks to release, deploy, or ship to `{{git.releaseBranch}}`.

This is not the default meaning of `DELIVERY`.

- default `DELIVERY` -> feature branch merged into `{{git.integrationBranch}}`
- `release-sync` -> `{{git.releaseFlow}}`

If `{{git.releaseBranch}}` is `none configured`, stop and ask the user to configure a release branch before running this workflow.

## When To Use

Trigger this skill for requests like:

- "release"
- "release-sync"
- "ship to {{git.releaseBranch}}"
- "deploy {{git.releaseBranch}}"
- "cut production release"

## Required Preconditions

- `{{git.integrationRef}}` is the intended release candidate
- no known `FIX NOW` findings are intentionally being skipped
- the user explicitly wants `{{git.releaseBranch}}` updated now
- current workspace is clean enough for git operations

## Workflow

1. Verify remote truth:
   - inspect `{{git.integrationRef}}`
   - inspect `{{git.releaseRef}}`
   - identify commits/PRs that will be included
   - confirm `git diff {{git.integrationRef}} {{git.releaseRef}} -- {{artifacts.statusFile}} {{artifacts.roadmapFile}} {{artifacts.backlogFile}}` shows internally consistent docs
2. Pre-flight: aggregate user-facing changes into the configured release notes artifact if the project uses one. If the release contains any user-facing change, land that release-note update on `{{git.integrationBranch}}` **before** opening the release PR. Skip this step only for doc-only / infra-only releases or projects without release notes.
3. Create the release PR:

```bash
gh pr create --base {{git.releaseBranch}} --head {{git.integrationBranch}} --title "release: <name>" --body "..."
```

4. Squash-merge the release PR unless the repository release policy requires another merge strategy:

```bash
gh pr merge <N> --squash
```

If `gh pr merge` reports `mergeable: CONFLICTING`, do not retry blindly — see "Post-squash divergence playbook" below.

5. Re-align `{{git.integrationBranch}}` after the squash-release when repository policy permits it:

```bash
git fetch {{git.remoteName}}
git -C <repo-root> reset --hard {{git.releaseRef}}
git -C <repo-root> push --force-with-lease {{git.remoteName}} {{git.integrationBranch}}
```

In repos with branch protection on `{{git.integrationBranch}}` that blocks force-push, this push will be rejected. That is expected; `{{git.integrationBranch}}` will diverge from `{{git.releaseBranch}}` in commit graph but should stay content-equal. The next feature merge into `{{git.integrationBranch}}` may reconcile the graph naturally. The post-squash divergence playbook below kicks in only when a subsequent release-sync hits a 3-way merge conflict because of accumulated divergence.

6. Re-park all worktrees on the new `{{git.integrationRef}}` tip:

```bash
{{git.worktreeParkCommand}}
```

If running from the main worktree on `{{git.integrationBranch}}`, use the release-sync loop from `.claude/guides/worktree-workflow.md` for all parked worktrees.

7. Verify content equality:

```bash
git fetch {{git.remoteName}}
git diff {{git.releaseRef}} {{git.integrationRef}}
```

Empty output is the post-release contract. SHA divergence is acceptable when force-push to `{{git.integrationBranch}}` is blocked; **content divergence is not**.

8. Report final truth with:

```bash
{{git.deliveryStateCommand}} --ref {{git.integrationRef}}
```

## Post-squash divergence playbook

After every release-sync, `{{git.integrationBranch}}` and `{{git.releaseBranch}}` may be content-equal but commit-graph divergent. Branch protection on `{{git.integrationBranch}}` can block the force-push reset prescribed in step 5. This is normal between releases.

When the next release-sync after that runs, both branches may have new commits that touched the same files. The integration branch's individual commits and the release branch's earlier squash commits can modify the same lines from a common ancestor. GitHub's 3-way merge may then report `mergeable: CONFLICTING` even though the two branches are content-coherent.

When this happens:

1. Open a forward-merge branch from `{{git.integrationBranch}}`:

```bash
git checkout -b merge/sync-{{git.releaseBranch}}-into-{{git.integrationBranch}} {{git.integrationBranch}}
git merge {{git.releaseRef}}
```

2. Resolve any conflicts in **`{{git.integrationBranch}}`'s favor** when the integration branch is the newer authoritative content:

```bash
git checkout HEAD -- <conflicted file>
```

The resulting merge commit should have zero net file diff vs `{{git.integrationBranch}}` tip. It is purely a history-graph operation to give the next squash a clean lineage.

3. PR the forward-merge branch into `{{git.integrationBranch}}` if branch protection accepts merges via PR:

```bash
gh pr create --base {{git.integrationBranch}} --head merge/sync-{{git.releaseBranch}}-into-{{git.integrationBranch}} \
  --title "merge: sync {{git.releaseRef}} into {{git.integrationBranch}} to unblock release-sync"
gh pr merge --merge --delete-branch
```

Note: this PR is merged with **--merge** (a merge commit), not **--squash**. The merge commit is what brings release-branch history into `{{git.integrationBranch}}`.

4. Retry the release-sync. The release PR should now be `mergeable: CLEAN`.

This pattern is reusable for future post-squash divergence events in the same repository.

## Required Close-out

A release-sync close-out must state all three facts explicitly:

- `{{git.integrationBranch}}:` release-sync complete / not complete
- `{{git.releaseBranch}}:` updated / not updated
- `Local worktree:` parked hygiene pass / fail

The release-sync is **complete** when:

- `git diff {{git.releaseRef}} {{git.integrationRef}}` returns empty (content equality), AND
- release notes were prepended when the project requires them, or the release was explicitly doc/infra-only with no user-facing change, AND
- the deploy workflow ran successfully if the release included code changes.

SHA-level equality between `{{git.integrationBranch}}` and `{{git.releaseBranch}}` is **not** required when branch protection blocks the force-push reset; content equality is the actual invariant.
