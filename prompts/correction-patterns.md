# Correction patterns

How to steer when output is wrong. Rule: **one correction per message, inspect after each.** Stacking five corrections in one prompt makes it impossible to tell which one broke something.

---

## 1. Targeted correction

```text
[Specific element] is [observable problem] rather than [specified result].
Update [specific token / property / behaviour] to match [source document §ref].
Don't change [the working parts nearby].
```

Example: *"The 404 response for an unknown task returns `{ message }` rather than the contract envelope. Update the not-found path in `src/routes/tasks.ts` to throw `AppError('TASK_NOT_FOUND', 404, …)` per CONTRACT.md §2. Don't change the success paths."*

---

## 2. Direction note (visual / motion work)

A useful note is **observable property + direction**.

| Not actionable | Actionable |
|---|---|
| "Make it nicer." | "The page fade-in takes about a second — cut it to a third of that." |
| "It feels off." | "The accent glow competes with the headline — drop its opacity by half." |
| "Busier, but calmer." | "Five cards animate at once — stagger them so one starts every ~80 ms." |

When a result is close enough, lock it in before iterating: *"Good — commit this as the baseline, then we'll adjust the next property."*

---

## 3. Contract wins

```text
The code and CONTRACT.md disagree on [field / code / status]. The contract is the source
of truth. Change the code to match §[x], update the affected tests, and list anything else
that depended on the old behaviour.
```

If the contract is what's wrong: change `CONTRACT.md` first (with a change-log line), then the code — as two separate commits.

---

## 4. Scope creep stop

```text
Stop. The diff touches [files] which are outside this unit's scope ([scope]). Revert those
files to HEAD and continue with only the in-scope change. If the in-scope change genuinely
needs them, explain why and wait.
```

---

## 5. Agent is guessing

```text
You've stated [claim] without reading the code that proves it. Read [file(s)] and either
cite file:line for the claim or withdraw it.
```

---

## 6. Recovering a bad session

| Symptom | Move |
|---|---|
| Last turn or two went wrong | `/rewind` (Esc Esc) to a checkpoint and re-prompt with the missing constraint |
| Context is bloated, answers drifting | `/compact keep: the current unit, the contract sections in play, open decisions` |
| The whole approach is wrong | `git stash` or `git restore .` back to the last verified commit, `/clear`, and re-plan with the constraint the first plan missed |
| Long session, need to stop | `/handoff`, commit or stash, start fresh tomorrow from `HANDOFF.md` |

After `/compact` or `/clear`, check orientation: *"Based on CLAUDE.md and what we've done, what is the current unit and what is the next step?"*

---

## 7. Side question without polluting the thread

Use `/btw [question]` for a quick question that shouldn't become part of the main conversation's context.
