---
name: plan-feature
description: Turn a feature request into an approved, contract-aligned plan of atomic units. Asks clarifying questions one at a time until 95% confident, then plans. Makes no edits.
argument-hint: "[feature description]"
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git log *)
  - Bash(git status *)
---

# /plan-feature — questions first, plan second, no edits

**Feature:** $ARGUMENTS

## Rules

- Make **no** file edits, no commits, no installs. This skill produces a plan in chat only.
- Ask clarifying questions **one at a time**. After each answer, state your confidence (%) and what is still unclear. Stop asking at ≥ 95%.
- Every claim about the codebase must come from a file you read. Cite paths.

## Steps

1. Read `CLAUDE.md`, then whichever of these exist: `PRD.md`, `CONTRACT.md`, `BUILD_SEQUENCE.md`, `docs/DESIGN_SPEC.md`. Note which are missing.
2. Map the code the feature touches (entry points, routes, services, data access, tests).
3. Ask questions until 95% confident. Cover at minimum: success criteria, request/response shapes, error cases and codes, data changes, UI states (if any), what must **not** change.
4. Produce the plan below.

## Plan format

```markdown
## Feature: <name>
Confidence: <n>%  ·  Sources read: <paths>

### Contract changes
<new/changed endpoints, fields, error codes — exact names; or "none">

### Atomic units (in order)
| # | Unit | Files (expected scope) | Verified when… |
|---|------|------------------------|----------------|

### Risks and unknowns
- ...

### Three Standards
- Scale: ...
- Secure: ...
- Understood: <what the director must be able to explain before merging>

### Not doing
- ...
```

End with: **"Approve this plan, or tell me what to change. I will not edit files until you approve."**
