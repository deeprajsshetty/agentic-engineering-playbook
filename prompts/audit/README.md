# Audit prompts — the Director's Audit

**Freeze the spec → judge the output against it (Structural → Consistency → Visual) → get an independent reviewer → log findings → fix one at a time.** Record all findings before fixing any.

---

## 1. Run the audit

**Purpose:** Judge the build against its frozen spec, findings only.
**When:** End of a feature, before a release.

```text
/audit CONTRACT.md docs/DESIGN_SPEC.md DESIGN.md
```

**Good output:** Three tables with spec ref + code ref per finding, and a verdict.

---

## 2. Independent reviewer (fresh context)

**Purpose:** A second opinion with no stake in the code.
**When:** Alongside your own audit. Use the subagent, or a fresh conversation with the files attached.

```text
Use the code-reviewer subagent. Review [scope / diff from main] against CLAUDE.md,
CONTRACT.md and [design docs]. Your role is to find problems, not to reassure. For each
issue: category (Structural / Consistency / Visual), file:line, the problem, and a specific
resolution. If a dimension is clean, say so in one line and move on.
```

**Good output:** Findings you didn't have. Agreement between you and the reviewer = high confidence; disagreement = investigate before deciding.

---

## 3. Multimodal visual audit (screenshot)

**Purpose:** Precise visual comparison against the design standard.
**When:** UI work; use a fresh conversation outside the project so it judges only what it sees.

```text
I'm auditing this UI (screenshot attached) against this design standard: [paste DESIGN.md
or DESIGN_STANDARD.md]. Evaluate colour, typography, spacing/layout, surface/texture, and
interaction quality. Hover, focus and motion can't be judged from a still image — list them
as manual checks. For every deviation name the element, the value you observe, the token or
rule it should follow, and the effect on the intended feel — e.g. "card titles render at
roughly 14px; the standard's heading-3 is 18px, so the hierarchy collapses into body text."
```

**Good output:** Specific deviations with the token that should apply.

---

## 4. Motion reconciliation (before freezing a motion brief)

**Purpose:** Make code and motion brief agree before judging either.
**When:** End of motion work, before the audit; the brief is frozen afterwards.

```text
Build a motion inventory before we freeze the brief. Scan components, global styles and
animation setup code; produce a table with one row per moving thing: file:line, trigger
(load / scroll / hover / pointer / timer), what moves, and its reduced-motion behaviour.
Then add two columns: "named in MOTION_BRIEF.md?" and "gated for prefers-reduced-motion?".
Report the table only — no edits.
```

**Good output:** A complete inventory. For each undocumented item, decide: add to brief, add a reduced-motion gate, remove, or record as an accepted finding. Then freeze the brief.

---

## 5. Mechanical release audit

**Purpose:** Catch things that should never reach production.
**When:** Immediately before the release deploy.

```text
Audit for release and report as a list — findings only, don't fix:
- anything that can reach production but shouldn't (dev panels, debug flags, console output)
- any copy not from the content source, or that reads as placeholder
- any internal or external link that 404s
- any animation without a reduced-motion gate
- any TODO/FIXME in shipped code
```

**Good output:** A short list with file:line per item, or an explicit "none" per bullet.

---

## 6. Log it

**Purpose:** Make the audit durable and traceable.
**When:** After every finding is resolved or explicitly accepted.

```text
Append this audit to AUDIT_LOG.md using the playbook's templates/AUDIT_LOG.md: my findings and the
reviewer's separately, which we both found, and for each the resolution and fixing commit
or "accepted — reason".
```

**Good output:** Every finding has a commit sha or an acceptance reason; status line is honest.
