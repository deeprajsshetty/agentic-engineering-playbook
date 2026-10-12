# Testing standards — taskr-api

- **Tools:** Vitest + supertest against `createApp()` — no listening port.
- **Isolation:** every test file builds its app in `beforeEach` with a fresh `createInMemoryStore()`. No shared state.
- **Files:** `tests/health.test.ts`, `tests/tasks.<create|list|item|delete>.test.ts`, `tests/contract.test.ts`.
- **Names:** plain English behaviour — `it("returns 404 TASK_NOT_FOUND for an unknown id")`.
- **Coverage rule:** each endpoint has a happy-path test and one test per error code it lists in `CONTRACT.md` §4. `tests/contract.test.ts` fails if any §5 code is never asserted.
- **Assertions:** status **and** `body.error.code` for errors; full shape (`toMatchObject` + type checks) for successes.
- **Determinism:** no sleeps; no real time dependence beyond "updatedAt changed" (use a store clock override if needed).
- **Never** commit `.skip`/`.only`; never weaken a test to pass.

```bash
npm test                              # full suite
npx vitest run tests/tasks.list.test.ts
```
