# Beginner's guide — from zero to your first verified feature

**Who this is for:** anyone who can open a terminal and has written a little code, but has never used Claude Code, this playbook, or an "agentic" workflow.
**What you'll be able to do at the end:** install everything, find your way around this repository, run Claude Code safely, build a small project feature-by-feature with verified commits, and apply the same kit to your own projects.
**Time:** about 2–3 hours the first time. Do it in order — each part builds on the last. Every part ends with a **✅ Check** so you know you're ready to move on.

> **How to use this page.** Grey boxes are things you copy. Lines that start with `$` are not part of the command — just copy what's after it, or copy the whole box when there's no `$`. Text in `[square brackets]` is a placeholder: replace it with your own words.

---

## Contents

0. [Words you'll see](#part-0--words-youll-see)
1. [Install the tools](#part-1--install-the-tools)
2. [Get the playbook and look around](#part-2--get-the-playbook-and-look-around)
3. [Your first Claude Code session (safe practice)](#part-3--your-first-claude-code-session-safe-practice)
4. [The idea behind it all, in five minutes](#part-4--the-idea-behind-it-all-in-five-minutes)
5. [Build a small project from scratch, step by step](#part-5--build-a-small-project-from-scratch-step-by-step)
6. [Use the kit on a project you already have](#part-6--use-the-kit-on-a-project-you-already-have)
7. [Everyday habits](#part-7--everyday-habits)
8. [Safety rules for beginners](#part-8--safety-rules-for-beginners)
9. [When something goes wrong](#part-9--when-something-goes-wrong)
10. [Where to go next](#part-10--where-to-go-next)

---

## Part 0 — Words you'll see

You don't need to memorise these. Come back when a word is unfamiliar.

| Word | Plain meaning |
|---|---|
| **Terminal** | The text window where you type commands (Terminal on macOS, PowerShell or WSL on Windows). |
| **Repository (repo)** | A project folder whose history is tracked by **git**. |
| **Commit** | A saved snapshot of your changes with a message. You can always go back to a commit. |
| **Branch** | A separate line of work, so experiments don't touch your main code. |
| **Claude Code** | Claude working directly in your project: it reads files, runs commands, and edits code — with your permission. |
| **Session** | One conversation with Claude Code in one folder. |
| **Prompt** | What you type to Claude. |
| **Plan mode** | A mode where Claude may read and plan but **cannot edit files** until you approve. |
| **Permission prompt** | Claude asking "may I run this / edit this?". You answer yes or no. |
| **`CLAUDE.md`** | A short file of standing instructions that Claude reads at the start of every session in that project. |
| **Skill** | A saved procedure Claude can follow — e.g. `/verify-unit` checks your work. You run some by typing `/name`. |
| **Subagent** | A helper Claude with a narrow job (e.g. "find problems in this code"), working in its own fresh context. |
| **Hook** | A tiny script that runs automatically at certain moments — e.g. blocking a file write that contains a password. |
| **PRD** | Product Requirements Document — what you're building, for whom, and how you'll know it worked. |
| **Contract (`CONTRACT.md`)** | The exact promise your API makes: every endpoint, field, and error. Code must match it. |
| **Build sequence** | The ordered list of small steps ("units") to build the product. |
| **Unit** | One small, complete change that can be tested and committed on its own. |
| **Verified** | Proven by commands (type check, tests), not by "it looks fine". |

---

## Part 1 — Install the tools

Instructions are for **macOS**. Windows and Linux notes are at the end of this part.

### 1.1 Open a terminal and learn four commands

Open **Terminal** (press `Cmd+Space`, type "Terminal", press Enter). Try:

```bash
pwd
```
Shows the folder you're in.

```bash
ls
```
Lists the files in that folder.

```bash
mkdir -p ~/code && cd ~/code
```
Creates a `code` folder in your home folder and moves into it. (`~` means your home folder.)

```bash
cd ..
```
Moves up one folder.

### 1.2 Install Homebrew (a tool installer for macOS)

Skip this if `brew --version` already prints a version.

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```
Follow the instructions it prints at the end (it may ask you to copy two lines to finish setup).

### 1.3 Install git and tell it who you are

```bash
brew install git
```
```bash
git config --global user.name "Your Name"
```
```bash
git config --global user.email "you@example.com"
```

### 1.4 Install Node.js (22 or newer)

The worked example and the hooks use Node.js.

```bash
brew install node
```
```bash
node --version
```
It should print `v22.x` or higher.

### 1.5 Install Claude Code and sign in

You need a Claude **Pro, Max, Team or Enterprise** plan, or a Claude Console account. (The free plan does not include Claude Code.)

```bash
curl -fsSL https://claude.ai/install.sh | bash
```
Open a **new** terminal window, then:

```bash
claude --version
```
```bash
claude doctor
```
`claude doctor` should end with "No installation issues found".

Now start Claude once so you can sign in:

```bash
claude
```
A browser window opens — sign in, then come back to the terminal. Type `/exit` to leave.

### 1.6 Nice to have

| Tool | Why | Install |
|---|---|---|
| **GitHub CLI** (`gh`) | Create repos and pull requests from the terminal | `brew install gh` then `gh auth login` |
| **jq** | Check JSON files | `brew install jq` |
| **VS Code** | A code editor that shows Claude's changes as diffs | [code.visualstudio.com](https://code.visualstudio.com) |
| **Claude Desktop app** | Visual diffs, side-by-side sessions, built-in browser preview | [claude.com/download](https://claude.com/download) — use its **Code** tab |

> **Windows:** install [Git for Windows](https://git-scm.com/downloads/win) and [Node.js](https://nodejs.org), then in **PowerShell** run `irm https://claude.ai/install.ps1 | iex`. The playbook's shell scripts (`scripts/*.sh`) need a Bash shell — use **WSL** (recommended) or Git Bash.
> **Linux:** use your package manager for git and Node 22+, then the same `curl … install.sh | bash` command as macOS.

### ✅ Check
- [ ] `git --version`, `node --version` (22+), and `claude --version` all print versions.
- [ ] `claude doctor` reports no installation issues.
- [ ] You signed in to Claude Code once.

---

## Part 2 — Get the playbook and look around

### 2.1 Download it

```bash
git clone https://github.com/deeprajsshetty/agentic-engineering-playbook ~/agentic-engineering-playbook
```
```bash
cd ~/agentic-engineering-playbook
```

> If the GitHub repo still has its old name, clone `https://github.com/deeprajsshetty/claude-code-bootcamp` instead — keep the same target folder (`~/agentic-engineering-playbook`) so every command in this guide works.

### 2.2 Take the tour

| Folder / file | What's inside | When you'll use it |
|---|---|---|
| `README.md` | Overview and the lifecycle diagram | First |
| `docs/` | The full guide, one page per stage (00 → 13) | When you want to understand a stage |
| `CHEATSHEET.md` | One-page summary of commands and prompts | Keep it open while working |
| `prompts/` | Copy-paste prompts grouped by stage | Every day |
| `templates/` | Fill-in-the-blank planning documents (PRD, contract…) | Starting a project or feature |
| `kit/` | The `.claude/` setup that gets copied into your projects | Through the scripts |
| `scripts/` | `bootstrap-new.sh`, `adopt-existing.sh`, `doctor.sh` | Starting or adopting a project |
| `plugin/` | A personal plugin with your coding standards | Once, to install it |
| `examples/taskr-api/` | A complete small project built with this method | To learn by example |

### 2.3 Prove the toolkit works on your machine

```bash
scripts/test-hooks.sh
```
You should see `28 passed, 0 failed`. This proves the safety hook blocks fake secrets correctly.

```bash
scripts/test-scripts.sh
```
You should see `21 passed, 0 failed`.

### ✅ Check
- [ ] The playbook is in `~/agentic-engineering-playbook`.
- [ ] Both test scripts pass.

---

## Part 3 — Your first Claude Code session (safe practice)

You'll practise on the finished example project, in a mode where Claude **can't change anything**.

### 3.1 Install and test the example

```bash
cd ~/agentic-engineering-playbook/examples/taskr-api
```
```bash
npm ci
```
```bash
npm test
```
Expect `Tests 107 passed`. This is a small "tasks" API (create, list, update, delete tasks).

### 3.2 Start Claude in plan mode

```bash
claude --permission-mode plan
```
At the bottom of the screen you'll see `⏸ plan mode on`. In plan mode Claude may read files and suggest, but edits are blocked.

### 3.3 Ask questions

Type each of these and read the answers:

```text
What is this project, and which files would I read first to understand it?
```
```text
Explain what happens, file by file, when someone sends POST /api/v1/tasks with a missing title.
```
```text
Which document is the "source of truth" for error codes, and how do the tests make sure the code follows it?
```

Good answers mention `CLAUDE.md`, `CONTRACT.md`, `src/routes/tasks.ts`, `src/validation.ts`, and `tests/contract.test.ts`. That's the playbook working: Claude found its bearings from the documents.

### 3.4 Try three built-in commands

| Type this | What it shows |
|---|---|
| `/help` | All commands |
| `/context` | What's taking up Claude's memory right now |
| `/status` | Your account, model and settings |

### 3.5 Try a kit command

```text
/plan-feature Add GET /api/v1/tasks/count that returns how many tasks exist
```
Claude will ask you questions **one at a time**. Answer them briefly. At the end you get a plan of small units — and Claude says it won't edit anything until you approve. Don't approve; this was practice. Type `/exit`.

### 3.6 Understand permission prompts

When you're not in plan mode, Claude asks before risky actions. A prompt looks roughly like this (exact wording varies by version):

```text
Claude wants to run: npm install express
  1. Yes   2. Yes, and don't ask again for this command   3. No, and tell Claude what to do differently
```

- **Yes** when you understand the command and expected it.
- **No** when you don't understand it — then ask *"Why do you need that?"*.
- Be careful with "don't ask again" for anything that changes files, installs packages, or uses the network.

### ✅ Check
- [ ] You ran a session in plan mode and asked questions.
- [ ] You saw `/plan-feature` ask clarifying questions and produce a plan.
- [ ] You know what a permission prompt looks like and how to answer it.

---

## Part 4 — The idea behind it all, in five minutes

**You are the director, not the typist.** You decide *what* to build and *how it's checked*. Claude does the typing. Three habits make that safe:

1. **Write it down first.** Short planning documents (PRD → contract → build sequence) tell Claude exactly what to build. Without them, Claude guesses — and guesses differently each time.
2. **One small unit at a time.** Build one unit → check it with commands → understand it → commit it. Never pile up five unchecked changes.
3. **Check, then judge.** Commands prove it works (types, tests). An independent reviewer looks for problems. You decide.

Before you accept anything, ask the **Three Standards**:

| Question | What it means |
|---|---|
| **Does it scale?** | Could someone else (or another Claude session) continue from the documents alone? |
| **Is it secure?** | No passwords or keys in the code, nothing changed outside what you asked. |
| **Do I know exactly why it works?** | Can you point to where it happens and why? If not, ask Claude to explain before you commit. |

The loop you'll repeat for every unit:

```text
plan  →  build ONE unit  →  /verify-unit  →  explain it back  →  /ship-unit  →  next unit
```

More depth: [docs/00 — Mental model](00-mental-model.md).

---

## Part 5 — Build a small project from scratch, step by step

You'll build **quotes-api**: a tiny API that stores quotes and returns a random one. The project is deliberately small so you can focus on the method.

### 5.1 Create the project

```bash
~/agentic-engineering-playbook/scripts/bootstrap-new.sh --dry-run ~/code/quotes-api
```
This *shows* what would be created without creating anything. Now do it for real:

```bash
~/agentic-engineering-playbook/scripts/bootstrap-new.sh ~/code/quotes-api
```
You'll see a list of created files, `Summary: … created`, and a first commit. Move into the project:

```bash
cd ~/code/quotes-api
```
```bash
ls
```
You'll see `CLAUDE.md`, `PRD.md`, `CONTRACT.md`, `BUILD_SEQUENCE.md` (all still blank templates), plus `.claude/` (the kit) and `context/`.

> Using a project generator like `create-next-app`? Generators refuse non-empty folders. Run the generator first, then use `adopt-existing.sh` (Part 6) instead of `bootstrap-new.sh`.

### 5.2 Start Claude with access to the playbook's templates

```bash
claude --add-dir ~/agentic-engineering-playbook --permission-mode plan
```
`--add-dir` lets Claude read the playbook's templates and their generation prompts while working in your project.

### 5.3 Write the PRD (what and why)

Paste this prompt:

```text
I'm building quotes-api: a tiny JSON API where I can add quotes (text + author) and get
a random quote. Users: me, and a small website that shows a "quote of the moment".
Constraints: Node 22, TypeScript, Express, in-memory storage, no authentication, no UI.

Fill in PRD.md using its existing structure (the generation prompt is in the playbook's
templates/PRD.md). Ask me clarifying questions one at a time until you're 95% confident.
Keep it short. Every success criterion must be checkable by a test or a command.
```

Answer the questions. When Claude proposes the PRD, check:
- The **Must-Have** list only has what you asked for (add, list, random).
- Each **success criterion** is checkable (e.g. "GET /api/v1/quotes/random returns 404 QUOTE_NOT_FOUND when there are no quotes").

Plan mode blocks edits, so switch mode when you're happy: press `Shift+Tab` until the status bar shows `accept edits on`, then say:

```text
Write the approved PRD into PRD.md.
```

Switch back to plan mode (`Shift+Tab` until `⏸ plan mode on`) for the next step.

### 5.4 Write the contract (the exact promise)

```text
Read PRD.md. Fill in CONTRACT.md using its existing structure (generation prompt in the
playbook's templates/CONTRACT.md). Ask me clarifying questions one at a time until you're
95% confident. Every error must use { "error": { "code", "message", "details"? } } with an
UPPER_SNAKE_CASE code listed in the error catalogue. Don't write any code.
```

Check the proposed contract:
- Every endpoint has: method, path, request body, success response, and each error with its HTTP status and `error.code`.
- Every error code appears in the catalogue table.
- You could explain each endpoint to a friend.

Switch to accept-edits mode, write it to `CONTRACT.md`, switch back to plan mode.

### 5.5 Write the build sequence (the steps)

```text
Read CONTRACT.md. Fill in BUILD_SEQUENCE.md: the smallest units that can each be built,
tested and committed on their own. Unit 1 must be: project setup + GET /health + the error
envelope + the test setup. For each unit give the expected files and one sentence saying
exactly what I'd check to call it verified. Don't write code.
```

A good result for quotes-api looks like:

| # | Unit | Verified when… |
|---|---|---|
| 1 | Setup, `/health`, error envelope, tests | typecheck passes; `/health` returns 200; unknown path returns 404 `NOT_FOUND` |
| 2 | `POST /api/v1/quotes` | 201 with the quote; missing text → 400 `VALIDATION_ERROR` |
| 3 | `GET /api/v1/quotes` | returns all quotes; empty list works |
| 4 | `GET /api/v1/quotes/random` | returns one quote; none stored → 404 `QUOTE_NOT_FOUND` |

Write it to `BUILD_SEQUENCE.md` (accept-edits mode). Then commit the plan yourself:

```bash
git add PRD.md CONTRACT.md BUILD_SEQUENCE.md && git commit -m "docs: PRD, contract and build sequence"
```
(Type `!` before a command inside Claude to run it in your shell, or use a second terminal window.)

### 5.6 Fill in CLAUDE.md (standing orders)

```text
Fill in CLAUDE.md for this project. Stack: Node 22, TypeScript strict, Express, Vitest +
supertest, in-memory store. Commands section must list: npm install, npm run dev,
npm run typecheck, npm test. Keep it under one page and point to PRD.md, CONTRACT.md and
BUILD_SEQUENCE.md instead of repeating them.
```
Approve the edit, read the result, and commit it.

### 5.7 Build unit 1

Switch to accept-edits mode (`Shift+Tab` until `accept edits on`). Paste:

```text
Read CLAUDE.md, CONTRACT.md and BUILD_SEQUENCE.md unit 1. Build unit 1 only: set up
package.json, TypeScript, Express, Vitest and supertest; add GET /health and the error
envelope with a NOT_FOUND fallback for unknown paths; add tests for both.
Don't build anything from later units. When done, run /verify-unit and show me the report.
Don't commit.
```

Claude will ask to run `npm install …` — say **yes** (you expected it). When it's done you should see:

```text
UNIT VERIFIED
Typecheck : PASS — exit 0
Tests     : PASS — n passed, 0 failed, 0 skipped
Diff scope: PASS
Secrets   : PASS — none found
```

If you see `UNIT FAILED`, read which line failed and ask: *"Fix the failing [typecheck/tests] only. Don't change anything else."* Then run `/verify-unit` again.

### 5.8 Understand it, then commit it

Before committing, make sure you know why it works:

```text
In five short bullets: what changed, where each part lives, which CONTRACT.md section each
behaviour satisfies, and where unit 2 will plug in.
```

If any bullet surprises you, ask about it. Then:

```text
/ship-unit
```
`/ship-unit` re-checks, stages only the unit's files, and writes a commit message like `feat(health): …`. Approve the commit prompt. It never pushes.

### 5.9 Repeat for units 2, 3, 4

For each unit, use the same prompt as 5.7 with the unit number and description changed, then `/verify-unit` → explain → `/ship-unit`. After unit 4:

```bash
git log --oneline
```
You'll see one commit per unit — a clean, readable history.

### 5.10 Final checks

```text
/verify-app
```
Runs the full suite and build. Then the independent review:

```text
/audit CONTRACT.md
```
`/audit` lists problems under Structural / Consistency / Visual and asks the `code-reviewer` and `contract-auditor` subagents for a second opinion. **Expect findings — that's normal and useful.** Fix them **one at a time** (Structural first), running `/verify-unit` after each. Then:

```text
Append this audit and how each finding was resolved to AUDIT_LOG.md.
```

### 5.11 Health check and publish (optional)

```bash
~/agentic-engineering-playbook/scripts/doctor.sh .
```
Expect `0 fail`. To put it on GitHub (needs `gh`):

```bash
gh repo create quotes-api --private --source . --push
```

### ✅ Check
- [ ] `PRD.md`, `CONTRACT.md`, `BUILD_SEQUENCE.md` and `CLAUDE.md` are filled in and committed.
- [ ] Each unit has its own commit, made after `UNIT VERIFIED`.
- [ ] `/verify-app` passes and `AUDIT_LOG.md` has an entry.
- [ ] You can explain how a request flows through your code.

For comparison, `examples/taskr-api` is the same process on a slightly bigger API — read its [WALKTHROUGH.md](../examples/taskr-api/WALKTHROUGH.md).

---

## Part 6 — Use the kit on a project you already have

Short version (full version: [docs/10 — Brownfield adoption](10-brownfield-adoption.md)):

1. **Start clean, on a new branch:**
   ```bash
   cd ~/code/your-project
   ```
   ```bash
   git status
   ```
   It must say "nothing to commit". Then:
   ```bash
   git switch -c chore/adopt-agentic-kit
   ```
2. **Preview, then add the kit** (it never overwrites your files — if a file already exists it saves the kit's version as `<file>.kit-new`):
   ```bash
   ~/agentic-engineering-playbook/scripts/adopt-existing.sh --dry-run .
   ```
   ```bash
   ~/agentic-engineering-playbook/scripts/adopt-existing.sh .
   ```
3. **Merge any `.kit-new` files** by hand (open both versions, keep what you need), delete the `.kit-new` files, and commit:
   ```bash
   git add .claude context CLAUDE.md .gitignore .env.example .worktreeinclude.example && git commit -m "chore: adopt agentic kit"
   ```
4. **Let Claude map your project** (no code edits):
   ```bash
   claude --add-dir ~/agentic-engineering-playbook --permission-mode manual
   ```
   ```text
   /onboard-repo
   ```
   Read its drafts of `CLAUDE.md` and `context/` files carefully — they must describe your project **as it really is**, including its messy parts. Approve, then commit.
5. **Prove it with one small change** — something tiny and testable. Use the loop from Part 5: `/plan-feature` → build → `/verify-unit` → `/ship-unit`.
6. **Health check:**
   ```bash
   ~/agentic-engineering-playbook/scripts/doctor.sh .
   ```

---

## Part 7 — Everyday habits

| When | Do this |
|---|---|
| Starting work | `git status` (clean?), open `BUILD_SEQUENCE.md`, start Claude, ask *"What's the next unit?"* |
| Before anything big or unclear | Plan mode + the 95% prompt: *"Ask me clarifying questions one at a time until you're 95% confident, then plan. Don't edit files until I approve."* |
| After every unit | `/verify-unit` → explain it back → `/ship-unit` |
| Claude got something wrong | One correction per message: *"[Thing] is [problem] rather than [what CONTRACT.md says]. Fix only that."* ([more patterns](../prompts/correction-patterns.md)) |
| Conversation feels long or confused | `/compact keep: current unit and decisions` — or `/handoff`, then `/clear` and start fresh |
| Want to undo Claude's last steps | `/rewind` (or press `Esc` twice on an empty prompt) |
| Stopping for the day | `/handoff` writes `HANDOFF.md`; commit or stash your work |
| Quick side question | `/btw [question]` — doesn't clutter the main conversation |

---

## Part 8 — Safety rules for beginners

1. **Never paste passwords, API keys or tokens into a prompt or a file Claude writes.** Put them in a `.env` file (the kit keeps `.env` out of git and blocks Claude from reading or writing it).
2. **Commit before any big change.** A commit is your undo button.
3. **Work on a branch** for anything experimental: `git switch -c try/[idea]`.
4. **Read before you approve.** If you don't understand a command or a change, say no and ask why.
5. **Don't use "bypass permissions" mode** (`--dangerously-skip-permissions`) on your own computer. It's only for throwaway containers.
6. **Check the diff** before committing: `git diff` (or the diff pane in the Desktop app).
7. **"Deployed" is not "working".** After deploying, actually use the live app.

What the kit already does for you: it asks before `git commit`/`push` and package installs, blocks `rm -rf`, `curl`, `wget` and force-pushes, blocks reading `.env` files, and its `secret-guard` hook blocks writes that look like real keys or passwords. These are safety nets, not guarantees — rules 1–7 still apply.

---

## Part 9 — When something goes wrong

| What you see | What to do |
|---|---|
| `command not found: claude` | Open a **new** terminal window; if still missing, re-run the installer from 1.5. |
| `/verify-unit` or `/ship-unit` isn't recognised | You're not in a project with the kit. Run `ls .claude/skills` — if empty, use `bootstrap-new.sh` or `adopt-existing.sh`. |
| `UNIT FAILED — Typecheck` | Ask: *"Fix only the type errors listed in the report."* Re-run `/verify-unit`. |
| `UNIT FAILED — Diff scope` | Claude touched files outside the unit. Ask: *"Undo the changes to [files]; they're outside this unit."* |
| `secret-guard: … detected` | Good — it stopped a secret. Move the value to `.env` and reference it with `process.env.NAME`. |
| Too many permission prompts | Approve the safe, repeated ones with "don't ask again" (tests, typecheck), or see `/permissions`. |
| Claude seems to forget earlier decisions | `/compact keep: …`, or `/handoff` then `/clear`. Make sure decisions are written in the documents, not just the chat. |
| `Shift+Tab` doesn't reach plan mode in two presses | Keep pressing until the status bar shows `⏸ plan mode on` (the order is auto → manual → accept edits → plan). |
| Everything is a mess | `git status` → `git restore .` returns to your last commit (uncommitted changes are lost). Then re-plan. |

Full list: [docs/13 — Troubleshooting](13-troubleshooting.md).

---

## Part 10 — Where to go next

1. **Keep [CHEATSHEET.md](../CHEATSHEET.md) open** while you work.
2. **Read the lifecycle docs in order** when you want depth: [00](00-mental-model.md) → [02](02-discover-and-plan.md) → [03](03-context-engineering.md) → [05](05-build.md) → [06](06-verify.md). Then [04 — Design](04-design.md) if you build UIs, [07 — Automate](07-automate.md) when you're comfortable, [09 — Ship](09-ship-and-operate.md) before going live.
3. **Install the personal plugin** so your standards follow you to every project (once the repo is public on GitHub):
   ```text
   /plugin marketplace add deeprajsshetty/agentic-engineering-playbook
   /plugin install my-standards@deeprajsshetty-standards
   /reload-plugins
   ```
4. **Doing this for a client or team?** Read [docs/12 — FDE playbook](12-fde-playbook.md).

You've finished the beginner's path. From here on, the method is the same at any size: write it down, build one small unit, prove it, understand it, commit it.
