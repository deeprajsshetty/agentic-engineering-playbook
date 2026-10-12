# 11 — Greenfield kickoff: a new project from zero

## Goal
Go from idea to a deployed, verified first version with every document, gate and commit in place from day one.

## Which surface
Claude.ai Project → Claude Code (Plan mode) → terminal (bootstrap script) → Claude Design (if UI) → Claude Code Desktop (build, parallel worktrees, preview) → CLI (deploy). Each step below names its surface.

## Inputs → Outputs
- **In:** an idea or brief; the Golden Path stack (TypeScript, Next.js, Supabase, Vercel) unless the PRD says otherwise.
- **Out:** a repo with PRD, CONTRACT, BUILD_SEQUENCE, CLAUDE.md, the kit, a history of one commit per verified unit, a production deployment, and a final `AUDIT_LOG.md` entry.

## Steps

### 1. Discovery and PRD — Claude.ai Project
Create a Project. Run the [discovery interview](../prompts/plan/README.md#2-discovery-interview-before-the-prd), then the [PRD generation prompt](../templates/PRD.md). Upload the approved PRD as Project knowledge. Details: [02](02-discover-and-plan.md).

### 2. Bootstrap the repository — terminal
```bash
~/agentic-engineering-playbook/scripts/bootstrap-new.sh --dry-run ~/code/my-app
~/agentic-engineering-playbook/scripts/bootstrap-new.sh --ui --name "My App" ~/code/my-app   # --ui only if there's a frontend
```
> **Using a framework generator (e.g. `create-next-app`)?** Generators refuse a non-empty folder. Run the generator **first**, commit, then apply the kit with [`adopt-existing.sh`](10-brownfield-adoption.md) and copy the planning templates you need. Use `bootstrap-new.sh` when you'll add the stack by hand.

It creates the folder, `git init -b main`, copies the kit, creates `CLAUDE.md`, `PRD.md`, `CONTRACT.md`, `BUILD_SEQUENCE.md`, `AUDIT_LOG.md`, `CONTRIBUTING.md`, `docs/adr/`, (with `--ui`) `docs/DESIGN_SPEC.md`, `docs/DESIGN_STANDARD.md`, `docs/MOTION_BRIEF.md` — generation prompts stripped — writes `.gitignore`, a `.claude/.kit-bootstrap` marker and `.worktreeinclude.example`, and commits **only the files it created**. Re-running it on a clean tree adds only what's missing; it refuses a dirty tree and any non-empty folder it didn't create (use [adopt-existing](10-brownfield-adoption.md) for those).

Real output:
```text
✔ git init (branch main)
✔ create     CLAUDE.md
✔ create     PRD.md
✔ create     docs/DESIGN_SPEC.md
Summary: 38 created · 0 unchanged · 0 conflict(s)
✔ committed: chore: bootstrap project from agentic-engineering-playbook (d5e52b6)
```
Replace the placeholder `PRD.md` with your approved one and commit. Create the remote:
```bash
cd ~/code/my-app && gh repo create my-app --private --source . --push
```

### 3. Contract and build sequence — Claude Code, Plan mode
```bash
claude --add-dir ~/agentic-engineering-playbook --permission-mode plan
```
Fill `CONTRACT.md` and `BUILD_SEQUENCE.md` with their generation prompts (in the playbook's `templates/`; the structure is already in your files). Unit 1 is almost always: *scaffold + health check + error envelope + test harness*. Mark which later units can run in parallel and their contract sync point.

### 4. Stack and standing orders
Add the stack by hand (or see the generator note in step 2), add the test runner, then fill `CLAUDE.md`: stack, **Commands** (exact typecheck/test/build), structure, never-do rules. Tailor `context/*.md`. If you'll use worktrees: `cp .worktreeinclude.example .worktreeinclude` and list your local env files. Commit.

### 5. Design (if there's a UI) — Claude Code → Claude Design → Claude Code
Behavioural spec → `DESIGN.md` → Claude Design iteration → design audit → handoff → migration plan → sample-data phase → contract wiring. Full flow: [04](04-design.md).

### 6. Build — Claude Code Desktop
For each unit: [precise unit prompt](../prompts/build/README.md#1-the-precise-unit-prompt) → review diff → `/verify-unit` → explain it back → `/ship-unit`. Run separable units in parallel worktree sessions; merge only when **both** pass against the contract. Details: [05](05-build.md).

### 7. Verify and audit
`/verify-app` before each merge to `main`. At the end of the first version: `/audit`, `contract-auditor`, `security-reviewer` (and visual/a11y subagents for UIs). Fix one finding at a time; log in `AUDIT_LOG.md`. Details: [06](06-verify.md).

### 8. Deploy and prove it
Env audit → `vercel --prod` → live acceptance checks for every `CONTRACT.md` §1 criterion → desktop + phone walkthrough → release commit. Details: [09](09-ship-and-operate.md).

### 9. Health check
```bash
~/agentic-engineering-playbook/scripts/doctor.sh ~/code/my-app
```

## Verified when…
- [ ] `git log --oneline` shows the bootstrap commit, the planning-docs commit, then one conventional commit per build unit, in order.
- [ ] Every Must-Have in the PRD maps to a contract section, a unit and a passing test.
- [ ] `/verify-app` → `APP VERIFIED`; `doctor.sh` → 0 FAIL.
- [ ] Every acceptance criterion passed against production, with evidence.
- [ ] `AUDIT_LOG.md` has a final entry with every finding resolved or accepted.

## Three Standards check
- **Scale:** Could a second developer (or agent) pick up unit *n+1* from the repo alone, today?
- **Secure:** Auth on every non-public endpoint; RLS on every table; secrets only in `.env` and the platform; no new dependency without a reason in the plan.
- **Understand:** Can you draw the request → service → data → response path for each endpoint from memory?

## Common mistakes
- Bootstrapping before the PRD exists — the repo fills with placeholders nobody revisits.
- Choosing the stack inside a build prompt instead of in the PRD/ADR.
- Skipping unit 1's error envelope and test harness — every later unit then invents its own.
- Starting design before the contract — the UI asks for fields that don't exist.
- "We'll write the audit log later."

## Course reference
Module 1 — the full document set and build order. Module 4 — Repository Creation & CLAUDE.md, Worktree Architecture, deploy and verification. Module 5 — UI from spec to production. Module 6 — static-first build, motion, ship checks.
