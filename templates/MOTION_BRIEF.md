<!-- GENERATION-PROMPT:START
Use when: the still design and real content work, and you're about to add motion. You write most of this yourself — it's direction, not specification.

```text
Here are my references: [links + one line each on what to take from them] and my content
parts in page order: [hero, about, …]. Help me draft MOTION_BRIEF.md using
the playbook's templates/MOTION_BRIEF.md. For each part propose at most one or two treatments and say why
each helps the visitor; propose transitions between parts or "deliberately nothing".
Describe outcomes the visitor sees and feels — never implementation values, library calls
or shader parameters. Fill the Excluded section with tempting effects we should not use,
each with a reason.
```

Good output: every treatment has a "why"; at least as many exclusions as treatments; nothing reads like code.
GENERATION-PROMPT:END -->
# Motion brief — [Product name]

_Revises forward during the build; **frozen** at audit time. Outcomes only — no implementation values._

## Look
- **Feel:** [two or three sentences every part of the page shares]
- **Palette:** [bg `#…`, fg `#…`, one accent `#…`]
- **Type:** [display face + body face, licence-safe]
- **Space:** [dense or airy · wide margins or edge-to-edge · sharp or soft]

## Motion direction
[One or two sentences — e.g. "slow and weighted; things settle rather than snap".]

## [Part: Hero]
- Treatment: [what the visitor sees]
- Why: [how it helps them]

  → Transition into [next part]: [treatment or "deliberately nothing"] — Why: [reason]

## [Part: …]
- Treatment: [or "still, by decision"]
- Why: [reason]

## Reduced motion (`prefers-reduced-motion: reduce`)
[What every treatment becomes — pinned sections collapse, reveals become static, loops stop, canvases hold a still frame.]

## Excluded
- [Effect considered and cut] — [why]

## Amendments
| Date | Change | Reason |
|---|---|---|
