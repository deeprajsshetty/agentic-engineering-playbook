# API conventions — taskr-api

## Adding or changing an endpoint
1. The endpoint is in `CONTRACT.md` §4 with its errors in §5. If not, stop — contract first.
2. **Validation** in `src/validation.ts` as a zod schema with `.strict()` (unknown fields → `VALIDATION_ERROR`). Parse with `parseOrThrow(schema, input)`, which converts zod issues to `details.fields`.
3. **Route** in `src/routes/tasks.ts`: validate → call one function in `src/services/tasks.ts` → `res.status(...).json(...)`. No business logic, no store access.
4. **Service** in `src/services/tasks.ts`: business rules; receives the `TaskStore`; throws `AppError(code, status, message, details?)`.
5. **Store** in `src/store/`: add the method to the `TaskStore` interface first, then the in-memory implementation.
6. Express 5 forwards rejected promises to the error handler — don't wrap handlers in try/catch.

## Errors
- Only codes from `CONTRACT.md` §5. Messages are human-readable and never include internals.
- Unknown errors → `500 INTERNAL_ERROR`, message `"Something went wrong"`; the cause is logged with `console.error` in the error handler only.

## Responses
- Return `Task` objects exactly as `CONTRACT.md` §3 — the store's internal fields (e.g. `seq`) never leave the service.
- Lists: `{ items, nextCursor }`; `nextCursor` is opaque (base64url).
