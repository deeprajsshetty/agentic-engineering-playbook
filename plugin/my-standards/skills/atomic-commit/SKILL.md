---
name: atomic-commit
description: Atomic-shipping discipline and Conventional Commit messages. Use when preparing a commit, deciding what belongs in a commit, splitting work, or writing a commit message.
---

# Atomic commits

An **atomic unit** is the smallest meaningful change that is (1) complete, (2) checked against the contract, (3) tested with zero failures, (4) free of regressions, (5) understood by the director, and (6) recorded as **one** commit.

## Rules (checkable)

- One unit per commit. If the message needs "and", it is probably two commits.
- Stage by explicit path. Never `git add -A` / `git add .` for a unit commit.
- Verification passes **before** the commit: typecheck exit 0, full suite green, diff limited to the unit's scope.
- Never commit with failing or skipped tests. Never commit `.env*` (except `.env.example`), build output or editor files.
- Never rewrite published history (`push --force`) without the director saying so explicitly.

## Message format — Conventional Commits

```text
<type>(<scope>): <imperative summary, ≤ 72 chars, no trailing period>

<why this change, in 1–3 lines — the diff already shows what>
<optional: Unit n of BUILD_SEQUENCE.md · Verified: tsc ✓ tests ✓ scope ✓>
```

| type | use for |
|---|---|
| `feat` | new user-visible capability |
| `fix` | bug fix |
| `refactor` | behaviour-preserving restructure |
| `test` | tests only |
| `docs` | documentation only |
| `chore` | tooling, config, dependencies |
| `ci` | CI pipelines |
| `perf` | performance with no behaviour change |

Breaking change: `feat(api)!: …` plus a `BREAKING CHANGE:` footer.
