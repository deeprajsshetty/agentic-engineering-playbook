# CONTRACT — Taskr API v1

_Status: Frozen for build (2026-10-12), amended after audit (2026-10-12, see §7) · Source of truth for all sessions._

## 1. Acceptance criteria
| # | Criterion | Verified by |
|---|---|---|
| AC1 | Every endpoint in §4 responds with the specified status and body shape | Integration tests per endpoint |
| AC2 | Every error in §5 is produced by at least one test, with the §2 envelope | `tests/contract.test.ts` + per-endpoint tests |
| AC3 | Unknown body fields are rejected; invalid JSON is rejected | Tests for `VALIDATION_ERROR`, `INVALID_JSON` |
| AC4 | Pagination is stable: following `nextCursor` visits every task exactly once, even after deletes | Pagination tests |
| AC5 | `npx tsc --noEmit` exits 0; `npx vitest run` passes with 0 skipped | `/verify-unit`, CI |

## 2. Conventions
- Base path: `/api/v1` for resources; `/health` is outside it. JSON only.
- **No authentication in v1** (see PRD non-goals).
- Field names `camelCase`. Timestamps: ISO-8601 UTC strings (`2026-10-12T09:30:00.000Z`). Dates: `YYYY-MM-DD`. IDs: UUID v4 strings.
- **Error envelope** — every non-2xx response:
  ```json
  { "error": { "code": "UPPER_SNAKE_CASE", "message": "Human-readable, safe to show", "details": {} } }
  ```
  `details` is optional. For `VALIDATION_ERROR` it is `{ "fields": { "<field>": "<reason>" } }`, where `<field>` is a body or query field name, or `body` for a problem with the body as a whole (absent, not a JSON object, or an empty PATCH). An empty body sent as `application/json` parses as `{}`, so it reports the missing required fields instead.
- **Pagination**: `?cursor=<opaque>&limit=<1-100, default 20>` → `{ "items": Task[], "nextCursor": string | null }`. Order: creation order, oldest first. Cursors are opaque and signed by the server that issued them (instances configured with the same cursor secret count as one server); clients must not construct or modify them.
- **Methods**: `HEAD` is answered for every `GET` route (standard HTTP semantics, empty body). `OPTIONS` is not supported in v1 (no CORS) and returns `404 NOT_FOUND`.
- **Request bodies**: `Content-Type: application/json`, UTF-8 (or no charset), no `Content-Encoding`, at most 100 kB. Any other media type, charset or content encoding → `415 UNSUPPORTED_MEDIA_TYPE`. Duplicate JSON keys: the last value wins.
- **Paths** are case-sensitive and have no trailing slash; anything else is "any other path" (§4.7).
- **No conditional requests** in v1: responses carry no `ETag`, and `If-None-Match` is ignored.

## 3. Data model — Task
| Field | Type | Nullable | Source / rule |
|---|---|---|---|
| `id` | string (UUID v4) | no | Server-generated |
| `title` | string | no | Client; trimmed; 1–200 characters (Unicode code points, counted after trimming) |
| `priority` | `"low" \| "medium" \| "high"` | no | Client; default `"medium"` |
| `status` | `"open" \| "done"` | no | Server sets `"open"` on create; client may change via PATCH |
| `dueDate` | string (`YYYY-MM-DD`) | yes | Client; must be a real calendar date; `null` clears it |
| `createdAt` | string (ISO-8601) | no | Server-set on create |
| `updatedAt` | string (ISO-8601) | no | Server-set on create and every successful PATCH |

## 4. Endpoints

### 4.1 `GET /health`
- **200:** `{ "status": "ok" }`

### 4.2 `POST /api/v1/tasks` — create a task
- **Body:** `{ "title": string, "priority"?: Priority, "dueDate"?: string | null }` — no other fields.
- **201:** the created `Task`.
- **Errors:** `400 VALIDATION_ERROR` (missing/invalid/unknown fields, or a body that is not a JSON object), `400 INVALID_JSON`, `413 PAYLOAD_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE`.

### 4.3 `GET /api/v1/tasks` — list tasks
- **Query:** `status?` (`open`|`done`), `priority?` (`low`|`medium`|`high`), `limit?` (integer 1–100, default 20), `cursor?`.
- **200:** `{ "items": Task[], "nextCursor": string | null }` — `nextCursor` is `null` on the last page. Filters apply before pagination.
- **Errors:** `400 VALIDATION_ERROR` (bad `status`, `priority` or `limit`; unknown or repeated query params), `400 INVALID_CURSOR` (cursor empty, malformed, modified, or not issued by this server).

### 4.4 `GET /api/v1/tasks/:id` — get one task
- **200:** `Task`.
- **Errors:** `404 TASK_NOT_FOUND`.

### 4.5 `PATCH /api/v1/tasks/:id` — update a task
- **Body:** any non-empty subset of `{ "title", "priority", "status", "dueDate" }` with the same rules as §3 — no other fields.
- **200:** the updated `Task` (`updatedAt` changes).
- **Errors:** `400 VALIDATION_ERROR` (empty body, invalid or unknown fields, or a body that is not a JSON object), `400 INVALID_JSON`, `404 TASK_NOT_FOUND`, `413 PAYLOAD_TOO_LARGE`, `415 UNSUPPORTED_MEDIA_TYPE`.

### 4.6 `DELETE /api/v1/tasks/:id` — delete a task
- **204:** empty body.
- **Errors:** `404 TASK_NOT_FOUND`.

### 4.7 Any other path or method
Includes `OPTIONS` on any path and paths that cannot be URL-decoded. Request bodies sent to routes that don't accept one are ignored.
- **Errors:** `404 NOT_FOUND`.

## 5. Error catalogue
| `error.code` | Status | Endpoints |
|---|---|---|
| `VALIDATION_ERROR` | 400 | 4.2, 4.3, 4.5 |
| `INVALID_JSON` | 400 | 4.2, 4.5 |
| `INVALID_CURSOR` | 400 | 4.3 |
| `TASK_NOT_FOUND` | 404 | 4.4, 4.5, 4.6 |
| `NOT_FOUND` | 404 | 4.7 |
| `PAYLOAD_TOO_LARGE` | 413 | 4.2, 4.5 |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | 4.2, 4.5 |
| `INTERNAL_ERROR` | 500 | all — generic message only, cause logged server-side |

## 6. Sequencing
Single session; units in `BUILD_SEQUENCE.md` order. (A Postgres store, if added later, builds in a parallel worktree against §3 and merges only when this suite passes unchanged against it.)

## 7. Change log
| Date | Section | Change | Approved by |
|---|---|---|---|
| 2026-10-12 | all | v1 frozen for build | deeprajsshetty |
| 2026-10-12 | §2, §4.3 | Re-audit amendments (AUDIT_LOG.md round 2): media type/charset/encoding → 415 spelled out; exact paths; no ETag; cursor-secret wording; `body` key wording | deeprajsshetty |
| 2026-10-12 | §2, §3, §4.2, §4.3, §4.5, §4.7, §5 | Audit amendments (AUDIT_LOG.md 2026-10-12): `PAYLOAD_TOO_LARGE` and `UNSUPPORTED_MEDIA_TYPE` added; signed cursors; HEAD/OPTIONS behaviour; `details.fields.body`; title length in code points; cursor error cases clarified | deeprajsshetty |
