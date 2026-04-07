---
name: desloppify
description: "Desloppify: сканер техдолга (deprecated)."
---

<!-- desloppify-begin -->
<!-- desloppify-skill-version: 6 -->

# Desloppify

## 1. Your Job

Maximise the **strict score** honestly. Your main cycle: **scan → plan → execute → rescan**. Follow the scan output's **INSTRUCTIONS FOR AGENTS** — don't substitute your own analysis.

**Don't be lazy.** Do large refactors and small detailed fixes with equal energy. If it takes touching 20 files, touch 20 files. If it's a one-line change, make it. No task is too big or too small — fix things properly, not minimally.

## 2. The Workflow

Three phases, repeated as a cycle.

### Phase 1: Scan and review — understand the codebase

```bash
desloppify scan --path .       # analyse the codebase
desloppify status              # check scores — are we at target?
```

After scanning, **always run `desloppify next`** — it tells you exactly what to do, in order. Don't interpret the scan output yourself or ask the user what to do. Just run `next` and follow its instructions.

The scan will tell you if subjective dimensions need review. Follow its instructions. To trigger a review manually:
```bash
desloppify review --prepare    # then follow your runner's review workflow
```

### Phase 2: Plan — decide what to work on

After reviews, triage stages and plan creation appear in the execution queue surfaced by `next`. Complete them in order — `next` tells you what each stage expects in the `--report`:
```bash
desloppify next                                        # shows the next execution workflow step
desloppify plan triage --stage observe --report "themes and root causes..."
desloppify plan triage --stage reflect --report "comparison against completed work..."
desloppify plan triage --stage organize --report "summary of priorities..."
desloppify plan triage --complete --strategy "execution plan..."
```

For automated triage: `desloppify plan triage --run-stages --runner codex` (Codex) or `--runner claude` (Claude). Options: `--only-stages`, `--dry-run`, `--stage-timeout-seconds`.

Then shape the queue. **The plan shapes everything `next` gives you** — `next` is the execution queue, not the full backlog. Don't skip this step.

```bash
desloppify plan                          # see the living plan details
desloppify plan queue                    # compact execution queue view
desloppify plan reorder <pat> top        # reorder — what unblocks the most?
desloppify plan cluster create <name>    # group related issues to batch-fix
desloppify plan focus <cluster>          # scope next to one cluster
desloppify plan skip <pat>              # defer — hide from next
```

### Phase 3: Execute — grind the queue to completion

Trust the plan and execute. Don't rescan mid-queue — finish the queue first.

**Branch first.** Create a dedicated branch — never commit health work directly to main:
```bash
git checkout -b desloppify/code-health    # or desloppify/<focus-area>
desloppify config set commit_pr 42        # link a PR for auto-updated descriptions
```

**The loop:**
```bash
# 1. Get the next item from the execution queue
desloppify next

# 2. Fix the issue in code

# 3. Resolve it (next shows the exact command including required attestation)

# 4. When you have a logical batch, commit and record
git add <files> && git commit -m "desloppify: fix 3 deferred_import findings"
desloppify plan commit-log record      # moves findings uncommitted → committed, updates PR

# 5. Push periodically
git push -u origin desloppify/code-health

# 6. Repeat until the queue is empty
```

Score may temporarily drop after fixes — cascade effects are normal, keep going.
If `next` suggests an auto-fixer, run `desloppify autofix <fixer> --dry-run` to preview, then apply.

**When the queue is clear, go back to Phase 1.** New issues will surface, cascades will have resolved, priorities will have shifted. This is the cycle.

## 3. Reference

### Key concepts

- **Tiers**: T1 auto-fix → T2 quick manual → T3 judgment call → T4 major refactor.
- **Auto-clusters**: related findings are auto-grouped in `next`. Drill in with `next --cluster <name>`.
- **Zones**: production/script (scored), test/config/generated/vendor (not scored). Fix with `zone set`.
- **Wontfix cost**: widens the lenient-strict gap. Challenge past decisions when the gap grows.

### Scoring

Overall score = **25% mechanical** + **75% subjective**.

- **Mechanical (25%)**: auto-detected issues — duplication, dead code, smells, unused imports, security. Fixed by changing code and rescanning.
- **Subjective (75%)**: design quality review — naming, error handling, abstractions, clarity. Starts at **0%** until reviewed. The scan will prompt you when a review is needed.
- **Strict score** is the north star: wontfix items count as open. The gap between overall and strict is your wontfix debt.
- **Score types**: overall (lenient), strict (wontfix counts), objective (mechanical only), verified (confirmed fixes only).

### Reviews

Four paths to get subjective scores:

- **Local runner (Claude)**: `desloppify review --prepare` → launch parallel subagents → `desloppify review --import merged.json` — see Claude overlay below.
- **Cloud/external**: `desloppify review --external-start --external-runner claude` → follow session template → `--external-submit`.
- **Manual path**: `desloppify review --prepare` → review per dimension → `desloppify review --import file.json`.

**Integrity rules:** Score from evidence only — no prior chat context, score history, or target-threshold anchoring. When evidence is mixed, score lower and explain uncertainty. Assess every requested dimension; never drop one.

### Quick reference

```bash
desloppify next --count 5                         # top 5 execution items
desloppify next --cluster <name>                  # drill into a cluster
desloppify backlog --count 5                      # top 5 backlog items outside execution
desloppify show <pattern>                         # filter by file/detector/ID
desloppify show --status open                     # all open findings
desloppify plan skip --permanent "<id>" --note "reason" --attest "..." # accept debt
desloppify exclude <path>                         # exclude a directory from scanning
desloppify config show                            # show all config including excludes
desloppify scan --path . --reset-subjective       # reset subjective baseline to 0
```

## 4. Claude Code Overlay

Use Claude subagents for subjective scoring work.

### Review workflow

1. **Prepare**: `desloppify review --prepare` — writes `query.json` and `.desloppify/review_packet_blind.json`.
2. **Launch subagents**: Split the review across N parallel Claude subagents (one message, multiple Task calls). Each agent reviews a subset of dimensions.
3. **Merge & import**: Merge agent outputs, then `desloppify review --import merged.json --manual-override --attest "Claude subagents ran blind reviews against review_packet_blind.json" --scan-after-import`.

#### How to split dimensions across subagents

- Read `dimension_prompts` from `query.json` for dimensions with definitions and seed files.
- Read `.desloppify/review_packet_blind.json` for the blind packet (no score targets, no anchoring data).
- Group dimensions into 3-4 batches by theme (e.g., architecture, code quality, testing, conventions).
- Launch one Task agent per batch with `subagent_type: "general-purpose"`. Each agent gets:
  - The codebase path and list of dimensions to score
  - The blind packet path to read
  - Instruction to score from code evidence only, not from targets
- Each agent writes output to `results/batch-N.raw.txt` (matching the batch index). Merge assessments (average overlapping dimension scores) and concatenate findings.

### Subagent rules

1. Each agent must be context-isolated — do not pass conversation history or score targets.
2. Agents must consume `.desloppify/review_packet_blind.json` (not full `query.json`) to avoid score anchoring.

<!-- desloppify-overlay: claude -->
<!-- desloppify-end -->
