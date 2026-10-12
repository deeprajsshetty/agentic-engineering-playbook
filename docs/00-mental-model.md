# 00 — Mental model: direct the system that builds

## Goal
Adopt the director's posture — you own the specification, the sequence and the verdict; Claude does the typing — and know which Claude surface to use for each job.

## Which surface
None yet. Read this once, then keep the **surfaces map** below open while you work.

### Surfaces map

★ = recommended default for that job. Every surface shares the same engine: `CLAUDE.md`, settings, skills, hooks, plugins and MCP servers travel with the repository and work in each Claude Code surface.

| Job | Claude.ai (web Project) | Claude Design | Claude Code Desktop | Claude Code CLI | Mobile (Claude app) |
|---|---|---|---|---|---|
| Discovery, PRD, content model | ★ Project with docs as knowledge | — | OK | OK | Notes / voice |
| Contract, build sequence | OK | — | ★ Plan mode, visual review | ★ Plan mode | — |
| Visual design and iteration | Quick prototypes | ★ Canvas, tokens, inline comments | Preview pane for real app | — | — |
| Build atomic units | — | — | ★ Diff pane + preview | ★ Scripting, IDE (`/ide`) | — |
| Parallel work | — | — | ★ One session per worktree, side by side | `claude --worktree <name>` | Monitor |
| Review diffs | — | — | ★ Diff pane with inline comments | `git diff`, IDE | Skim only |
| Automate (scheduled / unattended) | — | — | Desktop scheduled tasks (local) | ★ `/goal`, `/loop`, `/schedule` → routines, `-p` | — |
| Steer from your phone | — | — | Start: `/remote-control` | Start: `claude --remote-control` | ★ Remote Control, Dispatch |
| CI / PR review | — | — | PR monitor (Auto-fix CI, Auto-merge) | ★ GitHub Action, headless `-p` | — |

Move between surfaces as the task changes. `/desktop` moves a CLI session into Desktop; `/remote-control` (alias `/rc`) makes a running session reachable from your phone.

## Inputs → Outputs
- **In:** an idea or a brief.
- **Out:** a shared vocabulary — the Three Standards, the document set, the atomic loop — that every later page uses.

## Steps

### 1. The shift in altitude
You stop writing each line and start directing the system that produces lines: documents that encode intent, an agent that reads them, and gates that prove the result. Creative direction becomes engineering once it is **encoded** — a vibe sentence can produce a good first result once; documents make it repeatable.

### 2. The Three Standards — ask them of every plan, diff and release

| Standard | Ask | Red flag |
|---|---|---|
| **Does it scale?** | Can the structure take another feature without a rewrite? Are repeated values centralised? Could another agent continue from the documents alone? | Copy-pasted logic, magic values, knowledge only in chat |
| **Is it secure?** | Did the change stay inside its declared scope? Are secrets absent from source and prompts? Any new dependency, script or data flow nobody approved? | New package in the diff you didn't ask for; a key in a test fixture |
| **Do I know exactly why it works?** | Can you explain the structure, trace each decision to a requirement, and point to where the next change goes? | "It passes, ship it" |

### 3. Documents are the source of truth — one job each

| Document | Its one job |
|---|---|
| `PRD.md` | What we're building, for whom, and what success means |
| `CONTENT_MODEL.md` | What content exists (sites/UIs) |
| `CONTRACT.md` | Structure, API shapes, typed errors, acceptance criteria — the sync point |
| `DESIGN_SPEC.md` | UI behaviour and states |
| `DESIGN.md` / `DESIGN_STANDARD.md` | The visual system as tokens |
| `MOTION_BRIEF.md` | Motion outcomes and exclusions |
| `BUILD_SEQUENCE.md` | Ordered atomic units and what "verified" means for each |
| `CLAUDE.md` | Short standing orders that **point to** the others — never duplicate them |

Templates: [`templates/`](../templates/).

### 4. The atomic loop
```text
Plan (Plan mode, 95% confidence) → build ONE unit → /verify-unit → explain it back → /ship-unit → next
```
An atomic unit is the smallest meaningful change that can be built completely, checked against the contract, tested with zero failures, shown not to regress, understood, and recorded as one commit.

### 5. Principles that run through every page
- **Plan before broad changes.** *"Ask me clarifying questions one at a time until you're 95% confident, then plan. Don't edit files until I approve."*
- **Verification is mechanical.** Typecheck, tests, diff scope, live requests. A deploy command is not proof.
- **Director's Audit.** Freeze the spec, judge the output against it (structural → consistency → visual), get an independent reviewer, log findings, fix one at a time.
- **Autonomy needs an escape hatch.** Commit first, dedicated branch, tight scope, measurable stop condition.
- **Lightest effective tool.** CLI for known operations → thin CLI wrapper → MCP only when discovery or structure earns its context cost.
- **Context is a resource.** `CLAUDE.md` under one page; supporting docs load on demand; skills and path-scoped rules activate only when relevant.

## Verified when…
- [ ] You can state the Three Standards from memory.
- [ ] You can name the job of each planning document in one line.
- [ ] You can say which surface you'd use for: writing a PRD, building a unit, running two branches in parallel, approving a change from your phone.

## Three Standards check
- **Scale:** Is your knowledge in documents another agent can read, or in your head and chat history?
- **Secure:** Do you know which surfaces can touch your files, your accounts and production?
- **Understand:** Could you explain to a teammate why the work is split into documents and atomic units?

## Common mistakes
- Treating Claude as a faster typist: long prompts that restate the spec every time instead of pointing to it.
- One giant `CLAUDE.md` holding the PRD, contract and design system.
- Accepting output because it runs, not because it matches the spec.
- Picking a surface by habit rather than by job (e.g. reviewing a 40-file diff on a phone).

## Course reference
Module 1 — Core concepts, The Three Standards, Web App Anatomy. Module 2 — Introduction to Claude Code (environments). Module 3 — Desktop app, Remote Control.
