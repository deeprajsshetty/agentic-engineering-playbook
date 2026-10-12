# Audit log — agentic-engineering-playbook

Newest entry first. Method: [docs/06 — The Director's Audit](docs/06-verify.md#5-the-directors-audit). The worked example has its own log: [examples/taskr-api/AUDIT_LOG.md](examples/taskr-api/AUDIT_LOG.md).

---

## 2026-10-12 — whole repository (Phase 8, final)
**Spec (frozen):** the master brief for this repo, [CLAUDE.md](CLAUDE.md) standing orders, [BUILD_SEQUENCE.md](BUILD_SEQUENCE.md), current Claude Code docs.
**Auditors (independent, read-only, in parallel):**
- **Director** — full CI-equivalent run plus targeted greps, recorded before reading the reviewers' reports
- **`code-reviewer` subagent** — executable/config scope: kit settings, hooks, skills, agents, scripts, plugin, CI
- **Docs auditor subagent** — prose scope: internal consistency, Claude Code accuracy (spot-checked against code.claude.com), structure, master-brief requirements, copy risk

**Gate before audit:** JSON ✓ · shellcheck ✓ · hook tests 14/14 ✓ · script tests 17/17 ✓ · links 168 ✓ · plugin validate ×2 ✓ · example 107 tests ✓.
**Verdicts:** code-reviewer **FAIL** (1 High, 5 Medium, 13 Low) · docs auditor **FAIL** (1 High, 7 Medium, 10 Low) · Director: 3 findings (D1–D3), all also found by the docs auditor.

### Structural
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| S1 | **High** — `bootstrap-new.sh` treated any folder containing `.claude/settings.json` as its own previous run, then `git add -A` — reproduced committing a user's untracked `credentials.txt` | code-reviewer | Re-runs recognised only by a `.claude/.kit-bootstrap` marker; dirty re-runs refused; stage only created paths; regression tests fail on the old script | `a32d1b6` |
| S2 | **High** — `sources/` empty although README and CLAUDE.md promise attribution and a module map there | docs auditor + Director (D1) | `sources/README.md` (credits, deliberate deviations from the course, credited patterns, module map) and `sources/design-handbook.md` | `c63cfaf` |
| S3 | Secret guard missed `client_secret`, `db_password`, `AWS_SECRET_ACCESS_KEY`, unquoted values and connection-string passwords; any value containing "fake"/"example" was whitelisted; Bash and NotebookEdit writes never scanned | code-reviewer | Suffix-identifier and connection-string patterns; placeholder check anchored to the value; matcher widened to `Write\|Edit\|MultiEdit\|NotebookEdit\|Bash`; 14 new tests (8 fail on the old hook) | `025179f` |
| S4 | Generation prompts referenced `templates/X.md`, which doesn't exist in a target repo | docs auditor | "the playbook's `templates/X.md`" + `claude --add-dir ~/agentic-engineering-playbook` (verified flag) documented in indexes and docs 10/11 | `625f8e1` |
| S5 | docs/11 told users to run `create-next-app` inside a bootstrapped (non-empty) folder | docs auditor | Generators first, then `adopt-existing.sh`; bootstrap's own "Next steps" output matches | `625f8e1` |
| S6 | Design-doc paths: bootstrap creates `docs/DESIGN_SPEC.md` etc., but `/audit` and the auditors looked at the root | code-reviewer | One convention (`docs/`) across skill, agents, CLAUDE.md template | `fa2adae` |
| S7 | Root `AUDIT_LOG.md` missing; CHEATSHEET still a stub | docs auditor + Director (D2, D3) | This file; finished one-page CHEATSHEET | this commit |
| S8 | BUILD_SEQUENCE Phase 2 never marked ✅ (an earlier `sed` silently matched nothing) | docs auditor | Marked ✅ with its evidence; Phase 8 ✅ | this commit |

### Consistency
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| C1 | Two prompts (motion reconciliation, nightly routine) tracked the course text nearly word for word — against CLAUDE.md | docs auditor | Rewritten with new structure; examples replaced; short named patterns credited in `sources/` | `91b8651` |
| C2 | `⚠️ Verify` markers used variant wordings; docs/12 flagged verified Agent SDK content | docs auditor | Canonical marker everywhere; docs/12 reworded | `65b2d4b` |
| C3 | "Preview pane" vs the current Desktop name "Browser pane" | docs auditor | Renamed across docs, prompts and agents | `65b2d4b` |
| C4 | Reviewer subagents described as having "read-only Bash" — it's an instruction, not enforced | docs auditor | Wording corrected in docs/06 and kit/README | `65b2d4b` |
| C5 | Auto-mode default stated without version/fallback caveat | docs auditor | Caveated (v2.1.283+, falls back to Manual) | `65b2d4b` |
| C6 | Lifecycle order: diagram puts Plan after Design, docs/02 drafts BUILD_SEQUENCE early; Ship listed after Operate/Extend | docs auditor | README explains planning happens twice; tables list Ship first | `65b2d4b` |
| C7 | docs/10 used `git add -A` (which docs/05 and `/ship-unit` forbid); doctor sample hid omitted lines | docs auditor | Explicit paths; `…` marker | `625f8e1` |
| C8 | `.worktreeinclude`: bootstrap wrote the live file, adopt the `.example`; docs/05's `cp` failed for bootstrapped repos | docs auditor + code-reviewer | Both scripts ship the `.example`; docs aligned | `a32d1b6`, `625f8e1` |
| C9 | prompts/README claimed every entry has four parts; two entries are reference tables | docs auditor | Index names the two reference entries | `65b2d4b` |
| C10 | taskr-api audit counted "19" round-1 findings for a 16-row table; attribution sentence contradicted the table | docs auditor | Counts 16 + 12; sentence matches the tables | `65b2d4b` |

### Correctness (Low)
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| L1 | `/onboard-repo` used `git shortlog -sn -20` — reads stdin and prints nothing under Claude's Bash tool | code-reviewer | `git shortlog -sn --no-merges HEAD` | `fa2adae` |
| L2 | `/verify-app` says it fixes code but `allowed-tools` has no Edit — unexplained | code-reviewer | Stated: edits prompt by design; that's the review step | `fa2adae` |
| L3 | Bootstrap's commit gate ignored `GIT_AUTHOR_*` env vars, so CI never exercised the first commit | code-reviewer | `git var GIT_COMMITTER_IDENT`; test asserts the commit | `a32d1b6` |
| L4 | Idempotency snapshots used `shasum` (perl) with stderr hidden — empty snapshots would "pass" | code-reviewer | POSIX `cksum`; fail if empty | `a32d1b6` |
| L5 | `git init -b` needs git ≥ 2.28 | code-reviewer | Fallback to `symbolic-ref` | `a32d1b6` |
| L6 | doctor: FAIL for a non-executable `.mjs` hook (run via `node`); skill threshold 7 vs 10 shipped | code-reviewer | Exec bit only for `.sh`; threshold from the kit | `9846498` |
| L7 | format-on-edit used a Prettier-3-only flag; silently no-op on Prettier 2 | code-reviewer | Flag removed | `9846498` |
| L8 | activity-log header overstated "per turn"; names space-joined; log unbounded | code-reviewer | Accurate header, tab-separated, trimmed to 1000 lines | `9846498` |
| L9 | An existing, different `.kit-new` (possibly a user's merge in progress) was overwritten | code-reviewer | Left untouched with a warning | `9846498` |
| L10 | Force-push deny missed `git push <remote> <ref> --force`, `-f`, `+ref` | code-reviewer | Extra deny patterns (ask on push still applies) | `9846498` |
| L11 | claude-review: dead `workflow_dispatch`; no concurrency (each push = another paid run) | code-reviewer | Trigger removed; per-PR concurrency with cancel-in-progress | `9846498` |
| L12 | `.kit-backup-*/` ignored but never created | code-reviewer | Removed | `9846498` |

### Reviewer-only vs agreed
- **Agreed (high confidence):** S2/S7 (docs auditor + Director), C8 (both reviewers).
- **code-reviewer only:** S1 (the most serious defect — the Director's checks and the existing 17 smoke tests all passed with it present, because no test bootstrapped into a *foreign* repo), S3, S6, L1–L12.
- **docs auditor only:** S4, S5, S8, C1–C7, C9, C10.

### Accepted / not changed
- **Secret-guard escape hatch** (`secret-guard: allow` on the same line) can be added by Claude itself. Kept and documented: the hook guards against accidents, not an adversarial agent; pair it with review and a server-side scanner.
- **SHA-pinning `anthropics/claude-code-action`** — left on the `@v1` major tag (matches the official docs); pinning noted in the workflow as a hardening option.
- **Hook log retention** — trimmed to 1000 lines rather than rotated.
- **Unverifiable in this environment:** whether the `code-review` plugin needs more `--allowedTools` in CI (only knowable by running the action with a secret); Linux-only userland differences beyond shellcheck (CI will exercise them on `ubuntu-latest` on first push).

### Status
**Verified** for publication. After all fixes: JSON ✓ · shellcheck ✓ · hook tests **28/28** ✓ · script tests **21/21** ✓ · links **219 OK / 0 errors** (anchors included) ✓ · `claude plugin validate` ×2 ✓ · taskr-api **107 tests** ✓ · `examples/taskr-api/.claude` identical to `kit/.claude` ✓. First push will run the same checks in GitHub Actions.
