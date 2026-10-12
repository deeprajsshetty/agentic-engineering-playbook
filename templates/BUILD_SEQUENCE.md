<!-- GENERATION-PROMPT:START
Use when: CONTRACT.md is approved. You decide the units; Claude formats and challenges them.

```text
Read CONTRACT.md and PRD.md. Propose BUILD_SEQUENCE.md using the playbook's templates/BUILD_SEQUENCE.md.
Each unit must be the smallest change that can be built, tested, verified against the
contract and committed on its own. Order units so dependencies point backwards only.
For each unit give: expected file scope (globs), and one sentence describing exactly what
I would check to call it verified. Flag any unit that is too big (> ~300 changed lines or
more than one concern) and split it. Mark units that can run in parallel worktrees and
name the contract section that is their sync point. Don't write code.
```

Good output: 4–10 units for a feature; every "verified when" is mechanical (a command, a test name, a request); parallel units share no files.
GENERATION-PROMPT:END -->
# BUILD_SEQUENCE — [Product / feature]

_Derived from `CONTRACT.md` [version/date]. One unit = one verified commit._

| # | Unit | Expected scope | Verified when… | Parallel? | Status |
|---|---|---|---|---|---|
| 1 | [Scaffold + health + error envelope] | `src/app.ts`, `src/errors.ts`, `tests/health.test.ts` | `tsc` exit 0; `GET /health` → 200; unknown route → 404 envelope test passes | — | ⏳ |
| 2 | [Create resource] | `src/routes/[r].ts`, `src/services/[r].ts`, `tests/[r].test.ts` | Happy path + each §4.1 error code has a passing test | — | ⏳ |
| 3 | [Next unit] | [globs] | [mechanical check] | [Worktree B, sync: §4.2] | ⏳ |

Status: ⏳ not started · 🔨 in progress · ✅ verified + committed (`<sha>`)

## Definition of "verified" for every unit
1. `/verify-unit <scope>` → `UNIT VERIFIED` (typecheck, tests, diff scope, secrets).
2. Behaviour matches `CONTRACT.md` (run the `contract-check` skill for API units).
3. No previously verified unit regressed (full suite green).
4. The director can explain the change and where the next one goes.
5. Exactly one conventional commit (`/ship-unit`).

## Parallel work
- [Unit x and y run in separate worktrees: `claude --worktree <name>`.]
- Sync point: [CONTRACT.md §…]. Merge only when **both** pass `/verify-unit` against it.
