# CLAUDE.md — taskr-api

## What this is
A minimal task API (create, list, get, update, delete) with typed errors and cursor pagination. It is the worked example for the agentic engineering playbook, so **process is part of the product**: every change follows `BUILD_SEQUENCE.md` and ships as one verified commit. API-only; no auth in v1.

## Stack
- Node 22+, TypeScript strict (ESM, `NodeNext`), Express 5, zod for validation.
- Vitest + supertest. In-memory store behind the `TaskStore` interface.
- New dependencies require approval in the plan.

## Commands
```bash
npm install
npm run dev            # tsx watch src/server.ts → http://localhost:3000
npm run typecheck      # tsc --noEmit
npm test               # vitest run — what /verify-unit runs
npm run build          # tsc → dist/
```

## Structure
| Path | Owns |
|---|---|
| `src/app.ts` | `createApp({ store })` — middleware, routers, 404 and error handlers |
| `src/routes/` | HTTP only: parse/validate input, call one service function, map to status |
| `src/services/` | Business rules; throws `AppError`; no `req`/`res` |
| `src/store/` | `TaskStore` interface + in-memory implementation; the only layer holding data |
| `src/validation.ts` | zod schemas — the single place input rules live |
| `src/errors.ts` | `AppError` and the envelope helper |
| `tests/` | One file per endpoint group + `contract.test.ts` |

## Conventions
- API: `context/api-conventions.md`. Tests: `context/testing-standards.md`.
- Files `kebab-case.ts`; JSON fields exactly as in `CONTRACT.md` §3.
- Every error goes through `AppError` → error handler → `{ error: { code, message, details? } }`.

## Known structural problems
- None yet (greenfield). Storage is in-memory by design; data is lost on restart.

## Never do
- Never invent an endpoint, field or error code not in `CONTRACT.md` — amend the contract first.
- Never put business rules in routes or HTTP objects in services — keeps the store swappable.
- Never use module-level mutable state; tests build a fresh app with `createApp()` — shared state makes tests order-dependent.
- Never commit with failing or skipped tests; never read or write `.env*` (except `.env.example`).

## Verification policy
- After every unit: `/verify-unit <scope from BUILD_SEQUENCE.md>` → `UNIT VERIFIED`, then `/ship-unit`.
- Before calling v1 done: `/verify-app`, then `/audit CONTRACT.md` with the `code-reviewer` and `contract-auditor` subagents.

## Supporting documents
| File | What | Read when |
|---|---|---|
| `PRD.md` | Product, users, success criteria | Scoping |
| `CONTRACT.md` | Endpoints, shapes, error codes, acceptance criteria | Any API work |
| `BUILD_SEQUENCE.md` | Units and "verified when" | Starting or finishing a unit |
| `AUDIT_LOG.md` | Audit findings and resolutions | Before an audit or release |
| `WALKTHROUGH.md` | How this repo was built, commit by commit | Learning the workflow |
