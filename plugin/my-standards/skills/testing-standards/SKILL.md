---
name: testing-standards
description: Personal default testing standards for TypeScript projects (Vitest + supertest, Playwright for UI). Use when writing, fixing or reviewing tests — unless the project has its own context/testing-standards.md, which takes precedence.
---

# Testing standards — personal defaults

**Precedence:** a project's `context/testing-standards.md` or its own `testing-standards` skill wins.

## Rules

1. **Contract-driven coverage.** Every endpoint: happy path + one test per contracted error code, asserting status *and* `error.code`.
2. **Plain-English names.** `it("returns 404 TASK_NOT_FOUND for an unknown id")` — behaviour, not implementation.
3. **Deterministic.** No real network or third-party APIs; fake the clock; reset state in `beforeEach`; no order dependence.
4. **Real where it's cheap.** HTTP tests via supertest against the app object; in-memory or a dedicated test database — never production.
5. **Zero skips.** No committed `.skip`, `.only` or `todo`. A skipped test means the unit is not verified.
6. **Never weaken a test to pass.** If a test is wrong, explain why and get the contract or the director to change first.

## Layout

`tests/<resource>.test.ts` mirroring `src/`, or co-located `*.test.ts` — whichever the repo already uses. Shared fixtures under `tests/helpers/`.

## Commands

```bash
npx vitest run                 # full suite
npx vitest run tests/<file>    # one file
npx vitest --coverage          # when coverage is requested
```
