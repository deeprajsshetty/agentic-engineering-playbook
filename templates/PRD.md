<!-- GENERATION-PROMPT:START
Use when: discovery is done and you can describe the product in a paragraph. Best run in a Claude.ai Project.

```text
I'm building [one-paragraph product description]. Primary users: [who, in what situation].
Hard constraints: [e.g. API-only / static site / must run on Vercel + Supabase / no PII stored].

Write a PRD using the structure in the attached PRD template. Rules:
- Ask me clarifying questions one at a time until you're 95% confident, then write it.
- Personas are concrete people in situations, not demographics.
- Must-Have only contains what the constraints allow; anything else goes to Should/Nice.
- Every success criterion is measurable and checkable by a person or a test.
- Keep it concise — every sentence must be necessary.
```

Good output: fits on ~2 pages; Must-Have list is honest about scope; each success criterion has a number or a yes/no check.
GENERATION-PROMPT:END -->
# PRD — [Product name]

_Status: Draft | Approved · Owner: [name] · Last updated: [YYYY-MM-DD]_

## 1. Vision
[Two or three sentences: the problem, who has it, and what changes for them when this exists.]

## 2. Users
| Persona | Situation | Need | Today they… |
|---|---|---|---|
| [Name, role] | [When/where they hit the problem] | [What they need] | [Current workaround] |

## 3. Features
**Must-Have** (ship blocks without these)
- [ ] [Feature — one line, user-visible outcome]

**Should-Have** (next, if time allows)
- [ ] [Feature]

**Nice-to-Have** (explicitly not now)
- [ ] [Feature]

## 4. Technical constraints
- [Stack, hosting, data residency, auth model, budgets, integrations]
- [Explicit non-goals: what this product will not do]

## 5. Design summary
[Two to four sentences of visual/interaction direction. Detail lives in `DESIGN.md` / `DESIGN_STANDARD.md` — do not duplicate it here.]

## 6. Success criteria
| # | Criterion | How it's checked |
|---|---|---|
| S1 | [e.g. p95 API latency < 300 ms] | [Load test script / Vercel analytics] |
| S2 | [e.g. A new user creates a task in < 30 s] | [Timed walkthrough] |

## 7. Open questions
- [Question] — owner: [who] — needed by: [date]
