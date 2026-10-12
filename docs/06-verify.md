# 06 — Verify and audit

## Goal
Prove each unit and each release mechanically, then judge the whole against its frozen specification with an independent reviewer — and record what you found.

## Which surface
**Claude Code (Desktop or CLI)** for commands, hooks and subagents. **Desktop Browser pane** (or another browser tool) for visual and accessibility passes. A **fresh conversation** for screenshot-based visual audits.

## Inputs → Outputs
- **In:** a finished unit / feature; `CONTRACT.md`, `CLAUDE.md`, design docs.
- **Out:** `UNIT VERIFIED` reports per commit; `APP VERIFIED` before merge; audit tables; an `AUDIT_LOG.md` entry with every finding resolved or explicitly accepted.

## Steps

### 1. Three layers of verification — and what belongs in each

| Layer | Runs | Speed | Kit file |
|---|---|---|---|
| **Hooks** | Automatically on events | Milliseconds | `secret-guard.mjs` (PreToolUse), `activity-log.sh` (Stop) |
| **Unit gate** | You, after each unit | Seconds–minutes | `/verify-unit` — typecheck, tests, diff scope, secrets; report only |
| **App gate** | You, before merge | Minutes | `/verify-app` — typecheck, lint, full suite, build; may fix implementation, never tests |

Never put a test suite in a hook — it runs on every turn and slows everything.

### 2. Make the policy a standing order
Add to `CLAUDE.md` (the template already has it):
```markdown
## Verification policy
- After every unit: /verify-unit [scope] must report UNIT VERIFIED, then /ship-unit.
- Before merging: /verify-app. Never commit with failing or skipped tests.
```
Route mechanical test-writing to a smaller model (the `test-writer` subagent uses `sonnet`); keep architectural judgement on the strongest model.

### 3. Check what the hooks do
```bash
cat .claude/hook.log       # one line per turn: files modified
scripts/test-hooks.sh      # (in this playbook) proves the secret guard blocks and allows correctly
```
`/hooks` shows the hooks active in a session.

### 4. Subagent reviews

| Subagent | Use it for | Needs |
|---|---|---|
| `contract-auditor` | Every endpoint, field, status and error code vs `CONTRACT.md`, plus a test per code | Read-only |
| `code-reviewer` | Diff vs `CLAUDE.md`, contract and general quality | Read/Grep/Glob + Bash (told to stay read-only; not enforced) |
| `security-reviewer` | Auth, input, secrets, data exposure, dependencies | Read/Grep/Glob + Bash (told to stay read-only; not enforced) |
| `visual-auditor` | Running UI vs `DESIGN_SPEC.md`/`DESIGN.md`, desktop + 390px | Preview/browser tools |
| `a11y-auditor` | Keyboard, focus, contrast, targets, reduced motion | Preview/browser tools |

Prompts: [verify prompts](../prompts/verify/README.md). Every reviewer is told to **find problems, not reassure** and returns a PASS/FAIL table.

### 5. The Director's Audit
1. **Freeze the spec.** No document edits during the audit.
2. **Record before fixing.** Run `/audit CONTRACT.md [design docs]`. Do your own pass in parallel.
3. **Judge in three dimensions:**
   - *Structural* — everything contracted exists, in order, with its fields, codes and behaviour.
   - *Consistency* — `CLAUDE.md` rules followed; values centralised; no unapproved deps, inline styles, console output, dead code.
   - *Visual* — tokens, typography, spacing, states, motion vs the design docs (screenshot audit in a fresh conversation: [audit prompt 3](../prompts/audit/README.md#3-multimodal-visual-audit-screenshot)).
4. **Independent reviewer.** The `code-reviewer` subagent (fresh context, no stake). Agreement = high confidence; disagreement = investigate and decide with a reason.
5. **Fix one finding at a time**, in order Structural → Consistency → Visual; inspect after each; confirm nothing accepted regressed.
6. **Log it** in `AUDIT_LOG.md` ([template](../templates/AUDIT_LOG.md)).

### 6. Built-in reviews worth knowing
- `/security-review` — reviews the current branch's diff for vulnerabilities.
- `/code-review` — reviews the diff; in Desktop it offers **Walk through in diff** and **Apply fixes**.
They complement, not replace, the contract and design audits — they don't know your spec.

## Verified when…
- [ ] Every commit in the feature has a matching `UNIT VERIFIED`.
- [ ] `/verify-app` reports `APP VERIFIED` on the merge candidate with 0 skipped tests.
- [ ] `contract-auditor` reports PASS (every code has a test).
- [ ] For UI: visual and a11y reports have no FAIL (CANNOT VERIFY items checked manually).
- [ ] `AUDIT_LOG.md` has an entry where every finding has a commit or an acceptance reason.

## Three Standards check
- **Scale:** Would the gates catch a regression introduced by someone else next month? (Are the tests contract-driven?)
- **Secure:** Did `security-reviewer` run on anything touching auth, input or data access? Did the credential scan come back clean?
- **Understand:** For each audit finding you accepted rather than fixed, can you justify it in one sentence?

## Common mistakes
- Letting the verifier fix things — then nobody knows what the gate actually saw. `/verify-unit` is report-only on purpose.
- "Tests pass" with skipped tests, or with a test weakened to pass.
- Auditing against what *seems* right instead of the written spec.
- Fixing findings while still auditing — you lose the full picture and mix concerns in commits.
- Treating a green deploy as verification (see [09](09-ship-and-operate.md)).

## Course reference
Module 1 — The Director's Audit; Finishing the Director's Audit. Module 2 — Verification Loops (verify-app, Stop hook). Module 4 — `/verify-unit`, Running Final Tests. Module 5 — Visual Inspection and Accessibility subagents; design audit. Module 6 — Reconciliation, mechanical and human audit.
