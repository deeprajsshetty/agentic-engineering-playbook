# The drop-in kit

Everything in this folder is copied into a target repository by [`scripts/adopt-existing.sh`](../scripts/) (brownfield) or [`scripts/bootstrap-new.sh`](../scripts/) (greenfield). Neither script overwrites an existing file: conflicts are written next to the original as `<file>.kit-new` for you to merge.

## What's inside

| Path in target repo | What it does | Committed? |
|---|---|---|
| `.claude/settings.json` | Least-privilege permissions + two fast hooks (see below) | Yes — shared with the team |
| `.claude/settings.local.json.example` | Personal extras: opt-in format-on-edit hook, `npm run dev` | Rename to `settings.local.json` (ignored) |
| `.claude/skills/<name>/SKILL.md` | Workflow skills you run as `/name`, plus knowledge skills Claude loads when relevant | Yes |
| `.claude/agents/*.md` | Focused reviewer/auditor subagents | Yes |
| `.claude/hooks/` | `secret-guard.mjs` (PreToolUse), `activity-log.sh` (Stop), `format-on-edit.sh` (opt-in PostToolUse) | Yes |
| `.claude/rules/migrations.md` | Path-scoped rule: loads only when Claude touches migration files | Yes |
| `context/api-conventions.md`, `context/testing-standards.md` | Project conventions — **tailor these** (`/onboard-repo` does it for you) | Yes |
| `.env.example` | Every env var the app reads, with empty values | Yes |
| `.worktreeinclude.example` | Copy to `.worktreeinclude` to have `.env` copied into new worktrees (both scripts ship the `.example`) | Yes, once copied |
| `gitignore.additions` | Lines appended to `.gitignore` if missing | — |

`CLAUDE.md` comes from [`templates/CLAUDE.md.template`](../templates/).

## Skills

| Command | Type | Edits files? | Report |
|---|---|---|---|
| `/plan-feature [feature]` | Workflow | No | Plan of atomic units, ends awaiting approval |
| `/verify-unit [scope]` | Workflow | **Never** | `UNIT VERIFIED` / `UNIT FAILED` |
| `/ship-unit [scope]` | Workflow | Stages + commits in-scope files only; never pushes | `SHIPPED <sha>` |
| `/verify-app` | Workflow | Implementation fixes only (≤ 3 cycles); never tests | `APP VERIFIED` / `APP FAILED` |
| `/audit [spec docs]` | Workflow | No (offers to append to `AUDIT_LOG.md`) | Structural / Consistency / Visual tables |
| `/onboard-repo` | Workflow | Docs only, after approval | `ONBOARDING DRAFT READY` |
| `/handoff` | Workflow | `HANDOFF.md` only | Handoff note |
| `contract-check` | Knowledge (auto) | No | `CONTRACT CHECK: PASS/FAIL` |
| `api-endpoints` | Knowledge (auto) | — | Points to `context/api-conventions.md` |
| `testing-standards` | Knowledge (auto) | — | Points to `context/testing-standards.md` |

Workflow skills set `disable-model-invocation: true`, so only **you** can trigger them. Custom commands were merged into skills in Claude Code; a file in `.claude/commands/` still works, but skills add `allowed-tools`, supporting files and invocation control.

## Subagents

`code-reviewer`, `contract-auditor`, `security-reviewer` (Read/Grep/Glob plus Bash they are *told* to use read-only — the instruction isn't enforced; tighten with permission rules if you need a guarantee), `test-writer` (edits tests only), `visual-auditor` and `a11y-auditor` (inherit your session's browser/preview tools). Each is told to **find problems, not reassure**, and returns a fixed PASS/FAIL table. Ask for one by name: *"Use the contract-auditor subagent on the tasks endpoints."*

## Permissions and hooks — what they do and don't protect

- **deny** `rm -rf`, `curl`, `wget`, force-push, and reading/editing `.env*` (except `.env.example`). **ask** before staging, committing, pushing, switching branches, installing packages or touching Vercel/Supabase. **allow** tests, typecheck, lint, build and read-only git.
- Bash deny rules match the command text Claude writes; the docs are explicit that they are **not a security boundary** (`/bin/rm`, `sh -c '…'` slip past). The `secret-guard` hook and, for real isolation, [sandboxing](https://code.claude.com/docs/en/sandboxing) or a dev container are the stronger layers.
- `secret-guard.mjs` blocks (exit 2) any Write, Edit, MultiEdit, NotebookEdit or Bash call that would add an obvious credential (known key formats, `*_secret`/`*_password`/`*_token`-style assignments, passwords in connection strings) or write to a real `.env` file. False positive on an intentional test fixture? Add `secret-guard: allow` on that line. It guards against **accidents**, not a determined agent — keep code review and a server-side scanner (e.g. GitHub push protection) as the next layers.
- Hooks must stay fast (milliseconds). Test suites belong in `/verify-unit` and `/verify-app`, never in a hook.

Test the hook yourself: `scripts/test-hooks.sh`.
