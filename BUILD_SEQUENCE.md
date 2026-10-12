# BUILD_SEQUENCE.md — building this repository

This repo is built the way it teaches: one atomic unit per phase, each with a mechanical definition of "verified", one conventional commit each.

| # | Unit | Verified when… | Status |
|---|---|---|---|
| 0 | Nested repo initialised; parent repo ignores it; `shellcheck` + `lychee` installed | `git status` clean in parent; tools print versions | ✅ |
| 1 | Skeleton: README (Mermaid lifecycle), CLAUDE.md, CHEATSHEET stub, folder layout, `.gitignore`, LICENSE, CI workflows, repo `.claude/settings.json` | All JSON passes `jq empty`; `CLAUDE.md` < 60 lines; `lychee --offline` clean | ✅ |
| 2 | Drop-in kit (`kit/.claude/` settings, skills, agents, hooks, rules; `kit/context/`) + personal plugin + root marketplace | `jq`, `shellcheck`, `claude plugin validate .` and `plugin/my-standards` pass; secret-guard blocks fake secrets (exit 2) and passes clean input (exit 0) | ✅ |
| 3 | Templates (11) and prompt library (7 phases + correction patterns) | Each template opens with a generation prompt; links resolve | ✅ |
| 4 | Lifecycle docs `00`–`09` + `docs/README.md` index; surfaces map in `00` | Every doc has the 8 fixed headings; links resolve | ✅ |
| 5 | `10`/`11` docs + `bootstrap-new.sh`, `adopt-existing.sh`, `doctor.sh` | `shellcheck` clean; scripts run twice against a throwaway repo with identical results; `--dry-run` writes nothing; output captured in the docs | ✅ |
| 6 | `12-fde-playbook.md`, `13-troubleshooting.md` | 8-part structure (12) / symptom→fix tables (13); links resolve | ✅ |
| 7 | `examples/taskr-api` built with the kit in 6 atomic units + AUDIT_LOG + WALKTHROUGH | Per unit: `tsc --noEmit` exit 0, `vitest run` all pass, diff scope matches unit; one commit per unit | ✅ |
| 8 | Director's Audit of the whole repo; root `AUDIT_LOG.md`; final CHEATSHEET | Reviewer subagent findings logged and resolved one at a time; full local CI green | ✅ |
| 9 | Consolidate into this repository (merge with history; course copies kept local and gitignored; empty `001-vibemail-backend` removed) + `docs/BEGINNERS-GUIDE.md` | Root matches the nested copy (`diff -r` clean except intended `.gitignore` line); full local CI green from the root; guide commands exercised | ✅ |

## Sequencing rules
- No phase starts until the previous one is committed and its checks pass.
- Kit (2) precedes docs (4) so docs reference real file paths.
- The worked example (7) is built *with* the kit, so it doubles as the kit's integration test.
