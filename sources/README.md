# Sources and attribution

## The course

This playbook is built on the **Claude Code Bootcamp** by **Jacinto Design** — its method (the director's workflow, the Three Standards, the planning-document set, atomic shipping, verification loops and the Director's Audit) is the spine of every page here.

- Course reference repository: [JacintoDesign/claude-code-bootcamp-reference](https://github.com/JacintoDesign/claude-code-bootcamp-reference) — `README.md` and `Module_1_reference.md` … `Module_6_reference.md`.
- Course field guide (Notion): [Claude Code & Design Handbook](https://sweet-tellurium-e16.notion.site/Claude-Code-Design-Handbook-3b8b2273e75280bc9137c4d8da2a4ad3) — summarised in [design-handbook.md](design-handbook.md).

**What this repo does with it.** The course material is reorganised by lifecycle stage, condensed, and extended with a reusable kit, scripts, a worked example and an FDE engagement layer. Prompts are paraphrased or rewritten for reuse; no module file is reproduced. Course content remains the property of its author. If you're taking the course, use the original reference files alongside the videos.

**What was changed on purpose.** Every command and setting was checked against the current [Claude Code docs](https://code.claude.com/docs/en/overview) (October 2026). Where the docs have moved on since the course, this repo follows the docs:

| Course says | This playbook uses | Why |
|---|---|---|
| `/re` | `/rewind` (or Esc Esc on an empty prompt) | Current command name |
| `npm install -g @anthropic-ai/claude-code`, Node 18+ | Native installer first; npm needs Node 22+ | Current install guidance |
| Plan Mode = `Shift+Tab` twice | `Shift+Tab` until `⏸ plan mode on`, or `--permission-mode plan` | Sessions now start in auto mode, so the cycle changed |
| `--dangerously-skip-permissions` to run `/goal` unattended | Auto mode; bypass only inside a container/VM | Docs recommend auto mode for `/goal` |
| `.claude/commands/*.md` | `.claude/skills/<name>/SKILL.md` with `disable-model-invocation: true` | Commands were merged into skills; still compatible |
| `/loop "… every 30 seconds"` | `/loop 1m …` | Minimum granularity is one minute |
| Allow `git add`/`commit`/`push` in project settings | `ask` for git writes; allow tests/typecheck/read-only git | Least privilege for a shared kit |

Still flagged `⚠️ Verify` in the docs because they couldn't be confirmed in Anthropic's docs: Claude Design's setup form and panel names, Ogham MCP (third-party), and Context7's MCP package/endpoint (published by Context7).

## Patterns credited to the course

Some short, reusable patterns are kept close to the course's wording because they work as named techniques. They are the course author's:

- The **Three Standards** questions and the **Director's Audit** dimensions (Structural → Consistency → Visual) — Module 1.
- The **95%-confidence clarifying-questions opener** for Plan Mode — Modules 2 and 4.
- The **targeted-correction template** ("[element] is [problem] rather than [specified result] …") — Module 1.
- The **reviewer stance** "find problems, not to validate or reassure" used in the kit's subagents — Module 1.
- **Direction notes** as "observable property + direction" — Module 6.
- **Atomic unit** definition and the **escape-hatch** rules for autonomous runs — Modules 2 and 3.

## Module → playbook map

| Course module | Topics | Where it lives here |
|---|---|---|
| **1 — Claude: project workflow** | Three Standards, web app anatomy, PRD, content model, site contract, design standard, CLAUDE.md, Claude Project, atomic build, Director's Audit | [00](../docs/00-mental-model.md), [02](../docs/02-discover-and-plan.md), [03](../docs/03-context-engineering.md), [04](../docs/04-design.md), [06](../docs/06-verify.md); templates [PRD](../templates/PRD.md), [CONTENT_MODEL](../templates/CONTENT_MODEL.md), [CONTRACT](../templates/CONTRACT.md), [DESIGN_STANDARD](../templates/DESIGN_STANDARD.md), [AUDIT_LOG](../templates/AUDIT_LOG.md) |
| **2 — Claude Code in the terminal** | Environments, setup, slash commands, Plan Mode, memory stack, Context7, refactor, permissions/YOLO, verification loops, routines, `/goal`, plugins, CLI vs MCP | [01](../docs/01-setup.md), [03](../docs/03-context-engineering.md), [05](../docs/05-build.md), [07](../docs/07-automate.md), [08](../docs/08-extend.md), [10](../docs/10-brownfield-adoption.md); [kit](../kit/), [plugin](../plugin/my-standards/), [refactor prompts](../prompts/refactor/README.md) |
| **3 — Desktop app** | Code tab, diffs, preview, parallel sessions, Remote Control, atomic shipping, Logic Surgeon | [00](../docs/00-mental-model.md) (surfaces map), [05](../docs/05-build.md), [09](../docs/09-ship-and-operate.md) |
| **4 — VibeMail backend** | CONTRACT.md + BUILD_SEQUENCE.md, worktrees, `/verify-unit`, server/schema sequencing, deploy, production verification | [02](../docs/02-discover-and-plan.md), [05](../docs/05-build.md), [06](../docs/06-verify.md), [09](../docs/09-ship-and-operate.md), [11](../docs/11-greenfield-kickoff.md); [`/verify-unit`](../kit/.claude/skills/verify-unit/SKILL.md); worked example [taskr-api](../examples/taskr-api/) |
| **5 — Claude Design + Code (VibeMail UI)** | Behavioural spec, DESIGN.md, Claude Design system and iteration, design audit, migration, visual and a11y subagents, API integration | [04](../docs/04-design.md); templates [DESIGN_SPEC](../templates/DESIGN_SPEC.md); [design prompts](../prompts/design/README.md); agents [visual-auditor](../kit/.claude/agents/visual-auditor.md), [a11y-auditor](../kit/.claude/agents/a11y-auditor.md) |
| **6 — Cinematic portfolio** | Motion brief, static shell, shaders, GSAP/ScrollTrigger, reconciliation, audit, contact form, ship checks | [04](../docs/04-design.md) §8; template [MOTION_BRIEF](../templates/MOTION_BRIEF.md); [audit prompts](../prompts/audit/README.md) (reconciliation) |

Beyond the course (verified against current docs): GitHub Actions, headless mode, the Agent SDK and custom MCP servers ([07](../docs/07-automate.md), [12](../docs/12-fde-playbook.md)), the FDE engagement runbook ([12](../docs/12-fde-playbook.md)), and troubleshooting ([13](../docs/13-troubleshooting.md)).
