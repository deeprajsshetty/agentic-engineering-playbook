---
name: api-endpoints
description: How to add or change an API endpoint in this project. Use when creating routes, route handlers, controllers, services or request validation.
---

# Adding an API endpoint in this project

The project-specific conventions live in **`context/api-conventions.md`** — read it first and follow it exactly. It overrides any personal default (including the `my-standards` plugin).

## Always

1. Confirm the endpoint exists in `CONTRACT.md`. If it does not, stop and ask — contract first, code second.
2. Follow the file placement, naming and layering in `context/api-conventions.md`.
3. Validate input at the edge; return contract error codes in the standard envelope.
4. Add tests per `context/testing-standards.md`: happy path + every contract error code for this endpoint.
5. Run the `contract-check` skill, then `/verify-unit`.

## Before you say "done"

- [ ] Endpoint matches `CONTRACT.md` exactly (path, method, fields, statuses, error codes)
- [ ] No business logic in the route handler
- [ ] Tests exist for every error code
- [ ] `/verify-unit` reports `UNIT VERIFIED`
