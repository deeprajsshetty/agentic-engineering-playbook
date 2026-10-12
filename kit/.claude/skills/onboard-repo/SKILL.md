---
name: onboard-repo
description: Brownfield onboarding — map an existing repository, then draft a short CLAUDE.md, context/ files and a "Known structural problems / Never do" list. Writes documentation only after approval; never edits code.
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git log *)
  - Bash(git status *)
  - Bash(git ls-files *)
  - Bash(git shortlog *)
---

# /onboard-repo — map first, document second, never touch code

## Rules

- **No code edits.** The only files this skill may write are `CLAUDE.md`, `context/*.md`, and `.claude/rules/*.md` — and only after the director approves the drafts.
- Describe the repo **as it is**, including its problems. Do not describe the architecture you wish it had.
- `CLAUDE.md` stays under one page (target < 80 lines). Detail goes in `context/` files that `CLAUDE.md` points to.

## Steps

1. **Inventory** — languages, frameworks, package manager, entry points, top-level folders and what owns what. Use `git ls-files` rather than walking `node_modules`.
2. **Commands** — exact install, dev, build, typecheck, lint and test commands from `package.json` / Makefile / CI config. Run nothing that mutates state.
3. **Tests** — framework, location, naming convention, rough coverage, how to run one file.
4. **Conventions in practice** — naming, error handling, API response shape, module boundaries. Quote 1–2 representative files for each.
5. **Problems** — inconsistent naming, god files, dead code, missing tests, secrets risks, mixed patterns. Rank by blast radius.
6. **History** — `git log --oneline -30` and `git shortlog -sn --no-merges HEAD` (pass `HEAD` — without a revision, shortlog reads stdin and prints nothing in a non-interactive shell): hot spots and top authors.
7. Present drafts (below) in chat. **Ask for approval.** Then write the approved files.

## Drafts to produce

1. **`CLAUDE.md`** with exactly these sections: *What this is* · *Stack* · *Commands* · *Structure* · *Conventions* · *Known structural problems* · *Never do* · *Verification policy* (run `/verify-unit` after every unit, `/verify-app` before merge) · *Context files* (one line each: what, and when to read it).
2. **`context/api-conventions.md`** — how an endpoint is added *in this repo today*, plus the target convention if it differs.
3. **`context/testing-standards.md`** — how to write and run a test here.
4. **Risk list** — top 5 risks for agentic work in this repo (e.g. "no tests around billing", "routes.js is 2,000 lines").

## Report

```text
ONBOARDING DRAFT READY
Files proposed : CLAUDE.md (<n> lines), context/api-conventions.md, context/testing-standards.md
Top risks      : 1. … 2. … 3. …
Suggested first unit: <a small, well-tested improvement to prove the loop>
Awaiting approval to write files.
```
