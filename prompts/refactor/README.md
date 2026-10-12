# Refactor prompts

**Autonomy needs an escape hatch:** commit first, work on a dedicated branch, scope tightly, and define a measurable stop condition. If a refactor goes wrong, return to the clean branch — don't fix forward through an untrusted state.

---

## 1. Teach the agent the current mess first

**Purpose:** Stop the agent reinforcing patterns you're about to remove.
**When:** Before any refactor of a brownfield repo (usually during `/onboard-repo`).

```text
Add to CLAUDE.md: this codebase has known structural problems that a refactor will fix —
[list]. Understand the current state but don't reinforce it. Add a "Never do" section:
[e.g. never add routes to routes.js — new routes go in src/routes/<resource>.ts; never
import from misc/ — it's dead code scheduled for removal].
```

**Good output:** `CLAUDE.md` names each problem and the rule that replaces it, in one line each.

---

## 2. Architecture refactor in Plan Mode

**Purpose:** Restructure safely with the test suite as the safety net.
**When:** On a fresh branch (`git switch -c refactor/<name>`) from a committed baseline.

```text
Ask me clarifying questions until you're 95% confident about the full scope, then plan.
Target: [folder layout], [naming convention], [layering rule, e.g. routes → services →
queries], [dead code to delete], [test file naming]. The plan must list exact renames and
moves, the order of operations, and the test command run after each step. Behaviour must
not change: the existing test suite is the safety net. Don't edit anything yet.
```

**Good output:** Small, ordered steps each followed by a test run; no step changes behaviour.

After executing: update `CLAUDE.md` to describe the new structure and remove references to the old one.

---

## 3. Bounded autonomous run

**Purpose:** Mechanical, low-risk work without per-step prompts.
**When:** Plan approved; committed baseline; dedicated branch.

Prefer **auto mode** (a classifier reviews each action) over skipping permissions entirely. Use `--dangerously-skip-permissions` only inside a container or VM with no credentials you care about.

```text
[Task, e.g. Add JSDoc to every exported function in src/utils/.] Each comment describes
what the function does, its parameters and return value. Touch only files in src/utils/.
Don't change any implementation. When finished, run [typecheck + tests] and show the output.
```

**Good output:** `git diff --stat` shows only the allowed directory; tests unchanged and green.

---

## 4. `/goal` — keep going until a condition is true

**Purpose:** Multi-turn work with an evaluator that decides when it's done.
**When:** The end state is verifiable from Claude's own output. Run in auto mode so turns don't stop for prompts.

```text
/goal every exported function in src/ has JSDoc with @param for each parameter and
@returns; prove it by running [a grep or script] and showing output that covers every
export; no implementation lines change (git diff shows comment lines only); or stop after
15 turns.
```

**Good output:** The evaluator's final reason cites the proving command's output; the diff is comments only.

A strong condition has: one measurable end state · the command that proves it · scope constraints · a turn or time bound. Check status with `/goal`; stop with `/goal clear`. Review the diff and run `/verify-app` before committing.

---

## 5. Extract without changing behaviour

**Purpose:** Split a large module while keeping callers untouched.
**When:** A file has grown past one responsibility and is covered by tests.

```text
Extract [logic] from [file] into [new module]. Behaviour must be identical: no signature
changes for callers, no new dependencies. Run the full suite before and after and show both
summaries. If any test needs changing, stop and tell me why instead.
```

**Good output:** Identical before/after test summaries; no test files in the diff.
