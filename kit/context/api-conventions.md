# API conventions

> **Tailor this file.** It ships with Golden Path defaults (TypeScript, Next.js App Router or Express, Supabase). `/onboard-repo` rewrites it to describe *this* repository. Delete anything that does not apply.

## Where things live

| Layer | Location | Responsibility |
|---|---|---|
| Route / handler | `app/api/<resource>/route.ts` (Next.js) or `src/routes/<resource>.ts` (Express) | Parse + validate input, call one service, map result to HTTP |
| Service | `src/services/<resource>.ts` | Business rules. No HTTP objects (`req`, `res`, `NextResponse`) |
| Data access | `src/db/<resource>.ts` | Queries only. The only layer that talks to Supabase/SQL |
| Types | `src/types/` | Shared request/response types, derived from `CONTRACT.md` |

Dependency direction: **route → service → data access**. Never the reverse; never skip a layer.

## Naming

- Files: `kebab-case.ts`. Resource folders/routers: lowercase plural (`tasks`, `messages`).
- JSON fields: `camelCase`, exactly as written in `CONTRACT.md`.
- Base path: `/api/v1` for client-facing endpoints. Webhooks live outside it (e.g. `/webhook/<provider>`).

## Validation

- Validate every request body, query and path param at the route, before calling the service.
- Unknown fields are rejected (`400`), not silently dropped, unless the contract says otherwise.

## Errors

Every non-2xx response uses one envelope:

```json
{ "error": { "code": "TASK_NOT_FOUND", "message": "No task with id 42", "details": {} } }
```

- `code`: `UPPER_SNAKE_CASE`, listed in `CONTRACT.md`. Never invent one in code.
- `message`: human-readable, safe to show; never includes stack traces, SQL or secrets.
- `details`: optional, structured (e.g. field-level validation errors).
- Throw a typed `AppError(code, status, message, details?)` from services; one error middleware/helper maps it to the envelope.

## Pagination

Cursor-based on every list endpoint: request `?cursor=<opaque>&limit=<1-100>`, response `{ "items": [...], "nextCursor": string | null }`.

## Auth

`Authorization: Bearer <JWT>` on every endpoint except explicitly public ones (health, OAuth callback, webhooks with their own verification). Auth failures return `401 UNAUTHORIZED`.
