# Verify prompts

Verification is **mechanical**: commands, tests, measured values. "It looks fine" and "the deploy succeeded" are not verification.

---

## 1. Unit gate

**Purpose:** Decide whether a unit can be committed.
**When:** After every unit.

```text
/verify-unit [scope globs]
```

**Good output:** `UNIT VERIFIED` with every line PASS. Anything else: read the failing line, fix deliberately in a separate prompt, re-run.

---

## 2. Explain it back

**Purpose:** Third standard — do you know exactly why it works?
**When:** After `UNIT VERIFIED`, before committing.

```text
In five bullets: what changed, which layer each change lives in, which contract section
each behaviour satisfies, what the riskiest line is and why, and where the next unit
will plug in. Cite file:line.
```

**Good output:** You could have written the bullets yourself. If not, read the code until you could.

---

## 3. Visual-consistency pass (subagent)

**Purpose:** Measured, structured visual check of a running UI.
**When:** After UI units and before release. Needs the Desktop Browser pane or another browser tool.

```text
Use the visual-auditor subagent. Walk these views in order: [list with how to reach each].
Check at desktop width, then at 390px: [the 8–15 checks that matter for this product —
token consistency, real font rendering, state visibility, touch targets, overflow].
Return each item as PASS, FAIL with description, or CANNOT VERIFY with reason.
```

**Good output:** A table; every FAIL names the element and the expected value.

---

## 4. Accessibility pass (subagent)

**Purpose:** Measured accessibility check of a running UI.
**When:** After UI units and before release. Needs the Desktop Browser pane or another browser tool.

```text
Use the a11y-auditor subagent on [views]. Include: keyboard reachability and order, focus
trap and Escape on [overlays], visible focus on [icon buttons], contrast of [low-contrast
text] with measured ratios, 44px touch targets at 390px, and input visibility with the
viewport height at 60% (simulated mobile keyboard).
```

**Good output:** Measured ratios and named elements — not "looks accessible".

---

## 5. Production smoke test

**Purpose:** Prove the live system works — credentials, config and integrations included.
**When:** After every production deploy.

```text
Against [production URL], exercise each acceptance criterion in CONTRACT.md §1 with real
requests: [list the flows — auth, list + pagination, create, update, every named error].
For each, report the request, status, and whether the body matches the contract exactly.
Don't change any code; report only.
```

**Good output:** One row per criterion with evidence. Any failure blocks the release commit.

---

## 6. Credential scan before release

**Purpose:** Second line of defence behind the secret-guard hook.
**When:** Before every release and before making a repo public.

```text
Search src/, api/, app/ and tests/ for anything that looks like a literal credential
(keys, tokens, passwords, connection strings). Environment variable *names* are expected;
literal values are not. List every match with file:line and your verdict.
```

**Good output:** Every match reviewed; zero literal secrets.
