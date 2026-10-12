---
name: handoff
description: Write a session handoff note (HANDOFF.md) — current state, decisions and why, the next unit, open questions, and exactly how to resume — so a fresh session or another person can continue without this conversation.
disable-model-invocation: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Write
  - Bash(git log *)
  - Bash(git status *)
  - Bash(git diff *)
  - Bash(git branch *)
---

# /handoff — leave the work resumable

## Rules

- Write only `HANDOFF.md` at the repo root (overwrite the previous one; git keeps history).
- Facts only, each traceable to a commit, file or the conversation. No aspirations.
- Keep it under 60 lines. Link to documents rather than restating them.

## Steps

1. `git branch --show-current`, `git status --short`, `git log --oneline -15`.
2. Identify the current unit and its status from `BUILD_SEQUENCE.md` (if present).
3. Collect decisions made this session and the reason for each.
4. Write `HANDOFF.md` in the format below.
5. Tell the director whether uncommitted changes exist — a handoff with uncommitted work should say so in bold at the top.

## HANDOFF.md format

```markdown
# Handoff — <YYYY-MM-DD HH:MM> — branch `<branch>`

**Uncommitted changes:** none | <list>

## State
- Last verified unit: <n — name — commit sha>
- In progress: <unit, what's done, what's left>

## Decisions (and why)
- <decision> — because <reason> (ref: <file/commit>)

## Next unit
<n — name — expected scope — verified when …>

## Open questions
- <question> — blocks: <what>

## Resume with
1. Read CLAUDE.md, this file, and <docs>.
2. Run `/verify-unit` to confirm the baseline.
3. Start: "<exact first prompt>"
```
