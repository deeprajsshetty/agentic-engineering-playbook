---
name: contract-check
description: Check API code against CONTRACT.md. Use whenever you add or change an endpoint, a request or response shape, a field name, a status code, or an error code — before reporting the work as done.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Contract check

`CONTRACT.md` is the synchronisation point between sessions, between frontend and backend, and between the plan and the code. If code and contract disagree, the **contract wins** unless the director changes it.

## Steps

1. Find the contract section for each endpoint you touched (method + path).
2. For each one, compare against the code:
   - **Path and method** — exact match, including base path (e.g. `/api/v1`).
   - **Request** — every field name, type, required/optional, and validation rule.
   - **Response** — every field name and type, exact casing, pagination shape (e.g. `nextCursor`).
   - **Status codes** — success and each error.
   - **Errors** — every named `error.code` the contract lists for this endpoint is produced somewhere, and no unlisted code is produced.
   - **Envelope** — every error body is `{ "error": { "code": string, "message": string, "details"?: object } }`.
3. Check that a test exists for the happy path and for **each** named error code.

## Constraints (checkable)

- No field is renamed, pluralised or re-cased relative to the contract.
- No endpoint returns a bare string or a non-envelope error.
- No error code is invented. A new code requires a contract change first.

## Output

```text
CONTRACT CHECK: PASS | FAIL
<METHOD /path> — request ✓|✗ · response ✓|✗ · statuses ✓|✗ · errors ✓|✗ · tests ✓|✗
Mismatches:
- CONTRACT.md §<ref> says <x>; <file:line> does <y>
```
