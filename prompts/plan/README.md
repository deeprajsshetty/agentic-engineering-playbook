# Plan prompts

Use in **Plan Mode** (press `Shift+Tab` until the mode indicator shows plan mode) or with `/plan-feature`. Nothing in this phase edits files.

---

## 1. The 95%-confidence opener

**Purpose:** Surface assumptions while changes are still free.
**When:** Start of any broad, ambiguous or multi-file task.

```text
Ask me clarifying questions one at a time until you're 95% confident you understand
the task. After each answer, tell me your confidence and what's still unclear. Then
produce a plan for review. Don't edit any files until I approve the plan.

Task: [what you want]
```

**Good output:** Questions you hadn't thought of; confidence that rises with each answer; a plan naming exact files, order of operations and how each step is verified.

---

## 2. Discovery interview (before the PRD)

**Purpose:** Turn a vague idea or a client brief into PRD-ready facts.
**When:** Day one of a project, in a Claude.ai Project.

```text
Act as a product engineer running a discovery interview for [idea / client]. Ask one
question at a time, covering: the business goal and how it's measured, the users and
their current workaround, the systems and data involved, data sensitivity and
compliance, constraints (stack, budget, deadlines), and what is explicitly out of scope.
When you have enough, summarise the answers as a bullet list I can paste into the PRD prompt.
```

**Good output:** A summary with measurable goals, named systems, and an explicit out-of-scope list.

---

## 3. Contract in Plan Mode

**Purpose:** Produce the sync point every later session builds against.
**When:** PRD approved; before any code. Full prompt lives in [`templates/CONTRACT.md`](../../templates/CONTRACT.md).

```text
Read PRD.md. Draft CONTRACT.md using the playbook's templates/CONTRACT.md. Ask clarifying questions one
at a time until 95% confident first. Cover acceptance criteria, the data model with field
sources, every endpoint with request, response and typed errors in the envelope
{ error: { code, message, details? } }, pagination, and any parallel-build sequencing rule.
```

**Good output:** An error catalogue where every code is used by at least one endpoint; acceptance criteria that each map to a test or a manual check.

---

## 4. Build sequence

**Purpose:** Break the contract into atomic, verifiable units.
**When:** Immediately after the contract is approved.

```text
Read CONTRACT.md. Propose BUILD_SEQUENCE.md: the smallest units that can each be built,
tested and committed alone, dependencies pointing backwards only. For each: expected file
scope and one sentence saying exactly what I'd check to call it verified. Flag any unit
that's too big and split it. Mark units safe to build in parallel and their sync point.
```

**Good output:** Every "verified when" is a command, a test name or a request — never "works correctly".

---

## 5. Plan review — make the agent argue against itself

**Purpose:** Stress-test a plan before approving it.
**When:** You have a plan and something feels too easy.

```text
Before I approve: review your own plan as a sceptical senior engineer. List the three
most likely ways it fails, any step that touches files outside the stated scope, any
assumption you haven't verified by reading code, and what the rollback is if step [n]
goes wrong. Then revise the plan.
```

**Good output:** Concrete failure modes tied to files; a revised plan, not a defence of the old one.

---

## 6. Decisions before building

**Purpose:** See the design decisions and their sources before any code exists.
**When:** Before a unit that touches UI, data shape or architecture.

```text
Before you build anything, list the decisions you're about to make for [unit] and the
document and section each one comes from. Mark any decision with no source as an
assumption and ask me about it.
```

**Good output:** Every decision cites `CONTRACT.md §…`, `DESIGN.md`, or `CLAUDE.md`; assumptions are few and explicit.
