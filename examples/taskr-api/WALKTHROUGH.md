# Walkthrough — how taskr-api was built

Every commit below maps to a lifecycle stage, the playbook page that describes it, and the prompt or command that drove it. Read it top to bottom alongside `git log --reverse -- examples/taskr-api`.

> **Honesty note.** This example was built by Claude Code working inside the playbook repo itself, so the kit's slash commands (`/verify-unit`, `/ship-unit`, `/audit`) were not loaded as commands in that session. Their checks were run as the equivalent shell commands (`tsc --noEmit`, `vitest run`, `git diff --name-only` scope check, secrets grep), with the same report format. In your own session, inside this folder, you'd type the commands. The reviewer subagents (`contract-auditor`, `code-reviewer`) were run for real, briefed with the kit's agent definitions.

## Timeline

| # | Commit | Stage | Playbook page | What drove it |
|---|---|---|---|---|
| 0 | `4c5b44d` docs: adopt kit + PRD, contract, build sequence | Discover → Specify → Context-engineer → Plan | [02](../../docs/02-discover-and-plan.md), [03](../../docs/03-context-engineering.md), [10](../../docs/10-brownfield-adoption.md) | `scripts/adopt-existing.sh examples/taskr-api` (27 files, 0 conflicts), then the [PRD](../../templates/PRD.md), [CONTRACT](../../templates/CONTRACT.md) and [BUILD_SEQUENCE](../../templates/BUILD_SEQUENCE.md) generation prompts; `CLAUDE.md` and `context/` tailored |
| 1 | `cd30497` scaffold + health + error envelope | Build → Verify → Ship | [05](../../docs/05-build.md) | [Precise unit prompt](../../prompts/build/README.md#1-the-precise-unit-prompt), unit 1 → verify-unit checks → one commit |
| 2 | `f0d4903` create tasks | Build | [05](../../docs/05-build.md) | Unit 2. Store interface first, then in-memory store, validation, service, route — the order in `context/api-conventions.md` |
| 3 | `9b842f1` list + cursor pagination | Build | [05](../../docs/05-build.md) | Unit 3. **Plan amended in the same commit**: `src/cursor.ts` added to the declared scope; the "after a delete" check moved to unit 5 (delete didn't exist yet) |
| 4 | `1f0e510` get + update | Build | [05](../../docs/05-build.md) | Unit 4. Injected clock makes "`updatedAt` changes" deterministic |
| 5 | `8cd7484` delete | Build | [05](../../docs/05-build.md) | Unit 5, including the moved AC4 check: a cursor walk survives deletes |
| 6 | `1ba1eae` INVALID_JSON + contract-coverage guard | Build → Verify | [06](../../docs/06-verify.md) | Unit 6. A test reads `CONTRACT.md` §5 and fails if any code is untested — mutation-checked by adding a fake code |
| — | (no commit) `APP VERIFIED` | Verify | [06](../../docs/06-verify.md) | typecheck ✓ · 51 tests ✓ · build ✓ |
| — | (no commit) Director's Audit | Audit | [06](../../docs/06-verify.md#5-the-directors-audit) | Director probe + `contract-auditor` + `code-reviewer` in parallel → **FAIL**, 16 findings ([AUDIT_LOG.md](AUDIT_LOG.md)) |
| 7 | `1223b64` amend contract | Specify (again) | [correction patterns](../../prompts/correction-patterns.md#3-contract-wins) | Contract first, code second: two new codes, signed cursors, HEAD/OPTIONS rules |
| 8 | `e4e64b7` request-body errors | Audit fix (Structural) | [06](../../docs/06-verify.md) | S2, S4, L1 |
| 9 | `6212fe8` signed cursors | Audit fix (Structural, **High**) | [06](../../docs/06-verify.md) | S1, S6 |
| 10 | `03f3ab2` OPTIONS / undecodable paths | Audit fix (Structural) | [06](../../docs/06-verify.md) | S3, S5, L3 |
| 11 | `57f38a7` `__proto__` keys, code-point length | Audit fix (Consistency) | [06](../../docs/06-verify.md) | C2, L4 — regression tests proven to fail on the old code |
| 12 | `7d24155` duplicate ids | Audit fix (Correctness) | [06](../../docs/06-verify.md) | L2 |
| 13 | `0bf0561` coverage gaps, test isolation | Audit fix (Structural/Consistency) | [06](../../docs/06-verify.md) | S7, C3, C4, C5 |
| — | (no commit) Re-audit, round 2 | Audit | [06](../../docs/06-verify.md#5-the-directors-audit) | Fresh `contract-auditor` on the fixed code → all round-1 findings resolved; **FAIL** on 12 smaller findings |
| 14 | `a0d2ef3` amend contract after re-audit | Specify (again) | [correction patterns](../../prompts/correction-patterns.md#3-contract-wins) | Media types/charsets/encodings → 415; exact paths; no ETag |
| 15 | `9db4f20` 415 for non-JSON / non-UTF-8 / compressed bodies | Audit fix | [06](../../docs/06-verify.md) | R1, R3, R4, R5, R8 — the gate rejected two broken attempts first |
| 16 | `0069548` exact paths, no ETag, coverage gaps | Audit fix | [06](../../docs/06-verify.md) | R2, R6, R7 + boundary tests |
| 17 | this commit: AUDIT_LOG + WALKTHROUGH + README | Audit → Ship | [06](../../docs/06-verify.md), [09](../../docs/09-ship-and-operate.md) | [Log it](../../prompts/audit/README.md#6-log-it) |

## A unit, end to end (unit 3, as it actually ran)

1. **Read** `CLAUDE.md`, `CONTRACT.md` §2 (pagination) and §4.3, `BUILD_SEQUENCE.md` unit 3.
2. **Build** only unit 3: store `list()` → cursor encode/decode → strict query schema → service → route → `tests/tasks.list.test.ts`.
3. **Verify** (the `/verify-unit` checks):
   ```text
   UNIT VERIFIED
   Typecheck : PASS — exit 0
   Tests     : PASS — Tests 30 passed (30)
   Diff scope: PASS — 8 files in scope
   Secrets   : PASS — none found
   ```
4. **Notice** the scope only passed because the checker allowed `src/cursor.ts`, which the plan didn't list. Rather than let the check silently widen, the plan was amended in the same commit — the build sequence stays the truth.
5. **Ship**: stage by explicit path, one `feat(taskr-api): …` commit with the evidence in the body.

## What the audit taught (and why the gates alone weren't enough)

- **51 green tests, two FAIL verdicts.** Every unit passed its gate, yet independent reviewers found a High-severity contract violation (forgeable cursors) and 15 more issues. Unit gates prove what you thought to test; audits find what you didn't.
- **Re-audit after fixing.** The second pass found a new layer — Express defaults (case-insensitive paths, ETag/304, gzip inflation) and gaps in the *amended* contract's own wording. Fixes create surface; verify them independently too.
- **Different briefs find different bugs.** The contract auditor found contract-shape gaps (OPTIONS, HEAD, undocumented `body` key); the code reviewer found runtime defects (`__proto__`, URIError → 500, duplicate ids). The Director's own probe overlapped both on the four most important issues.
- **Contract first can mean red first.** Amending §5 turned the coverage guard red until the next commit. The guard did its job; on a team branch, put the amendment and its first fix in one PR.
- **Test the tests.** The coverage guard and the `__proto__` tests were each mutation-checked: break the code (or the contract) and confirm the test fails.
- **Supply chain.** npm 11 blocked `esbuild`'s postinstall script by default. It wasn't needed (the binary ships as an optional dependency), so it stayed unapproved — approve install scripts only when something actually breaks without them.

## Try it

```bash
cd examples/taskr-api
npm ci
npm test            # 107 tests
npm run dev         # http://localhost:3000/health
curl -s -X POST localhost:3000/api/v1/tasks -H 'content-type: application/json' -d '{"title":"Try taskr"}'
curl -s 'localhost:3000/api/v1/tasks?limit=1'
```

Deploying is documentation-only for this example (no credentials are used): see [09 — Ship and operate](../../docs/09-ship-and-operate.md). Because storage is in-memory, a real deployment needs the Postgres `TaskStore` first — build it in a parallel worktree against `CONTRACT.md` §3 and merge only when this suite passes unchanged against it.
