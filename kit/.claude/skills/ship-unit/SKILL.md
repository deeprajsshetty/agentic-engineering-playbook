---
name: ship-unit
description: Ship one verified atomic unit — re-run the verify-unit checks, stage only in-scope files by explicit path, and commit with a conventional commit message. Never pushes.
argument-hint: "[expected scope globs]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(npm test *)
  - Bash(npm run test *)
  - Bash(npm run typecheck *)
  - Bash(npx tsc *)
  - Bash(git diff *)
  - Bash(git status *)
  - Bash(git ls-files *)
  - Bash(git log *)
---

# /ship-unit — verify → stage in-scope → one commit

**Expected scope:** $ARGUMENTS (default: the current unit in `BUILD_SEQUENCE.md`)

## Steps

1. **Verify.** Run the four checks from the `verify-unit` skill (typecheck, tests, diff scope, secrets). If any is not PASS, **stop** and print the verify report. Do not stage anything.
2. **Stage by path.** `git add <path> <path> …` listing only in-scope files. Never `git add -A`, `git add .`, or a directory wildcard. Out-of-scope changes stay unstaged and are listed in the report.
3. **Write the message** — Conventional Commits:
   ```text
   <type>(<scope>): <imperative summary, ≤ 72 chars>

   Unit <n> of BUILD_SEQUENCE.md: <unit name>
   Verified: typecheck ✓ · tests <n> passed ✓ · scope ✓ · secrets ✓
   ```
   `type` ∈ feat, fix, refactor, test, docs, chore, ci, perf. `scope` = module or resource name.
4. **Commit** with that message (the permission prompt is your confirmation step).
5. **Do not push.** Pushing is the director's call.
6. If `BUILD_SEQUENCE.md` has a status column, propose (do not make) the status update for the next commit.

## Stop conditions

- Any verify check fails → stop with the verify report.
- Nothing in scope is changed → stop: "Nothing to ship."
- Staged files already exist that are out of scope → stop and ask.

## Report

```text
SHIPPED <short-sha> <type>(<scope>): <summary>
Files     : <n> staged — <paths>
Left out  : <out-of-scope changes, or "none">
Next unit : <from BUILD_SEQUENCE.md>
```
