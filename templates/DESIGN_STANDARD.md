<!-- GENERATION-PROMPT:START
Use when: you have a visual direction (a one-line "vibe sentence", a reference site, or a brand) and need a reproducible visual system.
For larger UIs, prefer the DESIGN.md format (https://github.com/google-labs-code/design.md): adapt an existing DESIGN.md whose structure fits, and save as DESIGN.md. This template is the lightweight version.

```text
The product's visual direction: [vibe sentence / reference / brand notes].
Write a design standard using the playbook's templates/DESIGN_STANDARD.md. Make every decision concrete
enough that two developers would produce the same result: named colour tokens with hex
values and usage rules, type families/weights/scale/line-height/tracking, a spacing base
unit and scale, surface/texture/depth rules, motion timing and easing, and an accessibility
floor (contrast, focus, reduced motion). Fonts must be licence-safe (e.g. Google Fonts).
```

Good output: every value is a token with a number; no adjectives without values; contrast pairs listed with ratios.
GENERATION-PROMPT:END -->
# Design standard — [Product name]

_Direction: "[vibe sentence]" · Consumers: Claude Design, Claude Code, humans._

## Colour tokens
| Token | Hex | Use | Never |
|---|---|---|---|
| `--bg` | `#[      ]` | Page background | Text |
| `--surface` | `#[      ]` | Cards, panels | — |
| `--text` | `#[      ]` | Body text | On `--accent` |
| `--text-muted` | `#[      ]` | Secondary text (≥ 4.5:1 on `--bg`) | Essential info |
| `--accent` | `#[      ]` | Primary action, focus ring, one highlight per view | Large fills |
| `--danger` | `#[      ]` | Errors, destructive actions | Decoration |

## Typography
| Role | Family | Weight | Size / line-height | Tracking |
|---|---|---|---|---|
| Display | [Family] | [700] | [48/1.05] | [-0.02em] |
| Heading | [Family] | [600] | [24/1.2] | [-0.01em] |
| Body | [Family] | [400] | [16/1.6] | [0] |
| Mono / meta | [Family] | [500] | [13/1.4] | [0.02em] |

Max two families. Source + licence: [Google Fonts, SIL OFL].

## Spacing and layout
- Base unit: `[4|8]px`. Scale: `[4, 8, 12, 16, 24, 32, 48, 64, 96]`.
- Container max width: `[1200px]`; gutters `[24px]` desktop / `[16px]` mobile.
- Breakpoints: `[390, 768, 1024, 1440]`.

## Surfaces, texture, depth
- Radius: `[8px]` cards, `[999px]` pills. Borders: `[1px solid rgba(…)]`.
- Elevation: [shadow tokens]. Texture: [grain/gradient/blur rules — or "none, flat"].

## Motion
- Durations: `[120ms]` micro, `[240ms]` UI, `[600ms]` section. Easing: `[cubic-bezier(.2,.8,.2,1)]`.
- Hover: [what changes — one property, no layout shift].
- `prefers-reduced-motion: reduce` → [no transforms; opacity only / static].

## Accessibility floor
- Contrast: body ≥ 4.5:1, large text and UI ≥ 3:1 — list each text/background pair with its ratio.
- Visible focus ring on every interactive element: `[2px solid var(--accent), 2px offset]`.
- Touch targets ≥ 44×44px.
