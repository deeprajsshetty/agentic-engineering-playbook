# Templates

Fill-in-the-blank planning documents. Each file opens with a **generation prompt** (between `GENERATION-PROMPT:START` / `END` markers): when to use it, the prompt to paste, and what good output looks like. The bootstrap scripts strip that block when they copy a template into a project.

> **Where prompts find templates.** Prompts say "the playbook's `templates/X.md`". From a project repo, start Claude with `claude --add-dir ~/agentic-engineering-playbook` so it can read them. Repos created with `bootstrap-new.sh` already contain each document's structure (PRD.md, CONTRACT.md, …) — there, "use the structure already in CONTRACT.md" works too.

**One job per document** — if two documents say the same thing, one of them is wrong.

| Template | Its one job | Lifecycle stage | Typical surface |
|---|---|---|---|
| [`PRD.md`](PRD.md) | What we're building, for whom, and how we'll know it worked | Specify | Claude.ai Project |
| [`CONTENT_MODEL.md`](CONTENT_MODEL.md) | What content exists, section by section (sites/UIs) | Specify | Claude.ai Project |
| [`CONTRACT.md`](CONTRACT.md) | Endpoints, shapes, typed errors, acceptance criteria — the sync point | Specify / Plan | Claude Code, Plan Mode |
| [`BUILD_SEQUENCE.md`](BUILD_SEQUENCE.md) | Ordered atomic units and what "verified" means for each | Plan | Claude Code |
| [`CLAUDE.md.template`](CLAUDE.md.template) | Short standing orders that point to everything else | Context-engineer | Claude Code |
| [`DESIGN_SPEC.md`](DESIGN_SPEC.md) | UI behaviour: views, states, errors, keyboard, mobile | Design | Claude Code / Project |
| [`DESIGN_STANDARD.md`](DESIGN_STANDARD.md) | The visual system as tokens (or adapt a `DESIGN.md`) | Design | Claude.ai / Claude Design |
| [`MOTION_BRIEF.md`](MOTION_BRIEF.md) | Motion outcomes per part, and what's excluded | Design | You, with Claude |
| [`AUDIT_LOG.md`](AUDIT_LOG.md) | Findings from each Director's Audit and how they were resolved | Audit | Claude Code |
| [`ADR.md`](ADR.md) | One expensive-to-reverse decision and why | Any | Claude Code / Project |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How a new person gets from clone to a verified commit | Ship / Operate | Claude Code |

Order of creation for a new project: **PRD → (Content model) → Contract → Build sequence → CLAUDE.md → (Design spec → Design standard/DESIGN.md → Motion brief) → build → Audit log.**
