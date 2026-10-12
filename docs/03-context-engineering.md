# 03 — Context engineering

## Goal
Give Claude exactly the context each task needs — standing orders always, supporting knowledge on demand — and nothing that wastes the context window.

## Which surface
**Claude Code (CLI or Desktop).** Everything here is files in the repo (or `~/.claude/`) that every Claude Code surface loads.

## Inputs → Outputs
- **In:** planning documents from [02](02-discover-and-plan.md); the repo.
- **Out:** `CLAUDE.md` (< 1 page), `context/*.md`, `.claude/skills/`, `.claude/rules/`, optional `CLAUDE.local.md`; a verified understanding of what's loaded and when.

## Steps

### 1. Know the memory layers

| Layer | Where | Loaded | Put here |
|---|---|---|---|
| Session context | The conversation | Always (until `/clear`/`/compact`) | The current task, recent output |
| Project standing orders | `CLAUDE.md` (and parent dirs) | Every session, at launch | Identity, stack, commands, never-do, verification policy, pointers |
| Personal project notes | `CLAUDE.local.md` (gitignored) | Every session | Your sandbox URLs, preferences |
| Path-scoped rules | `.claude/rules/*.md` with `paths:` | Only when Claude touches matching files | Rules for one area (migrations, UI) |
| Skills | `.claude/skills/<name>/SKILL.md` | Description always; body when relevant or invoked | Procedures ("how to add an endpoint") |
| Supporting docs | `context/*.md`, `CONTRACT.md`, … | When Claude reads them | Detail, conventions, specs |
| User memory | `~/.claude/CLAUDE.md`, auto memory (`/memory`) | Every session | Your cross-project preferences, learnings |
| External knowledge | Context7 MCP | On request | Current library docs |

Subdirectory `CLAUDE.md` files load when Claude works in that subdirectory. `@path/to/file` inside `CLAUDE.md` imports a file — but imported files load at launch too, so imports organise without saving context.

### 2. Generate, then cut
```text
/init
```
Then refine with the [`CLAUDE.md.template`](../templates/CLAUDE.md.template) generation prompt. Rules:
- Target **under one page** (the docs recommend < 200 lines per file; aim far lower).
- **Point, don't repeat.** If it's in `CONTRACT.md`, `CLAUDE.md` says "see `CONTRACT.md`".
- Include a **Commands** section — the kit's `/verify-unit` and `/verify-app` read it.
- Brownfield: include **Known structural problems** and **Never do**, so Claude understands the current mess without reinforcing it.

### 3. Context files — conventions that load on demand
Copy `kit/context/api-conventions.md` and `kit/context/testing-standards.md` and tailor them (or let `/onboard-repo` draft them). Add a pointer table to `CLAUDE.md`:
```markdown
## Context files
| File | Read when |
|---|---|
| `context/api-conventions.md` | Any task touching routes, handlers or endpoints |
| `context/testing-standards.md` | Any task adding or changing tests |
```

### 4. Skills vs rules vs CLAUDE.md — choose the right container

| Kind of knowledge | Container | Why |
|---|---|---|
| Applies everywhere, every session | `CLAUDE.md` | Always loaded — keep it tiny |
| A procedure with steps ("add an endpoint", "ship a unit") | Skill | Loads only when relevant; can bundle files and pre-approve tools |
| A constraint for one part of the tree | `.claude/rules/x.md` with `paths:` | Loads only when matching files are touched |
| Personal, cross-project habits | Plugin skill (`my-standards`) or `~/.claude/CLAUDE.md` | Follows you to every repo |
| Something that must **never** happen regardless of what Claude decides | Hook or permission deny rule | Memory is advice; hooks and rules are enforced |

### 5. Inspect and manage the window
```text
/context          # what's occupying the window, with suggestions
/compact keep: current unit, contract sections in play, open decisions
/clear            # start fresh (pass a name to label the old conversation)
/memory           # edit CLAUDE.md files, toggle auto memory
```
After `/compact` or `/clear`, test orientation: *"From CLAUDE.md and what we've done, what is the current unit and what's next?"*

### 6. Audit your instructions periodically
```text
/doctor prompt-audit
```
Finds contradictions and bloat across `CLAUDE.md`, rules, skills and subagents.

### 7. Commit
```bash
git add CLAUDE.md context/ .claude/
git commit -m "docs: CLAUDE.md, context files and skills"
```

## Verified when…
- [ ] `wc -l CLAUDE.md` is well under 200 (target < 80).
- [ ] No paragraph in `CLAUDE.md` duplicates another document.
- [ ] Cold-start check: a fresh session answers *"What is this project, what are the constraints, and which file do you read before adding an endpoint?"* correctly.
- [ ] `/context` shows no surprise large items (unused MCP servers, huge imports).
- [ ] `CLAUDE.local.md` and `.claude/settings.local.json` are gitignored.

## Three Standards check
- **Scale:** Could a new teammate's first session follow the conventions without being told?
- **Secure:** Are prohibitions that matter enforced by hooks/deny rules, not just written in `CLAUDE.md`?
- **Understand:** For any instruction Claude followed, can you say which file it came from?

## Common mistakes
- `CLAUDE.md` as a dumping ground — adherence drops as length grows.
- Contradictory instructions across `CLAUDE.md`, nested files and rules — Claude may pick either.
- Expecting `CLAUDE.md` to *block* actions. It can't; use a hook or a deny rule.
- Forgetting to update `CLAUDE.md` after a refactor — it then actively misleads.

## Course reference
Module 1 — Programming Agents (CLAUDE.md generation). Module 2 — Plan Mode and Memory Architecture; Memory in Practice; Plugins (skills vs rules).
