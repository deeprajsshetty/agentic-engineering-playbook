# 02 — Discover, specify, plan

## Goal
Turn an idea or client brief into four approved documents — PRD, (content model), CONTRACT, BUILD_SEQUENCE — before a single line of code exists.

## Which surface
- **Discovery + PRD + content model → Claude.ai Project.** Upload drafts as project knowledge so every conversation shares them; good for long-form thinking and non-technical stakeholders.
- **Contract + build sequence → Claude Code in Plan mode** (CLI or Desktop). It can read the actual repo, and the output lands as files you commit.

## Inputs → Outputs
- **In:** idea / brief, constraints, (for brownfield) the existing repo.
- **Out:** `PRD.md`, `CONTENT_MODEL.md` (UI/content products only), `CONTRACT.md`, `BUILD_SEQUENCE.md` — committed.

## Steps

### 1. Discovery interview (Claude.ai Project)
Create a Project named after the product. Run [prompt: discovery interview](../prompts/plan/README.md#2-discovery-interview-before-the-prd). Save the summary.

### 2. PRD
Paste the generation prompt from [`templates/PRD.md`](../templates/PRD.md) with your summary. Review against the checklist:
- Vision matches what you actually want.
- Personas are people in situations, not demographics.
- Must-Have respects the constraints (e.g. "API-only" means no UI features there).
- Every success criterion has a number or a yes/no check.

Upload the approved `PRD.md` to the Project knowledge. Open it once there to confirm it isn't truncated.

### 3. Content model (sites and content-heavy UIs only)
Use [`templates/CONTENT_MODEL.md`](../templates/CONTENT_MODEL.md). Check: every Must-Have feature has a home; every field has a constraint; nothing appears that the PRD doesn't justify. For API-only products, skip — the contract's data model does this job.

### 4. Contract (Claude Code, Plan mode)
Move to the repo. Put `PRD.md` in it, then start in Plan mode:
```bash
claude --permission-mode plan
```
(or press `Shift+Tab` until the status bar shows `⏸ plan mode on`). Run the generation prompt from [`templates/CONTRACT.md`](../templates/CONTRACT.md). Answer the questions one at a time. Review:
- Could two developers implement each endpoint identically?
- Every error is `{ error: { code, message, details? } }` with an `UPPER_SNAKE` code that appears in the catalogue.
- Every acceptance criterion maps to a test or a named manual check.
- If parallel sessions will build against it, the sequencing rule is written down.

### 5. Build sequence
Run the generation prompt from [`templates/BUILD_SEQUENCE.md`](../templates/BUILD_SEQUENCE.md). You decide the units; Claude formats and challenges them. Each unit: expected file scope + one mechanical "verified when". Mark parallel-safe units and their contract sync point.

### 6. Freeze and commit
```bash
git add PRD.md CONTRACT.md BUILD_SEQUENCE.md
git commit -m "docs: PRD, contract and build sequence"
```
From now on, changes to the contract are deliberate: edit `CONTRACT.md` with a change-log line, commit, *then* change code.

### When to use something else
- Small change in an existing repo: skip the PRD; run `/plan-feature [description]` — it asks questions until 95% confident and outputs units against the existing contract.
- No UI and no external consumers: the contract can be a short section per endpoint; don't skip the error catalogue.

## Verified when…
- [ ] Four (or three, for API-only) documents are committed.
- [ ] Every Must-Have feature in the PRD maps to at least one contract section and one build unit.
- [ ] Every contract error code is used by at least one endpoint and appears in the catalogue.
- [ ] Every build unit has a "verified when" that is a command, test name or request.
- [ ] Asked cold — *"What is this project, and what is unit 1?"* — Claude answers correctly from the files.

## Three Standards check
- **Scale:** Could a second agent (or a parallel session) build unit 3 from the documents alone?
- **Secure:** Does the contract specify auth on every endpoint, and does the data model mark sensitive fields and where they're stored?
- **Understand:** Can you explain the data flow from request to storage and back without opening the code?

## Common mistakes
- Letting the agent invent fields or error codes "to be helpful" — reject anything you didn't agree to.
- Success criteria like "fast" or "intuitive" — not checkable.
- Units that are really features ("build auth") — split until each is one concern and one commit.
- Writing the contract after the code — then it documents accidents instead of preventing them.

## Course reference
Module 1 — PRD, Content Model, Site Contract, Claude Project. Module 4 — VibeMail Architecture and Planning (CONTRACT.md and BUILD_SEQUENCE.md prompts).
