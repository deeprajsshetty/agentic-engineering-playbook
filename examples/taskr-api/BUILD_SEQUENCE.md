# BUILD_SEQUENCE — Taskr API v1

_Derived from `CONTRACT.md` (frozen 2026-10-12). One unit = one verified commit._

| # | Unit | Expected scope | Verified when… | Status |
|---|---|---|---|---|
| 1 | Scaffold, `GET /health`, error envelope, 404 + 500 handlers, test harness | `package*.json`, `tsconfig.json`, `vitest.config.ts`, `src/app.ts`, `src/server.ts`, `src/errors.ts`, `tests/health.test.ts` | `tsc` exit 0; health → 200 `{status:"ok"}`; unknown path → 404 `NOT_FOUND` envelope; thrown error → 500 `INTERNAL_ERROR` with generic message | ✅ |
| 2 | `POST /api/v1/tasks` with validation, store interface + in-memory store | `src/types.ts`, `src/store/*`, `src/services/tasks.ts`, `src/routes/tasks.ts`, `src/validation.ts`, `src/app.ts`, `tests/tasks.create.test.ts` | 201 with full Task; defaults applied; `VALIDATION_ERROR` with `details.fields` for missing title, long title, bad priority, bad date, unknown field | ✅ |
| 3 | `GET /api/v1/tasks` — filters + cursor pagination | `src/routes/tasks.ts`, `src/services/tasks.ts`, `src/store/*`, `src/validation.ts`, `src/cursor.ts` (added during build), `tests/tasks.list.test.ts` | Pages of `limit`; following `nextCursor` visits every task once; filters before paging; `VALIDATION_ERROR` for bad params; `INVALID_CURSOR` for forged cursors | ✅ |
| 4 | `GET` + `PATCH /api/v1/tasks/:id` | `src/routes/tasks.ts`, `src/services/tasks.ts`, `src/store/*`, `src/validation.ts`, `tests/tasks.item.test.ts` | 200 get; PATCH updates fields and `updatedAt`, `dueDate: null` clears; empty/unknown body → `VALIDATION_ERROR`; unknown id → `TASK_NOT_FOUND` | ✅ |
| 5 | `DELETE /api/v1/tasks/:id` | `src/routes/tasks.ts`, `src/services/tasks.ts`, `src/store/*`, `tests/tasks.delete.test.ts` | 204 with empty body; second delete → `TASK_NOT_FOUND`; deleted task gone from list; pagination still visits every remaining task once after a delete mid-walk (AC4 — moved here from unit 3, which has no delete yet) | ✅ |
| 6 | Contract hardening: `INVALID_JSON`, contract-coverage test | `src/app.ts`, `src/errors.ts`, `tests/contract.test.ts` | Malformed JSON → 400 `INVALID_JSON`; a test asserts every code in CONTRACT §5 appears in at least one test | ✅ |

Status: ⏳ not started · 🔨 in progress · ✅ verified + committed

## Definition of "verified" for every unit
1. Typecheck exit 0, full suite green with 0 skipped, diff limited to the unit's scope, no secrets (the `/verify-unit` checks).
2. Behaviour matches `CONTRACT.md` (`contract-check` skill).
3. No earlier unit regressed (full suite).
4. One conventional commit: `feat(taskr-api): …` / `test(taskr-api): …`.
