# 10 — Brownfield adoption: apply the kit to an existing repo

## Goal
Bring an existing repository under the agentic workflow — kit installed, Claude oriented to the code *as it really is*, one improvement shipped through the full loop — without breaking anything or overwriting anything.

## Which surface
**Terminal** for the script; **Claude Code (CLI or Desktop)** for `/init`, `/onboard-repo` and the first unit. Desktop's diff pane is useful for reviewing the drafted `CLAUDE.md`.

## Inputs → Outputs
- **In:** an existing git repo with a clean working tree; a clone of this playbook.
- **Out:** on branch `chore/adopt-agentic-kit`: `.claude/` (settings, skills, agents, hooks, rules), `context/`, a tailored `CLAUDE.md`, `.env` ignored, a lightweight `CONTRACT.md`, a recorded test baseline, and one PR containing the adoption commit plus one verified improvement.

## Steps

### 1. Clean baseline on a dedicated branch
```bash
cd ~/code/your-repo
git status                                # must be clean — commit or stash first
git switch -c chore/adopt-agentic-kit
```

### 2. Preview, then run the adopt script
```bash
~/agentic-engineering-playbook/scripts/adopt-existing.sh --dry-run .
~/agentic-engineering-playbook/scripts/adopt-existing.sh .
```
What it does:
- Copies `kit/.claude/`, `kit/context/`, `.env.example`, `.worktreeinclude.example`.
- **Never overwrites.** Identical files are skipped; a file that exists with different content stays as-is and the kit version is written beside it as `<file>.kit-new`.
- Seeds `CLAUDE.md` from the template only if you have none (otherwise `CLAUDE.md.kit-new`).
- Appends missing lines to `.gitignore` (`.env`, `.env.*`, `!.env.example`, local Claude files, `*.kit-new`).
- Makes hooks executable; warns if `.env` is tracked.
- Refuses a dirty tree (override: `--allow-dirty`); warns if you're on `main`.
- Idempotent — a second run changes nothing.

Real output from a test repo that already had a `CLAUDE.md` and a `.claude/settings.json`:
```text
! conflict   .claude/settings.json exists and differs → writing .claude/settings.json.kit-new
! conflict   CLAUDE.md exists and differs → writing CLAUDE.md.kit-new
✔ .gitignore += .env
…
Summary: 25 created · 0 unchanged · 2 conflict(s)
Conflicts (your file was kept; kit version saved alongside as <file>.kit-new):
  - .claude/settings.json  →  merge from .claude/settings.json.kit-new, then delete the .kit-new
  - CLAUDE.md  →  merge from CLAUDE.md.kit-new, then delete the .kit-new
```
Second run: `Summary: 0 created · 25 unchanged · 2 conflict(s)` and no file changed.

### 3. Merge conflicts by hand
For `settings.json`: keep your existing allow rules, add the kit's `deny` rules and `hooks` block. Validate with `jq empty .claude/settings.json`. Delete each `.kit-new` when done. Commit only what the kit touched:
```bash
git add .claude context CLAUDE.md .gitignore .env.example .worktreeinclude.example
git commit -m "chore: adopt agentic kit"
```

### 4. Orient Claude to the real codebase
Start Claude Code in the repo with read access to the playbook's templates (consider Manual mode for a first session in an unfamiliar codebase):
```bash
claude --add-dir ~/agentic-engineering-playbook --permission-mode manual
```
```text
/init
/onboard-repo
```
`/onboard-repo` maps stack, commands, tests, conventions in practice, and problems ranked by blast radius; then drafts a one-page `CLAUDE.md` (with **Known structural problems** and **Never do**), `context/api-conventions.md` and `context/testing-standards.md`, and a top-5 risk list. It writes them only after you approve. Review the drafts against the code — describe the repo as it is.

Cold-start check in a fresh session: *"What is this project, what are its known problems, and where does a new endpoint go?"*

### 5. Back-fill a lightweight contract and a test baseline
```text
Read the existing routes and their tests. Draft CONTRACT.md using templates/CONTRACT.md for the
endpoints that exist today — current behaviour, including inconsistencies, marked as such.
List every error response shape you find. Don't change any code.
```
Then record the baseline:
```bash
npm test 2>&1 | tail -5      # paste into CONTRIBUTING.md "What a passing run looks like"
```
If tests are missing around something you'll touch first, use the `test-writer` subagent to characterise current behaviour *before* changing it.

### 6. Prove the loop with one small improvement
Pick something small, well-bounded and testable (e.g. make one endpoint use the error envelope, or add the missing test for a known error case). Then:
```text
/plan-feature [the improvement]
… build …
/verify-unit [scope]
/ship-unit [scope]
```
```bash
git push -u origin chore/adopt-agentic-kit
gh pr create --title "chore: adopt agentic kit + first verified unit" --fill
```

### 7. Health check
```bash
~/agentic-engineering-playbook/scripts/doctor.sh .
```
Real output after merging the conflicts (before CONTRACT/BUILD_SEQUENCE existed; tooling lines omitted):
```text
…
PASS  .env is gitignored
PASS  no .env files tracked
PASS  settings deny reading .env
PASS  hook present: secret-guard.mjs
PASS  10 skills installed
WARN  CONTRACT.md missing — see templates/CONTRACT.md
Result: 14 pass · 4 warn · 0 fail
```

## Verified when…
- [ ] `doctor.sh` reports 0 FAIL and no `*.kit-new` files remain.
- [ ] `CLAUDE.md` < 1 page, contains Commands, Known structural problems and Never do.
- [ ] A fresh session answers the cold-start check correctly.
- [ ] `CONTRACT.md` describes existing endpoints; test baseline recorded.
- [ ] One improvement shipped with `UNIT VERIFIED` → one commit → PR open with CI green.

## Three Standards check
- **Scale:** Can a teammate pull this branch and get the same Claude behaviour (shared `.claude/settings.json`, skills, context files)?
- **Secure:** Was `.env` ever tracked? If so — `git rm --cached .env`, **rotate every secret**, and consider history rewriting with your security team. Do deny rules and the secret guard cover this repo's secret files (add patterns for e.g. `config/credentials.*`)?
- **Understand:** Does `CLAUDE.md` describe the repo's actual problems — and do you agree with the risk ranking?

## Common mistakes
- Running the script on `main` with uncommitted work — the kit mixes into unrelated changes.
- Accepting an `/init` draft that describes an idealised architecture — Claude then "fixes" code to match a fiction.
- Starting with a big refactor as the first unit; prove the loop on something small first.
- Leaving `.kit-new` files around — merge or delete them (they're gitignored, so they won't be committed by accident).

## Course reference
Module 2 — Memory in Practice (CLAUDE.md for a repo with intentional structural problems, Never-Do section, context files), Practice Repository: Architecture Refactor, Verification Loops.
