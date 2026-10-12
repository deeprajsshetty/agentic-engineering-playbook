---
name: verify-unit
description: Report-only verification gate for one atomic build unit — typecheck, tests, diff-scope and secrets check. Run after finishing a unit, before committing. Never fixes anything.
argument-hint: "[expected scope globs, e.g. src/tasks/** tests/tasks/**]"
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
---

# /verify-unit — report only, never fix

**Expected scope:** $ARGUMENTS

If no scope was given, take it from the current unit in `BUILD_SEQUENCE.md`. If it is still unknown, list every changed file and mark the scope check `UNKNOWN` (which counts as a failure).

## Rules

- Do **not** edit, create, delete, stage or commit anything. A failing check is reported, not repaired — fixing is a separate, deliberate step the director chooses.
- Use the commands in the **Commands** section of `CLAUDE.md` if it exists. Otherwise use the defaults below.
- Never substitute a weaker check (e.g. running one test file instead of the suite) without saying so in the report.

## Checks

1. **Typecheck** — `npm run typecheck` if that script exists in `package.json`, else `npx tsc --noEmit`. PASS = exit code 0.
2. **Tests** — `npm test`. Record passed / failed / skipped counts. PASS = exit 0, 0 failed, 0 skipped (skips count as failure unless `CLAUDE.md` explicitly allows them).
3. **Diff scope** — `git diff --name-only HEAD` plus `git ls-files --others --exclude-standard`. PASS = every path matches the expected scope.
4. **Secrets** — scan the added lines of `git diff HEAD` and untracked files for credential-shaped strings (API keys, tokens, private keys, connection strings with passwords). PASS = none found. Environment variable *names* are fine; literal values are not.

## Stop conditions

- A required tool is missing (no `package.json`, no `tsconfig.json`): mark that check `SKIPPED` with the reason. `SKIPPED` on typecheck or tests means the unit is **not** verified.
- A command hangs for more than 5 minutes: stop it and report `FAIL — timed out`.

## Report — use exactly this format

```text
UNIT VERIFIED | UNIT FAILED
Typecheck : PASS | FAIL | SKIPPED — <detail or first 5 errors>
Tests     : PASS | FAIL | SKIPPED — <n passed, n failed, n skipped; failing test names>
Diff scope: PASS | FAIL | UNKNOWN — <out-of-scope files, if any>
Secrets   : PASS | FAIL — <file:line, if any>
Next      : <one sentence: commit with /ship-unit, or what must be fixed first>
```

Print `UNIT VERIFIED` only when every line is `PASS`.
