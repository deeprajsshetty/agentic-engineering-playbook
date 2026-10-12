---
name: api-endpoints
description: Personal default conventions for creating API endpoints in TypeScript (Next.js route handlers or Express). Use when adding routes, handlers, controllers or services — unless the project has its own api-endpoints skill or context/api-conventions.md, which take precedence.
---

# API endpoints — personal defaults

**Precedence:** if the project has `context/api-conventions.md` or its own `api-endpoints` skill, follow that instead. These are the defaults for projects that don't.

## Shape

- Contract first: the endpoint, its fields, statuses and error codes exist in `CONTRACT.md` before any code.
- Layers: **route** (validate, call one service, map to HTTP) → **service** (business rules, no HTTP objects) → **data access** (queries only).
- Files `kebab-case.ts`; resources lowercase plural; JSON fields `camelCase` exactly as in the contract; client endpoints under `/api/v1`.
- Validate body, query and params at the route with a schema (e.g. zod). Reject unknown fields with `400 VALIDATION_ERROR` unless the contract says otherwise.

## Errors

- One envelope for every non-2xx: `{ "error": { "code": "UPPER_SNAKE", "message": "…", "details"?: {…} } }`.
- Services throw a typed `AppError(code, status, message, details?)`; one handler maps it. Unknown errors → `500 INTERNAL_ERROR` with a generic message; log the cause server-side.
- Never leak stack traces, SQL, tokens or other users' data in `message` or `details`.

## Lists

Cursor pagination: `?cursor=&limit=` (default 20, max 100) → `{ "items": [], "nextCursor": string | null }`.

## Before committing (checkable)

- [ ] Contract section exists and matches the code exactly
- [ ] Route contains no business logic or queries
- [ ] One test per contracted error code + the happy path
- [ ] Typecheck and full test suite pass
- [ ] No `any`, no `console.log`, no hard-coded secrets
