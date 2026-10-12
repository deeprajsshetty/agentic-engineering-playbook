# 07 — Automate safely

## Goal
Let Claude work with fewer interruptions — longer autonomous runs, scheduled checks, CI review — without giving up the escape hatch.

## Which surface
- **CLI** for permission modes, `/goal`, `/loop`, `/schedule` and headless `claude -p`.
- **claude.ai/code/routines** (or `/schedule`) for cloud routines that run when your machine is off.
- **Desktop** for local scheduled tasks and the PR monitor.
- **GitHub Actions** for CI review.

## Inputs → Outputs
- **In:** a verified baseline, a tightly scoped task, a measurable stop condition.
- **Out:** reviewed diffs from unattended runs; scheduled health reports; automated PR review — none of which push to `main` on their own.

## Steps

### 1. Choose the permission mode deliberately

| Mode (`--permission-mode`) | Runs without asking | Use for |
|---|---|---|
| `default` / Manual | Reads only | Sensitive or unfamiliar repos |
| `acceptEdits` | Reads, edits, common file commands | Iterating on code you're reviewing |
| `plan` | Reads (+ classifier-approved commands) | Exploring and planning — edits blocked until you approve |
| `auto` | Everything, with a classifier reviewing each action | Long tasks; the default starting mode in current versions (falls back to Manual where unavailable) |
| `dontAsk` | Only pre-approved tools; everything else denied | CI and scripts |
| `bypassPermissions` | Everything | **Only** inside a container/VM |

Cycle in a session with `Shift+Tab` (auto → manual → accept edits → plan). Deny rules apply in every mode, including bypass. Make durable rules in `.claude/settings.json`; session-only changes with `/permissions`.

### 2. The escape hatch — non-negotiable for any unattended run
1. **Commit first** (`git status` clean).
2. **Dedicated branch** (`git switch -c auto/<task>`).
3. **Tight scope** — name the directories it may touch and what it must not change.
4. **Measurable stop condition** — a command whose output proves "done".

Afterwards: review the diff, `/verify-app`, then commit. If it went wrong, discard the branch — don't fix forward.

### 3. `/goal` — keep working until a condition holds
```text
/goal all tests in tests/tasks pass and npx tsc --noEmit exits 0; only files in src/tasks/ and tests/tasks/ change; or stop after 20 turns
```
After each turn a separate evaluator model checks the condition against the conversation. `/goal` shows status; `/goal clear` stops it. It doesn't change permissions — run it in auto mode for unattended turns. The evaluator can't run commands itself, so the condition must be provable by output Claude produces. More: [refactor prompt 4](../prompts/refactor/README.md#4-goal--keep-going-until-a-condition-is-true).

### 4. Scheduling — pick by where it must run

| | `/loop` | Desktop scheduled task | Routine (cloud) |
|---|---|---|---|
| Runs on | Your machine, open session | Your machine | Anthropic cloud (fresh clone) |
| Survives closing the session | No (7-day expiry) | Yes | Yes |
| Minimum interval | 1 minute | 1 minute | 1 hour |
| Local files | Yes | Yes | No |
| Create with | `/loop 5m <prompt>` | Desktop → Routines → New → Local | `/schedule …` or claude.ai/code/routines |

Routines (research preview) can also fire from an **API** call or a **GitHub** event (PR, release). They run autonomously with no permission prompts — scope repos, network and connectors tightly, and write [self-contained prompts](../prompts/deploy/README.md#5-nightly-routine-prompt-self-contained) that say what to do when nothing is actionable.

Note: `/loop` can't run skills marked `disable-model-invocation` (like the kit's `/verify-unit`) — they reach Claude as plain text. Loop over a plain prompt instead.

### 5. Headless runs (`claude -p`)
```bash
claude -p "Run the test suite and summarise failures" \
  --permission-mode dontAsk --allowedTools "Bash(npm test *)" "Read"
```
Add `--output-format stream-json --verbose` to see progress; `--max-turns` to bound it. `claude -p "/goal …"` runs a goal loop to completion.

### 6. Claude in GitHub Actions
Fastest: `/install-github-app` in a Claude Code session (needs `gh`; installs the Claude GitHub App, stores the secret, opens a PR with workflows). Manual: install the app, add `ANTHROPIC_API_KEY` (or `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token`) as a repo secret, add a workflow using `anthropics/claude-code-action@v1`.

This playbook ships [`.github/workflows/claude-review.yml`](../.github/workflows/claude-review.yml): runs the `code-review` plugin on every same-repo PR and posts inline comments — and **skips cleanly** when no secret is configured, so CI stays green until you opt in.

### When to use something else
- Want reviews without maintaining a workflow file: Anthropic's managed [Code Review](https://code.claude.com/docs/en/code-review).
- React to events pushed into a running session (CI failure, chat message): [channels](https://code.claude.com/docs/en/channels).

## Verified when…
- [ ] Every unattended run started from a clean commit on a dedicated branch.
- [ ] Its diff touches only the declared scope and `/verify-app` passes before merge.
- [ ] Scheduled jobs report on quiet days too (you know they ran).
- [ ] The GitHub Action either runs on PRs or logs "No Claude secret configured — skipping".

## Three Standards check
- **Scale:** Is the automation reproducible from files in the repo (workflow YAML, routine prompt saved in docs), not just your memory?
- **Secure:** Bypass only in isolation; routine connectors and network scoped; secrets in GitHub Secrets; actions run under your identity — would you sign every commit they make?
- **Understand:** For each automated run, can you say what would make it stop?

## Common mistakes
- `--dangerously-skip-permissions` on your laptop with your real credentials loaded.
- A `/goal` condition the evaluator can't check ("code is clean") — it never resolves or resolves wrongly.
- Routine prompts that assume context ("fix the usual thing").
- Auto-merge without comprehensive CI.
- Polling with `/loop` for something that should be a routine (it stops when you close the terminal).

## Course reference
Module 2 — Permissions, YOLO Mode and Autonomous Execution; Routines; '/Goal' Command. Module 3 — PR monitoring modes, execution environments. GitHub Actions and headless mode are beyond the course — verified against current docs.
