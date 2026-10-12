<!-- GENERATION-PROMPT:START
Use when: CONTRACT.md exists and before any visual design. Behaviour comes before appearance.

```text
Attached: CONTRACT.md. Write a behavioural spec (docs/DESIGN_SPEC.md) for these views:
[View — primary endpoint(s) (§ref)], [View — …].
For each view cover: default state, user actions, loading, error states, empty state,
plus any named modes or activation conditions, and mobile + keyboard behaviour.
Omit areas that cannot apply. Name every field with the exact field names from the
contract's data model, every error with the exact error.code, every endpoint with its
exact path. Never invent a field, code or endpoint. Design away preventable errors
(e.g. don't call search until there's a query) and say so. Flag server-managed fields
the client must never send. Output only the spec.
```

Good output: every name greps to CONTRACT.md; every error state says how it is shown (inline field, banner, redirect, silent); nothing about colours or fonts.
GENERATION-PROMPT:END -->
# Behavioural spec — [Product name]

_Source of truth for UI states. Visual values live in `DESIGN.md`; API shapes in `CONTRACT.md`._

## View: [Name] — `[METHOD /api/v1/path]` (CONTRACT §[x])

**Default** — [what renders; which fields from the data model, by exact name]

**Actions**
| Action | Trigger (pointer / keyboard) | Calls | Result |
|---|---|---|---|
| [Open item] | [Click row / Enter] | [`GET /api/v1/…`] | [Navigates to …] |

**Loading** — [skeleton / spinner / optimistic update; what stays interactive]

**Errors**
| `error.code` | Shown as | Recovery |
|---|---|---|
| `[UNAUTHORIZED]` | [Redirect to sign-in with message] | [Sign in again] |
| `[VALIDATION_ERROR]` | [Inline under each field in `details.fields`] | [Edit and resubmit] |

**Empty** — [copy + any call to action; or "N/A — view always has data"]

**Modes / activation** — [e.g. compose: default · reply · draft-restored; search activates at ≥ 1 character]

**Mobile (390px)** — [layout changes, max heights with keyboard open, safe-area handling]

**Keyboard** — [focus order, shortcuts, Escape behaviour, focus trap for overlays]

**Never** — [e.g. "`status` is derived server-side; the client never sends it"]

---

## View: [Next view]
…

## Preventable errors designed away
- [e.g. Search never calls the API with an empty query, so `MISSING_QUERY` is never user-visible.]
