# Cheatsheet

One page. Everything here is verified against the Claude Code docs (Oct 2026) and the kit in this repo. Full context: [docs/](docs/README.md).

## The Three Standards — every plan, diff, release
1. **Does it scale?** Another agent could continue from the documents alone; no copy-paste logic.
2. **Is it secure?** In scope; no secrets in source or prompts; no unapproved dependency or data flow.
3. **Do I know exactly why it works?** You can trace each decision to a requirement and say where the next change goes.

## The loop
```text
/plan-feature → build ONE unit → /verify-unit <scope> → explain it back → /ship-unit <scope> → next
before merge: /verify-app → /audit CONTRACT.md [design docs]
```

## Kit commands (after `scripts/adopt-existing.sh` or `bootstrap-new.sh`)
| Command | Does | Edits? |
|---|---|---|
| `/plan-feature [desc]` | 95%-confidence questions → plan of atomic units | No |
| `/verify-unit [scope]` | typecheck · tests · diff scope · secrets → `UNIT VERIFIED/FAILED` | Never |
| `/ship-unit [scope]` | verify → stage in-scope by path → conventional commit (no push) | Commit |
| `/verify-app` | full suite + build; fixes implementation ≤ 3 cycles, never tests | Impl only |
| `/audit [docs]` | Director's Audit: Structural / Consistency / Visual tables | No |
| `/onboard-repo` | brownfield map → CLAUDE.md + context/ drafts + risks | Docs, after OK |
| `/handoff` | writes `HANDOFF.md` to resume later | `HANDOFF.md` |

Subagents (ask by name): `code-reviewer` · `contract-auditor` · `security-reviewer` · `test-writer` · `visual-auditor` · `a11y-auditor`.

## Claude Code — most-used
| Command | Use |
|---|---|
| `claude` · `claude --continue` · `claude --resume` | start · latest session · pick a session |
| `claude --permission-mode plan` | start in plan mode (also `manual`, `acceptEdits`, `auto`, `dontAsk`) |
| `claude --worktree <name>` | isolated parallel session under `.claude/worktrees/` |
| `claude --add-dir ~/agentic-engineering-playbook` | let Claude read the playbook's templates from a project repo |
| `claude -p "…" --permission-mode dontAsk --allowedTools "Bash(npm test *)" "Read"` | headless / CI |
| `/init` · `/memory` · `/context` · `/compact <keep…>` · `/clear` | context management |
| `/rewind` | roll back conversation and/or code to a checkpoint |
| `/goal <measurable condition> … or stop after N turns` · `/goal clear` | keep working until true |
| `/loop 5m <prompt>` | poll while the session is open (≥ 1 min; 7-day expiry; can't fire manual-only skills like `/verify-unit`) |
| `/schedule <description>` | cloud routine (schedule / API / GitHub trigger) |
| `/remote-control` (`/rc`) · `claude --remote-control` | steer from phone or browser |
| `/desktop` | move this CLI session into the Desktop app |
| `/btw <question>` | side question that doesn't enter the thread |
| `/permissions` · `/hooks` · `/mcp` · `/status` · `/doctor` | inspect configuration |
| `/plugin marketplace add <owner/repo>` · `/plugin install <p>@<m>` · `/reload-plugins` | plugins |
| `/install-github-app` | Claude GitHub App + Actions workflow |
| `claude mcp add --transport http <name> <url>` · `claude mcp add <name> -- <cmd>` | MCP servers |

## Shortcuts
| Keys | Action |
|---|---|
| `Shift+Tab` | cycle permission modes (auto → manual → accept edits → plan) |
| `Esc` `Esc` (empty prompt) | open the rewind menu |
| `Ctrl+O` | expand transcript detail (e.g. the `/goal` evaluator's reason) |
| `Cmd/Ctrl+;` | side chat (Desktop) |
| `Cmd/Ctrl+Enter` | submit all diff comments (Desktop) |
| `Cmd/Ctrl+Shift+B` | open the Browser pane (Desktop preview) |
| hold `Space` | voice dictation after `/voice` (`/voice tap` for tap-to-record) |

## Prompt patterns
```text
Ask me clarifying questions one at a time until you're 95% confident you understand
the task. Then produce a plan. Don't edit any files until I approve it.
```
```text
Read CLAUDE.md, CONTRACT.md §[x] and BUILD_SEQUENCE.md unit [n]. Build unit [n] only:
[deliverable]. Scope: [files]. Don't touch anything else. Verified when: [check].
Run /verify-unit [scope] and show me the report. Don't commit.
```
```text
[Element] is [observable problem] rather than [specified result].
Update [token/property/behaviour] to match [document §]. Don't change [working parts].
```
```text
Before you build anything, list the decisions you're about to make and the document
and section each comes from. Mark anything without a source as an assumption.
```
```text
You are reviewing this to find problems, not to reassure. For each issue: category,
file:line, the problem, and a specific fix. If a dimension is clean, say so and move on.
```
More: [prompts/](prompts/README.md).

## Scripts
```bash
scripts/adopt-existing.sh [--dry-run] [--allow-dirty] <repo>      # brownfield: never overwrites (*.kit-new)
scripts/bootstrap-new.sh [--dry-run] [--ui] [--name N] <new-dir>  # greenfield: kit + planning docs; commits only what it created
# using create-next-app or another generator? generate first, then adopt-existing.sh
scripts/doctor.sh [<repo>]                                        # PASS/WARN/FAIL health check
```

## Rules that save you
- Commit first · dedicated branch · tight scope · measurable stop condition — before any unattended run.
- Contract first, code second. The contract wins every disagreement.
- A deploy command is not proof — exercise the live routes.
- `CLAUDE.md` under one page; detail in `context/`, skills and path-scoped rules.
- CLI for known operations → thin wrapper → MCP only when discovery earns its context cost.
