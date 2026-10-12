# Design prompts

Order: **behaviour (DESIGN_SPEC.md) → visual system (DESIGN.md) → Claude Design → audit → handoff → Claude Code.**

---

## 1. Behavioural spec from the contract

**Purpose:** Define every UI state using the contract's exact names, before any pixels.
**When:** Contract approved, before opening Claude Design. Full prompt in [`templates/DESIGN_SPEC.md`](../../templates/DESIGN_SPEC.md).

```text
Attached: CONTRACT.md. Write docs/DESIGN_SPEC.md for these views: [view — endpoint §ref, …].
For each: default, actions, loading, error states, empty state, modes, mobile and keyboard.
Use exact field names, error codes and paths from the contract — never invent one. Flag
server-managed fields the client must never send. Output only the spec.
```

**Good output:** Every name greps to `CONTRACT.md`; no colours or fonts.

---

## 2. Adapt a DESIGN.md

**Purpose:** Start the visual system from a structurally similar, proven design system instead of a blank page.
**When:** After the behavioural spec. Pick a reference DESIGN.md for *structural* fit (density, hierarchy, dark/light), not looks.

```text
Read docs/design-system/[reference].DESIGN.md. Produce docs/design-system/[PRODUCT]_DESIGN.md:
1. Replace [surface treatment / palette / typeface] with: [your exact values or ranges].
2. Keep every other token and section from the original unchanged.
3. Add an attribution line at the top naming the source and what changed, and the
   licence of any font you introduce.
```

**Good output:** A diff against the reference shows only the changes you asked for; attribution and font licence present.

---

## 3. Claude Design — first real generation

**Purpose:** Generate the first production view on top of the configured design system.
**When:** The design system is set up in Claude Design with `DESIGN_SPEC.md` and the DESIGN.md uploaded as context. ⚠️ Verify: course-described, not confirmed in current docs — Claude Design's setup form and panel names.

```text
Build the [view] as a React component structure. Use the configured design system for
every token value. Layout: [structure]. Show [n] rows/items of realistic data. Include
[key elements]. Refer to DESIGN_SPEC.md for every state and behaviour this view needs.
```

**Good output:** Tokens come from the system (not one-off values); every state in the spec has a visible representation or is listed as missing.

---

## 4. Three iteration channels — pick the right one

| Change | Channel | Example |
|---|---|---|
| Structure or behaviour | Chat | "Thread view replaces the inbox list when a row is clicked; newest message expanded, older collapsed." |
| A token value | Tweaks/token panel | Blur, radius, opacity, spacing |
| One element | Inline comment | "Outlined star disappears on hover — make it visible at 60% opacity." |

---

## 5. Cross-view consistency pass

**Purpose:** Catch drift before export.
**When:** All views exist in the design tool.

```text
Do a consistency pass across all views. Equivalent elements must share identical corner
radius, surface opacity, border, accent colour and type size. Shared components (e.g. the
row used in list and search results) must be identical. List every inconsistency you find,
then fix them.
```

**Good output:** A list first (so you can audit it), then fixes.

---

## 6. Migration plan for a design handoff

**Purpose:** Turn exported prototype components into production architecture deliberately.
**When:** Handoff exported to `design-handoff/`. Run in Plan Mode.

```text
Migrate the handoff in design-handoff/ into [app dir] using [framework + version], TypeScript.
Don't touch [backend dirs]. Constraints: keep the token CSS variable names; keep sample
data for phase 1; [shared components, e.g. one Row component for list and search];
[mode-driven components]; [implementation flags from the design audit]. Use CONTRACT.md and
DESIGN_SPEC.md as the source of truth. Show me the proposed file structure before writing files.
```

**Good output:** A file tree with shared components identified, sample data preserved, and backend directories untouched.
