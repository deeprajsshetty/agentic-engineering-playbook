---
name: audit
description: Director's Audit — judge the current build against its frozen specification documents and report findings only, categorised Structural / Consistency / Visual. Use at the end of a feature or before release.
argument-hint: "[spec docs to audit against, e.g. CONTRACT.md docs/DESIGN_SPEC.md]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git diff *)
  - Bash(git log *)
  - Bash(npm test *)
  - Bash(npx tsc *)
---

# /audit — findings only, no fixes

**Specification:** $ARGUMENTS (default: `CLAUDE.md`, `CONTRACT.md`, and — where present — `docs/DESIGN_SPEC.md`, `docs/DESIGN.md` (or `docs/DESIGN_STANDARD.md`), `docs/MOTION_BRIEF.md`)

The spec is **frozen** for the duration of the audit. Judge the build against what the documents say, not against what seems reasonable.

## Rules

- Make **no** edits. Record findings; fixing happens afterwards, one finding at a time, in fix order.
- Find problems; do not reassure. If a dimension is clean, say "Clean" in one line and move on.
- Every finding cites a spec location **and** a code location.

## Steps

1. Read every spec document named above. List any that are missing.
2. **Structural** — every contracted endpoint/section/state exists, in the stated order, with the stated fields, error codes and behaviour.
3. **Consistency** — conventions in `CLAUDE.md` are followed; repeated values are centralised; no unapproved dependencies, inline styles, stray console output or dead code; naming matches the contract exactly.
4. **Visual** (only if there is a UI) — tokens, typography, spacing, states and motion match `docs/DESIGN.md` (or `docs/DESIGN_STANDARD.md`) and `docs/MOTION_BRIEF.md`. Mark anything that needs eyes on a running app as `MANUAL CHECK`.
5. Ask the `code-reviewer` subagent (and `contract-auditor` if `CONTRACT.md` exists) for an independent pass. Merge their findings, marking each as *agreed* (you both found it) or *reviewer-only*.

## Report — use exactly this format

```markdown
# Audit — <date> — against <spec docs>

## Structural
| # | Spec ref | Code ref | Finding | Suggested resolution | Source |
|---|----------|----------|---------|----------------------|--------|

## Consistency
(same table, or "Clean")

## Visual
(same table, or "Clean" / "N/A — no UI")

## Fix order
1. Structural …  2. Consistency …  3. Visual …

Verdict: SHIP | ONE MORE PASS | BLOCKED
```

Offer to append the report to `AUDIT_LOG.md` — only write it if the director says yes.
