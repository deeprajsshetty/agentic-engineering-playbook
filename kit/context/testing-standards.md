# Testing standards

> **Tailor this file.** Golden Path defaults below; `/onboard-repo` rewrites it for this repository.

## Tools

- **Vitest** for unit and integration tests (Jest is acceptable in existing repos — follow what is there).
- **supertest** for HTTP-level tests against the app object (no listening port needed).
- **Playwright** for end-to-end UI flows, if the project has a UI.

## Layout and naming

- Tests live in `tests/` mirroring `src/` (or co-located `*.test.ts` — pick one per repo and say which in `CLAUDE.md`).
- File name: `<resource>.test.ts`, lowercase, kebab-case.
- `describe` = the endpoint or module; `it` = the behaviour in plain English: `it("returns 404 TASK_NOT_FOUND for an unknown id")`.

## What every endpoint needs

1. Happy path — status, full response shape.
2. One test **per error code** the contract lists for that endpoint, asserting status **and** `error.code`.
3. Edge cases the contract implies (empty list, pagination end, max length).

## Rules

- Deterministic: no real network calls, no real third-party APIs, no `Date.now()` without a fake clock, no reliance on test order.
- Each test sets up its own state; reset in-memory stores in `beforeEach`.
- Integration tests against a real database use a dedicated test project/schema — never production.
- No `.skip` / `.only` committed. Zero skipped tests is part of "verified".

## Commands

```bash
npm test                      # full suite — what /verify-unit runs
npx vitest run tests/<file>   # one file while iterating
```
