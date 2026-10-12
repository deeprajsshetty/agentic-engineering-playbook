# 13 — Troubleshooting

## Goal
Diagnose the common ways agentic work goes wrong and apply the smallest fix that restores a verified baseline.

## Which surface
Whichever you're in. `/doctor` (in a session) and `claude doctor` (shell) diagnose installation and configuration; `scripts/doctor.sh` checks a repo's kit setup.

## Inputs → Outputs
- **In:** a symptom.
- **Out:** a cause, a fix, and — if it will recur — a new rule in `CLAUDE.md`, a skill, a hook or a plan constraint.

## Steps

First moves for anything:
```bash
git status && git log --oneline -5      # where am I relative to the last verified commit?
claude doctor                           # installation + settings problems
~/agentic-engineering-playbook/scripts/doctor.sh .
```
In a session: `/context` (what's loaded), `/status` (account, model, setting sources), `/permissions` (rules by scope), `/hooks`, `/mcp`.

### Context and behaviour

| Symptom | Likely cause | Fix |
|---|---|---|
| Claude ignores a convention in `CLAUDE.md` | File too long or contradictory; rule buried | Cut `CLAUDE.md` to one page; move detail to `context/` or a path-scoped rule; `/doctor prompt-audit` to find contradictions |
| Drift late in a long session (forgets decisions, repeats work) | Context saturation | `/compact keep: current unit, contract sections, decisions` — or `/handoff`, `/clear`, resume from `HANDOFF.md` |
| Generic or wrong answers about the project | Wrong folder opened, or `CLAUDE.md` missing pointers | Check the session's working directory; cold-start check: *"What is this project and which file do you read before X?"* |
| Claude reinforces the bad patterns of a legacy repo | `CLAUDE.md` describes them neutrally | Add **Known structural problems** and **Never do** with the replacement rule |
| A skill never triggers (or always does) | Vague `description` | Rewrite it to say *when*: "Use when adding routes, handlers or validation" |
| Invents fields, codes or endpoints | No contract, or prompt didn't reference it | Contract first; use the `contract-check` skill; [contract-wins correction](../prompts/correction-patterns.md#3-contract-wins) |

### Plans and execution

| Symptom | Likely cause | Fix |
|---|---|---|
| Plan looks fine, execution goes off the rails | Plan lacked file scope or verification steps | Re-plan requiring exact files, order and a test command per step; [plan review prompt](../prompts/plan/README.md#5-plan-review--make-the-agent-argue-against-itself) |
| `Shift+Tab` twice doesn't reach plan mode | Current versions start sessions in auto mode; the cycle is auto → manual → accept edits → plan | Press until the status bar says `⏸ plan mode on`, or `claude --permission-mode plan` |
| Diff touches files outside the unit | Boundary not stated, or unit too big | [Scope-creep stop](../prompts/correction-patterns.md#4-scope-creep-stop); split the unit in `BUILD_SEQUENCE.md` |
| Several fixes in, things are worse | Fixing forward through an untrusted state | `/rewind` (or Esc Esc on an empty prompt) to a checkpoint, or `git restore .` to the last verified commit; re-plan with the missing constraint |
| `/rewind` didn't undo a change | It was made by a Bash command or a subagent (not tracked by checkpoints) | Use git: `git diff`, `git restore <file>` |
| Tests pass but behaviour is wrong | Tests weakened, skipped, or not contract-driven | `/verify-unit` flags skips; `contract-auditor` checks a test per error code; never let the agent edit tests to go green |

### Permissions, hooks and safety

| Symptom | Likely cause | Fix |
|---|---|---|
| Constant permission prompts | Missing allow rules | Add specific rules (`Bash(npm test *)`) to `.claude/settings.json`; or work in auto mode |
| An allow rule doesn't work | A deny/ask rule matches first (deny → ask → allow), or wrong syntax (`Bash(git * main)` style) | Check `/permissions`; put the `*` after the subcommand: `Bash(git log *)` |
| Startup warning about a rule | Typo in a tool name, or `Write(...)` path rule (only `Edit`/`Read` paths are checked) | Use canonical tool names; `Edit(docs/**)` instead of `Write(docs/**)` |
| `secret-guard` blocks a legitimate test fixture | Fixture looks like a real key | Use an obviously fake value (`example`, `test-key`) or add `secret-guard: allow` on that line |
| A hook doesn't run | Not executable; wrong path; invalid JSON in settings | `chmod +x .claude/hooks/*`; use `${CLAUDE_PROJECT_DIR}` paths; `jq empty .claude/settings.json`; check `/hooks` |
| Every turn feels slow | A heavy hook (tests, network) | Move it to `/verify-unit` / `/verify-app`; hooks must take milliseconds |
| Hook writes to the wrong checkout in a worktree | `${CLAUDE_PROJECT_DIR}` stays at the session's start directory | Read the `cwd` field from the hook's stdin JSON for the worktree path |

### Worktrees and parallel sessions

| Symptom | Likely cause | Fix |
|---|---|---|
| New worktree fails: missing `.env` / `node_modules` | Worktrees are fresh checkouts | `.worktreeinclude` listing `.env` etc.; run `npm install` in each worktree |
| Untracked files from worktrees show in `git status` | `.claude/worktrees/` not ignored | Add `.claude/worktrees/` to `.gitignore` (the kit does) |
| Worktree won't remove: locked | A session or agent still holds it | Exit the session; `git worktree unlock <path>` then `git worktree remove <path>` |
| LFS files are pointers inside a worktree | Repo-local LFS filter skipped for safety | `git lfs pull` inside the worktree |
| Parallel branches conflict at merge | Overlapping ownership | Re-split so units share no files; the contract, not either branch, is the sync point |

### Integrations, preview and deploy

| Symptom | Likely cause | Fix |
|---|---|---|
| OAuth fails inside the Desktop Browser pane | Embedded browsers can't complete most OAuth flows | Sign in in a real browser (`vercel dev` or production), copy the token into the preview's storage for testing |
| Works locally, fails in production | Missing/incorrect env vars, or provider config still pointing at localhost | Env audit ([deploy prompt 1](../prompts/deploy/README.md#1-environment-audit-before-deploy)); update redirect URIs, webhook endpoints; redeploy |
| "Deployed successfully" but features broken | A deploy command isn't proof | Live acceptance checks against every `CONTRACT.md` §1 criterion |
| Supabase migration "up to date" but tables missing | Migration history out of sync with the database | Inspect the migration table; repair that migration's state; re-push; migrations must be idempotent |
| MCP server tools missing | Server failed to start or needs auth | `/mcp` to check status and authenticate; `claude mcp list` |
| `/voice` or `/schedule` "unknown command" | An API key or third-party provider overrides your claude.ai sign-in | Remove `ANTHROPIC_API_KEY` / `apiKeyHelper` from env/settings; `/login` |

### Automation

| Symptom | Likely cause | Fix |
|---|---|---|
| `/goal` never resolves | Condition not provable from Claude's output | Restate as a command result ("`npm test` exits 0") + scope + "or stop after N turns" |
| `/loop /verify-unit` prints the text instead of running | `/loop` can't fire skills with `disable-model-invocation: true` | Loop over a plain prompt that runs the commands |
| `/loop` stopped | Session closed, or the 7-day expiry | Use a routine (`/schedule`) or a Desktop scheduled task for durable schedules |
| Routine shows green but did nothing | Green means the session ran, not that the task succeeded | Open the run's transcript; make the prompt report on quiet runs too |
| Claude GitHub Action doesn't run | No secret, app not installed, or fork PR (secrets withheld) | Add `ANTHROPIC_API_KEY`/`CLAUDE_CODE_OAUTH_TOKEN`; install the Claude GitHub App; same-repo branches only |

### Plugins

| Symptom | Likely cause | Fix |
|---|---|---|
| Plugin changes not visible | `version` not bumped, or not reloaded | Bump `version` in `plugin.json`; `/plugin marketplace update <name>`; `/reload-plugins` |
| `marketplace add` finds nothing | `marketplace.json` not at `<repo>/.claude-plugin/marketplace.json` | Move it to the repo root's `.claude-plugin/`; relative sources must start with `./` |
| Validation errors | Schema problems | `claude plugin validate .` and `claude plugin validate <plugin-dir>` |

## Verified when…
- [ ] The symptom is gone **and** `/verify-unit` (or `doctor.sh`) is green.
- [ ] If it could recur, a rule, skill, hook or plan constraint now prevents it — committed.

## Three Standards check
- **Scale:** Did you fix the system (documents, kit) or just this instance?
- **Secure:** Did the fix widen permissions? Prefer the narrowest rule that works.
- **Understand:** Can you state the root cause in one sentence?

## Common mistakes
- Debugging inside a degraded, saturated session instead of resetting to a verified baseline.
- Turning on bypass mode to make prompts go away.
- Fixing symptoms in code without updating the document that allowed them.

## Course reference
Collected from every module's failure cases — Module 2 (refactor rollback, hooks), Module 4 (worktree `.env`, migration history, OAuth production fixes), Module 5 (OAuth in preview, contract mismatches), Module 6 (reconciliation), plus current-docs troubleshooting pages.
