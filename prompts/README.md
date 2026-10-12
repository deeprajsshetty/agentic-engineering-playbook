# Prompt library

Copy-paste prompts grouped by lifecycle phase. Every prompt entry has the same four parts (two reference tables — [design #4](design/README.md#4-three-iteration-channels--pick-the-right-one) and the [correction patterns](correction-patterns.md) — are patterns to adapt rather than single prompts):

- **Purpose** — what the prompt is for
- **When** — the moment in the workflow to use it
- **Prompt** — a fenced block; replace `[bracketed]` text with your own project's details
- **Good output** — what to check before you accept the result

| Phase | File | Highlights |
|---|---|---|
| Plan | [`plan/README.md`](plan/README.md) | 95%-confidence opener, PRD → Contract → Build Sequence, plan review |
| Build | [`build/README.md`](build/README.md) | Precise unit prompt, decisions-before-building, parallel sessions, library check with Context7 |
| Design | [`design/README.md`](design/README.md) | Behavioural spec, DESIGN.md adaptation, Claude Design first prompt, handoff migration |
| Verify | [`verify/README.md`](verify/README.md) | Unit gate, visual and a11y subagent passes, production smoke test |
| Audit | [`audit/README.md`](audit/README.md) | Multimodal visual audit, independent reviewer, motion reconciliation |
| Refactor | [`refactor/README.md`](refactor/README.md) | Architecture refactor in Plan Mode, bounded autonomous runs, `/goal` conditions |
| Deploy | [`deploy/README.md`](deploy/README.md) | Env audit, CLI-first deploy, live acceptance checks, routines |
| Any | [`correction-patterns.md`](correction-patterns.md) | One-fix-at-a-time corrections, direction notes, recovering a bad session |

> **Where prompts find templates.** Prompts say "the playbook's `templates/X.md`". From a project repo, start Claude with `claude --add-dir ~/agentic-engineering-playbook` so it can read them. Repos created with `bootstrap-new.sh` already contain each document's structure (PRD.md, CONTRACT.md, …) — there, "use the structure already in CONTRACT.md" works too.

**The prompt is the method delta.** These prompts assume the planning documents exist — a prompt that says "read CONTRACT.md" produces nothing useful if there is no `CONTRACT.md`. Write the documents first ([`templates/`](../templates/)), then let prompts carry only what's new.
