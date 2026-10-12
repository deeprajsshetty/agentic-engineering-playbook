---
paths:
  - "supabase/migrations/**"
  - "migrations/**"
---

# Database migrations

- Migrations are append-only. Never edit a migration that has already been applied; write a new one.
- Every migration is idempotent: `create table if not exists`, `create index if not exists`, `drop policy if exists` before `create policy`.
- Every new table enables row-level security in the same migration, with policies that restrict rows to their owner.
- After a migration, regenerate types (e.g. `npm run db:types`) and commit them in the same unit.
- Never run a migration against production from an agent session. Apply locally or to a dev project; the director applies to production.
