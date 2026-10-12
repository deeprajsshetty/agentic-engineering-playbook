<!-- GENERATION-PROMPT:START
Use when: you finish a Director's Audit. Run /audit first; this file records the outcome.

```text
Append an entry to AUDIT_LOG.md using the playbook's templates/AUDIT_LOG.md for the audit we just ran.
Record my own findings and the reviewer subagent findings separately, mark which ones we
both found, and for each finding record the resolution and the commit that fixed it, or
"accepted — reason" if we chose not to fix it. Keep it factual; no praise.
```

Good output: every finding has a resolution or an explicit acceptance; every fix has a commit sha; the status line is honest.
GENERATION-PROMPT:END -->
# Audit log — [Product name]

Newest entry first. Fix order is always **Structural → Consistency → Visual**, one finding per change.

---

## [YYYY-MM-DD] — [scope: feature / release / whole repo]
**Spec (frozen):** [CONTRACT.md @ sha, DESIGN_SPEC.md @ sha, …]
**Auditors:** Director + [code-reviewer, contract-auditor, …]

### Structural
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| S1 | [Missing test for `TASK_NOT_FOUND` on PATCH] | Both | Added test | `abc1234` |

### Consistency
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| — | Clean | | | |

### Visual
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| — | N/A — no UI | | | |

### Reviewer-only findings
[What the independent reviewer caught that the director didn't — and whether it was valid.]

### Accepted / deferred
- [Finding] — accepted because [reason]; revisit [when].

### Status
[Verified — meets CONTRACT.md and DESIGN_SPEC.md. / One more pass needed: … / Blocked: …]
