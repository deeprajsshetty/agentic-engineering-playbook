---
name: verify-app
description: Full-application verification after a significant change — typecheck, lint, full test suite, build. May fix implementation code and re-run, but never weakens tests. Use before merging or after a refactor.
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(npm test *)
  - Bash(npm run *)
  - Bash(npx tsc *)
  - Bash(git diff *)
  - Bash(git status *)
---

# /verify-app — full suite, fix-and-rerun allowed

Use the commands in the **Commands** section of `CLAUDE.md` if present; otherwise the defaults below. Skip a step only if the project genuinely has no such script, and say so.

## Steps

1. **Typecheck** — `npm run typecheck`, else `npx tsc --noEmit`.
2. **Lint** — `npm run lint` (if defined).
3. **Tests, serially** — `npm test -- --runInBand` for Jest, `npm test` for Vitest. All tests, no filters.
4. **Build** — `npm run build` (if defined).
5. If anything fails: diagnose the root cause, fix the **implementation**, and re-run from step 1. Maximum **3** fix-and-rerun cycles. Edits are deliberately not pre-approved in `allowed-tools`: each fix prompts, and that prompt is your review step.

## Hard limits

- Never delete, skip (`.skip`, `xit`, `--testPathIgnorePatterns`), loosen or rewrite a test to make it pass. If you believe a test is wrong, stop and say why — the contract decides, not the agent.
- Never touch files under `migrations/`, `.github/`, `.claude/`, or any `.env*` file.
- Stay within the files the failure points to. If a fix would touch more than 5 files, stop and propose a plan instead.

## Stop conditions

- All steps pass → report.
- 3 cycles used and something still fails → stop and report what remains.
- The fix requires a contract or schema change → stop; that is a planning decision.

## Report — use exactly this format

```text
APP VERIFIED | APP FAILED
Typecheck : PASS | FAIL
Lint      : PASS | FAIL | N/A
Tests     : PASS | FAIL — <n passed / n failed / n skipped>
Build     : PASS | FAIL | N/A
Fixes made: <file — one-line reason, per fix; or "none">
Remaining : <failures still open; or "none">
```
