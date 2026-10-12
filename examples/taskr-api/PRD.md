# PRD — Taskr API

_Status: Approved · Owner: deeprajsshetty · Last updated: 2026-10-12_

## 1. Vision
Small teams track work in chat threads and lose it. Taskr is a minimal task API — create, list, update and delete tasks with priorities and due dates — designed as the backend for a lightweight client. This repository is also the worked example for the agentic engineering playbook, so the process matters as much as the product.

## 2. Users
| Persona | Situation | Need | Today they… |
|---|---|---|---|
| Priya, frontend developer | Building a small task UI over a weekend | A predictable JSON API with typed errors she can map to UI states | Hand-rolls mock data and guesses error shapes |
| Sam, team lead | Wants a shared list of who's doing what this week | Filter by status and priority; page through long lists | Pins messages in chat |

## 3. Features
**Must-Have**
- [ ] Create a task with a title, priority and optional due date
- [ ] List tasks, newest last, with cursor pagination and filters by status and priority
- [ ] Get, update (title, priority, status, due date) and delete a single task
- [ ] Every error uses one typed envelope with a stable code
- [ ] Health endpoint for uptime checks

**Should-Have**
- [ ] Persistence in Postgres/Supabase behind the same contract

**Nice-to-Have**
- [ ] Authentication and per-user task lists
- [ ] Tags and full-text search

## 4. Technical constraints
- Node 22+, TypeScript strict, Express 5, validation with zod; tests with Vitest + supertest.
- In-memory storage for v1 behind a small store interface, so persistence can be swapped without touching routes or services.
- No authentication in v1 (explicit non-goal — local/demo use only). No external services, no network calls.

## 5. Design summary
API-only; no UI in this repository. Response and error shapes are optimised for direct mapping to client UI states.

## 6. Success criteria
| # | Criterion | How it's checked |
|---|---|---|
| S1 | Every endpoint and error code in `CONTRACT.md` behaves as specified | Contract tests (one per error code) pass |
| S2 | `npx tsc --noEmit` exits 0 and the suite passes with 0 skipped | `/verify-unit`, CI |
| S3 | Git history shows one conventional commit per verified unit | `git log --oneline -- examples/taskr-api` |
| S4 | An independent reviewer finds no High-severity issues | `AUDIT_LOG.md` |

## 7. Open questions
- None for v1.
