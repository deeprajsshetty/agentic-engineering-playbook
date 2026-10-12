<!-- GENERATION-PROMPT:START
Use when: the PRD is approved and the product has pages, screens or content-heavy sections (sites, portfolios, dashboards).
For API-only products, the data model in CONTRACT.md plays this role — skip this file.

```text
Here is my PRD: [paste or attach PRD.md].
Map a content model: every page/screen and every section in order, and every content field
inside each section with a one-line description and its constraints (length, format, tone).
Only what the Must-Have features need. Finish with a "Gaps" list: anything in the PRD with no
home in the model, and anything in the model the PRD doesn't justify.
```

Good output: no section the PRD doesn't justify; every field has a constraint; Gaps list is non-empty or explicitly "none".
GENERATION-PROMPT:END -->
# Content model — [Product name]

_Derived from `PRD.md` · Last updated: [YYYY-MM-DD]_

## [Page / screen name]

### [Section name] — purpose: [one sentence]
| Field | Description | Constraints |
|---|---|---|
| `[headline]` | [What it carries] | [≤ 8 words; sentence case] |
| `[subheadline]` | [What it adds] | [One sentence; doesn't repeat headline] |
| `[primaryCta]` | [Label + target] | [Verb-first; links to #section] |

### [Next section] — purpose: [one sentence]
| Field | Description | Constraints |
|---|---|---|

## Gaps
- [PRD feature with no home in this model — or "none"]
- [Model element not justified by the PRD — or "none"]
