# Build prompts

One unit at a time. Every build prompt names four things: **which documents to read · the exact deliverable · the boundary (what not to touch) · what verified looks like.**

---

## 1. The precise unit prompt

**Purpose:** Build exactly one unit from `BUILD_SEQUENCE.md`.
**When:** Every unit.

```text
Read CLAUDE.md, CONTRACT.md §[x] and BUILD_SEQUENCE.md unit [n].
Build unit [n] only: [one-line description].
Scope: [files/globs]. Do not modify anything outside that scope, and do not change
previously verified units.
Verified when: [the unit's "verified when" sentence]. When you think it's done, run
/verify-unit [scope] and show me the report. Don't commit.
```

**Good output:** Diff touches only the named scope; `UNIT VERIFIED`; you can explain the change in two sentences.

---

## 2. Check current library docs first (Context7)

**Purpose:** Stop the agent coding against an API from its training data.
**When:** Before a unit that uses an SDK or framework feature you haven't used in this repo yet.

```text
Before we build, use Context7 to fetch the current documentation for [library] —
specifically [APIs you'll use]. Tell me anything that differs from what CONTRACT.md or
our plan assumes. Don't write code yet.
```

**Good output:** Version-specific notes and at least an explicit "no differences found" — not a generic summary.

Setup: `claude mcp add --transport http context7 https://mcp.context7.com/mcp` (or the stdio form `claude mcp add context7 -- npx -y @upstash/context7-mcp`). ⚠️ Verify: course-described, not confirmed in current docs — endpoint and package name come from Context7's own docs, not Anthropic's.

---

## 3. Continue from the current state (UI work)

**Purpose:** Keep visual continuity across sessions.
**When:** Starting a new conversation on a UI that already has accepted sections.

```text
Here is the current state: [screenshot or preview]. Read CLAUDE.md, DESIGN_SPEC.md and
DESIGN.md. Build [section/view] only, using the exact fields and states in the spec.
Match the established treatment in the screenshot without overriding DESIGN.md. Do not
modify completed sections. Done when: [section-specific checks].
```

**Good output:** New section feels continuous; no previously accepted section changed.

---

## 4. Parallel sessions — orientation check

**Purpose:** Confirm each parallel session knows its lane before it writes code.
**When:** First message in each worktree session (`claude --worktree <name>` or a Desktop worktree session).

```text
What project is this, what is THIS session responsible for, which files may you touch,
and what is the sequencing rule between sessions? Answer from CLAUDE.md and
BUILD_SEQUENCE.md only.
```

**Good output:** Each session names its own scope and the shared contract as the sync point. If either is wrong, fix `CLAUDE.md` before building.

---

## 5. Sample data before live data

**Purpose:** Prove structure and visuals before adding auth and network uncertainty.
**When:** Migrating a design handoff or building a new UI on top of an API.

```text
Build [views] against the sample data in [file] first. Don't call the real API yet.
Stop when all [n] views render correctly in the preview and wait for my review. In the
next unit we'll replace sample data with contract calls.
```

**Good output:** All views render with realistic data; no fetch calls in the diff yet.

---

## 6. Wire the contract (replace sample data)

**Purpose:** Connect the UI to real endpoints without drifting from the contract.
**When:** After the sample-data phase is verified.

```text
Read CONTRACT.md and DESIGN_SPEC.md. Replace [sample data source] with real calls to the
contract endpoints, using relative paths and the auth scheme in CONTRACT.md §2. Fix any
mismatch between the current types and the contract — the contract wins. Implement every
error state the spec names. Delete the sample data once nothing references it.
```

**Good output:** Types generated from or matching the contract; every spec error state reachable; sample data file deleted.
