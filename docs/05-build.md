# 05 — Build: atomic units, in parallel where it's safe

## Goal
Build the system one verified unit at a time — and run independent units in parallel, isolated worktrees — so every commit is reviewable and every branch converges on the same contract.

## Which surface
- **Claude Code Desktop** — the default: diff pane with inline comments, Browser (preview) pane, side-by-side worktree sessions, PR status.
- **CLI** — equally capable; better for scripting and IDE integration. `claude --worktree <name>` for parallel work.

## Inputs → Outputs
- **In:** `CLAUDE.md`, `CONTRACT.md`, `BUILD_SEQUENCE.md`, the kit's skills and subagents.
- **Out:** one conventional commit per verified unit; branches merged only when both sides pass against the contract.

## Steps

### 1. Start from a clean, committed baseline
```bash
git status            # must be clean
git switch -c feat/<feature>
```

### 2. Build one unit
Use the [precise unit prompt](../prompts/build/README.md#1-the-precise-unit-prompt): which documents, exact deliverable, boundary, what verified looks like. For anything non-trivial, plan first (`Shift+Tab` → `⏸ plan mode on`, or `/plan-feature`). Before using an unfamiliar library API, check current docs with Context7.

### 3. Review the diff while it's small
Desktop: click the `+N −M` indicator → diff pane; comment on lines and submit together (`Cmd/Ctrl+Enter`). CLI: `git diff`. For surgical fixes, use a [targeted correction](../prompts/correction-patterns.md#1-targeted-correction) — one per message.

### 4. Verify and ship
```text
/verify-unit src/tasks/** tests/tasks.test.ts
/ship-unit   src/tasks/** tests/tasks.test.ts
```
`/verify-unit` is report-only. If it says `UNIT FAILED`, fix deliberately, then re-run. Before shipping, [explain it back](../prompts/verify/README.md#2-explain-it-back). `/ship-unit` stages by explicit path and commits; it never pushes.

### 5. Parallel units in worktrees
Only when ownership is separable (no shared files) **and** both sides build against the same contract section.

**Desktop:** new session → select the **worktree** option next to the branch → one session per unit; open them side by side. Worktrees live under `.claude/worktrees/`.

**CLI:**
```bash
claude --worktree api-tasks       # terminal 1 → branch worktree-api-tasks
claude --worktree schema-tasks    # terminal 2
```

Setup for every repo that uses worktrees:
```bash
cp .worktreeinclude.example .worktreeinclude   # copies .env etc. into new worktrees
echo ".claude/worktrees/" >> .gitignore
```
Each worktree is a fresh checkout — run `npm install` there. First message in each session: the [orientation check](../prompts/build/README.md#4-parallel-sessions--orientation-check).

**The merge rule:**
```text
Session A verifies against CONTRACT.md §x ─┐
                                           ├─ merge only when BOTH pass
Session B verifies against CONTRACT.md §x ─┘
```
Neither merges because it finished first. If one side depends on the other (e.g. schema after server logic), write the sequencing rule into `CONTRACT.md` §6 and enforce it.

Use a side question (`/btw …`, or `Cmd/Ctrl+;` in Desktop) for questions that shouldn't steer the main thread.

### 6. Subagents for focused side-work
Ask by name — *"Use the test-writer subagent to cover every §4.3 error code."* For parallel edits inside one session, a subagent with `isolation: worktree` gets its own temporary worktree.

### 7. Push and open a PR
```bash
git push -u origin feat/<feature>
gh pr create --fill
```
Desktop shows a CI status bar for the PR (needs `gh`): turn on **Auto-fix CI & address comments** to let Claude fix failures, and **Auto-merge when ready** only with comprehensive CI and after you've reviewed the diff.

### When to use something else
- Tiny, obvious change: skip plan mode, still `/verify-unit`.
- Many similar mechanical edits across a codebase: the bundled `/batch <instruction>` skill decomposes and parallelises them.
- Unattended multi-turn work toward a checkable end state: `/goal` ([07](07-automate.md)).

## Verified when…
- [ ] Each commit corresponds to one `BUILD_SEQUENCE.md` unit and one `UNIT VERIFIED` report.
- [ ] `git log --oneline` reads as the build sequence, in order, in conventional commits.
- [ ] Parallel branches each pass `/verify-unit` before merging; the full suite passes after merging.
- [ ] No commit contains out-of-scope files.

## Three Standards check
- **Scale:** Could the next unit start from the repo + documents alone? Is shared logic extracted rather than copied between parallel branches?
- **Secure:** Did any unit add a dependency, env var or external call that wasn't in the plan?
- **Understand:** For the last unit — which layer did it touch, which contract line does it satisfy, where does the next unit plug in?

## Common mistakes
- Building three units before verifying the first — failures compound and diffs become unreviewable.
- Parallel sessions editing the same file — that's not parallel work, it's a merge conflict scheduled for later.
- Forgetting a worktree is a fresh checkout (no `node_modules`, no `.env`).
- `git add -A` on a unit commit — sweeps in debug files and unrelated edits.
- Fixing forward through a broken state instead of returning to the last verified commit.

## Course reference
Module 1 — Building a Website (atomic execution, build order). Module 3 — Parallel Sessions Test, Atomic Shipping and the Logic Surgeon Model. Module 4 — Worktree architecture, Building the Core Engine, Combining the Server and Schema Sessions.
