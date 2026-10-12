<!-- GENERATION-PROMPT:START
Use when: PRD approved; before any implementation. Run in Plan Mode (Shift+Tab until "plan mode").

```text
I need a CONTRACT.md for [product]. Read PRD.md first. Before producing anything, ask me
clarifying questions one at a time until you're 95% confident. Use the playbook's templates/CONTRACT.md
as the structure. It must cover:
- acceptance criteria that define "done" for the whole project (each checkable),
- the data model: every field, its type, nullability and where its value comes from,
- every endpoint: method, path, auth, request shape, success response, and typed error
  cases (HTTP status + error.code) using the envelope { error: { code, message, details? } },
- pagination, idempotency and ordering rules,
- the sequencing rule if parallel sessions will build against it.
Never invent fields or codes I haven't agreed to. Don't write any code.
```

Good output: two developers could implement it identically; every error code is UPPER_SNAKE and appears in the error catalogue; every acceptance criterion maps to a test or a manual check.
GENERATION-PROMPT:END -->
# CONTRACT — [Product name] API v1

_Status: Draft | Frozen for build | Amended [date] · Source of truth for all sessions._

## 1. Acceptance criteria
| # | Criterion | Verified by |
|---|---|---|
| AC1 | [e.g. All endpoints in §4 respond as specified] | [Integration tests] |
| AC2 | [e.g. Every error uses the §2 envelope] | [Contract tests per error code] |
| AC3 | [e.g. `npm test` passes with 0 skipped; `tsc --noEmit` exits 0] | [/verify-app] |

## 2. Conventions
- Base path: `/api/v1`. Content type: `application/json`.
- Auth: `Authorization: Bearer <token>` on every endpoint unless marked **public**.
- Field names: `camelCase`. Timestamps: ISO-8601 UTC strings. IDs: [string UUID / integer].
- **Error envelope** (every non-2xx response):
  ```json
  { "error": { "code": "UPPER_SNAKE_CASE", "message": "Human-readable, safe to show", "details": {} } }
  ```
  `details` is optional and structured (e.g. `{ "fields": { "title": "Required" } }`).
- **Pagination** (all list endpoints): `?cursor=<opaque>&limit=<1-100, default 20>` → `{ "items": [], "nextCursor": "<opaque>" | null }`.

## 3. Data model
### [Resource]
| Field | Type | Nullable | Source / rule |
|---|---|---|---|
| `id` | string (UUID) | no | Server-generated |
| `[field]` | [type] | [yes/no] | [Client input, validated: …] / [derived from …] |
| `createdAt` | string (ISO-8601) | no | Server-set on create |

## 4. Endpoints
### 4.1 `[METHOD] /api/v1/[resource]` — [purpose]
- **Auth:** [required / public]
- **Request:** [query params / body schema with types, required, limits]
- **200/201 response:** [shape]
- **Errors:**
  | Status | `error.code` | When |
  |---|---|---|
  | 400 | `VALIDATION_ERROR` | [Body fails schema; `details.fields` lists each] |
  | 401 | `UNAUTHORIZED` | [Missing/invalid token] |
  | 404 | `[RESOURCE]_NOT_FOUND` | [No resource with that id for this user] |

## 5. Error catalogue
| `error.code` | Status | Endpoints |
|---|---|---|
| `VALIDATION_ERROR` | 400 | [4.1, 4.2] |
| `UNAUTHORIZED` | 401 | [all non-public] |
| `INTERNAL_ERROR` | 500 | [all — generic message only] |

## 6. Sequencing (parallel builds)
- [e.g. Server-logic session ships and passes tests before the schema session merges.]
- Both sides verify against **this file**; neither merges because it finished first.

## 7. Change log
| Date | Section | Change | Approved by |
|---|---|---|---|
