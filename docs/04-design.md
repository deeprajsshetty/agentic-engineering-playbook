# 04 — Design: behaviour first, then appearance

## Goal
Produce an approved, auditable UI design — behaviour spec, visual system, design iterations and a handoff — that Claude Code can migrate into production code without inventing anything.

## Which surface
- **Behavioural spec and `DESIGN.md` → Claude Code** (they reference `CONTRACT.md` field names exactly).
- **Visual exploration and iteration → Claude Design** — fast visual decisions on a canvas: chat for structure, a token panel for values, inline comments for one element.
- **Migration, integration, accessibility, deploy → Claude Code** (the Desktop **Browser** pane, `Cmd/Ctrl+Shift+B`, is ideal for previewing).

Skip this page entirely for API-only work.

## Inputs → Outputs
- **In:** `CONTRACT.md`, `PRD.md` (design summary), a visual direction or reference.
- **Out:** `docs/DESIGN_SPEC.md`, `DESIGN.md` (or `DESIGN_STANDARD.md`), optional `MOTION_BRIEF.md`, a design audit verdict file, the exported handoff in `design-handoff/`, and a migrated, verified UI.

## Steps

### 1. Behavioural spec — what the interface *does*
Use [`templates/DESIGN_SPEC.md`](../templates/DESIGN_SPEC.md). For each view: default, actions, loading, errors, empty, modes, mobile, keyboard. Every field, error code and path must be copied exactly from the contract. Design preventable errors away (don't call search with an empty query).
```bash
git add docs/DESIGN_SPEC.md && git commit -m "docs: behavioural spec"
```

### 2. Visual system — what it *looks like*
Prefer adapting a structurally similar `DESIGN.md` (dense vs airy, dark vs light, card hierarchy) over a blank page — see [prompt: adapt a DESIGN.md](../prompts/design/README.md#2-adapt-a-designmd). For small sites, [`templates/DESIGN_STANDARD.md`](../templates/DESIGN_STANDARD.md) is enough. Check: attribution line, font licence, exact token values, unaffected sections preserved.

> The spec is the compass (what it does); `DESIGN.md` is the map (exact values).

### 3. Set up Claude Design
⚠️ Verify: course-described, not confirmed in current docs — Claude Design's setup form and panel names; check the [Claude Design help centre](https://support.claude.com).
- Create a project for the product. Configure its **design system** natively (blurb, uploaded `DESIGN_SPEC.md` + `DESIGN.md`, font files, notes) — native tokens constrain every generation; an uploaded reference only informs it.
- Ask for **React** component structures so you get component-aware output and token controls.
- Throw away a first experimental project to learn the controls before starting the real one.

### 4. Generate and iterate
First prompt: [design prompt 3](../prompts/design/README.md#3-claude-design--first-real-generation). Then iterate with the right channel:

| Change | Channel |
|---|---|
| Structure / behaviour | Chat |
| Token value (blur, radius, opacity, spacing) | Token/tweaks panel |
| One element | Inline comment |

One note at a time; look after each. Build every view the spec names, then a cross-view consistency pass, then mobile (390px). Record implementation flags you discover (e.g. "reduced motion caps blur at 8px", "safe-area padding on the fixed button") — they go into the migration prompt.

### 5. Design audit — before export
Walk every state in `DESIGN_SPEC.md` on the canvas. Write `docs/AUDIT_DESIGN.md`:
```markdown
Approved: [what passed unchanged]
One more pass: [what needs fixing before export, and the fix]
Cut: [descoped from the spec and why — or "nothing"]
```
Only spec-compliance findings block export; log polish separately.

### 6. Handoff → migration plan (Claude Code, Plan mode)
Export the handoff into `design-handoff/`. Read every component, the token CSS and sample data yourself first. Then run [design prompt 6](../prompts/design/README.md#6-migration-plan-for-a-design-handoff). Don't approve until the plan has: shared components identified, mode-driven components, sample data kept for phase 1, backend directories untouched, the implementation flags applied.

### 7. Migrate in two phases
- **Phase 1 — sample data.** Components → TypeScript in the app structure; every view renders in the Desktop Browser pane against sample data. Verify visually with the `visual-auditor` and `a11y-auditor` subagents ([06](06-verify.md)).
- **Phase 2 — contract wiring.** Replace sample data with real calls ([build prompt 6](../prompts/build/README.md#6-wire-the-contract-replace-sample-data)). The contract wins every disagreement.

OAuth flows usually can't complete inside an embedded preview: authenticate in a real browser, then copy the token into the preview's storage for authenticated testing.

### 8. Motion (if the product earns it)
Write [`MOTION_BRIEF.md`](../templates/MOTION_BRIEF.md) *after* the still design works. Build static first (put `Current phase: STATIC BUILD — no motion of any kind` in `CLAUDE.md`), then switch phase and add treatments one at a time. Every treatment has a reduced-motion state. Reconcile code against the brief, then freeze it for the audit.

## Verified when…
- [ ] Every name in `DESIGN_SPEC.md` greps to `CONTRACT.md`.
- [ ] `DESIGN.md` tokens are values, not adjectives; contrast pairs listed.
- [ ] Design audit file exists with no open "one more pass" items.
- [ ] Phase 1: all views render against sample data; visual and a11y subagent reports have no FAIL.
- [ ] Phase 2: sample data deleted; every spec error state reachable with real API responses.

## Three Standards check
- **Scale:** Is there one shared component for each repeated UI element (e.g. one row for list and search)? Are tokens CSS variables, not literals?
- **Secure:** Do HTML bodies render sandboxed? Are tokens stored and cleared deliberately (sign-out, 401)? No secrets in client bundles?
- **Understand:** Can you trace each visual value to a token, and each state to a spec line?

## Common mistakes
- Designing pixels before behaviour — then discovering missing states in code.
- Accepting paraphrased field names from the design tool (`sender` vs the contract's `from`).
- Treating the handoff as final architecture — it's a component source and spec, not your routing, types or data layer.
- Wiring live APIs before the sample-data phase is verified — two kinds of uncertainty at once.
- Motion without a reduced-motion state, or motion that smuggles back an "Excluded" effect.

## Course reference
Module 1 — Design Standard Document. Module 5 — Claude Design end to end (behavioural spec, DESIGN.md, design system setup, iteration, audit, migration, subagent review, API integration). Module 6 — Motion brief, static shell, motion phase, reconciliation.
