# Audit log — Taskr API

Newest entry first. Fix order: **Structural → Consistency → Visual**, one finding (or one tightly related group) per commit.

---

## 2026-10-12 — v1 (units 1–6) — Director's Audit
**Spec (frozen):** `CONTRACT.md` @ `4c5b44d`, `CLAUDE.md`, `context/*.md`
**Auditors:** Director (edge-case probe) · `contract-auditor` subagent · `code-reviewer` subagent — each in a fresh context, read-only
**Gate before audit:** typecheck ✓ · 51 tests ✓ · build ✓ (`APP VERIFIED`)
**Initial verdicts:** contract-auditor **FAIL** · code-reviewer **FAIL** (1 High) · Director: 4 defects found by probe

### Structural
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| S1 | Cursors were unsigned base64url JSON: clients could forge positions (`seq` 0 or 999999), append junk (silently dropped by `Buffer.from`), add keys, or replay cursors from another process — contradicting §4.3 "not produced by this API" **(High)** | All three | HMAC-SHA256-signed cursors with per-app secret (`cursorSecret` option to share across instances), `timingSafeEqual`, strict base64url round-trip, exact key set; codec unit tests | `6212fe8` |
| S2 | Body over 100 kB, unsupported charset or `Content-Encoding` → **500 INTERNAL_ERROR**, logged as server faults | All three | Contract amended first (`PAYLOAD_TOO_LARGE` 413, `UNSUPPORTED_MEDIA_TYPE` 415), then mapped in the error handler without logging | `1223b64`, `e4e64b7` |
| S3 | `OPTIONS` answered 200 `text/plain` (Express auto-OPTIONS); `HEAD` behaviour unspecified | contract-auditor, Director | `OPTIONS` → 404 `NOT_FOUND`; `HEAD` kept (standard HTTP) and written into §2 | `1223b64`, `03f3ab2` |
| S4 | Global `express.json()` returned `INVALID_JSON` on routes with no body and on unknown routes (should be `NOT_FOUND`) | contract-auditor, Director | JSON parser mounted only on POST and PATCH | `e4e64b7` |
| S5 | Malformed percent-encoding in `:id` → `URIError` → logged 500 | code-reviewer | `URIError` → 404 `NOT_FOUND` (§4.7 amended to say so) | `03f3ab2` |
| S6 | Empty / repeated `cursor` param semantics not in contract (empty gave `VALIDATION_ERROR`) | Both reviewers | Contract: empty → `INVALID_CURSOR`, repeated → `VALIDATION_ERROR`; code aligned | `1223b64`, `6212fe8` |
| S7 | Untested contract rules: trim-before-length boundary, `dueDate: null` on create, invalid date / non-object body / trimming on PATCH, `INVALID_CURSOR` envelope, 500 only tested outside `createApp` | Both reviewers | Tests added for each | `0bf0561`, `6212fe8` |

### Consistency
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| C1 | `body` used as a pseudo-field key in `details.fields`, not documented | contract-auditor | Documented in §2 (kept — clients need a key for whole-body problems) | `1223b64` |
| C2 | `toFields` wrote into `{}`; an unknown `__proto__` key was silently dropped, leaving `fields: {}` | code-reviewer | Built from a `Map`; regression tests fail on the old code (checked) | `57f38a7` |
| C3 | Module-level `let counter` in list tests (CLAUDE.md never-do; order-dependent ids) | code-reviewer | Per-test seeder created in `beforeEach` | `0bf0561` |
| C4 | `health` and `contract` tests built apps inline rather than in `beforeEach` (testing-standards) | code-reviewer | All files build a fresh app per test | `0bf0561` |
| C5 | Coverage guard was a substring search — a code in a comment counted as "tested" | code-reviewer | Guard requires `code: "X"` or `toBe("X")`; mutation-checked with a comment-only mention | `0bf0561` |

### Correctness (Low)
| # | Finding | Found by | Resolution | Commit |
|---|---|---|---|---|
| L1 | Strict JSON parser rejected valid primitives (`null`, `42`) as "not valid JSON"; arrays got `VALIDATION_ERROR` — same mistake, two codes | code-reviewer | `strict: false`; all non-object bodies → `VALIDATION_ERROR` "Body must be a JSON object" | `e4e64b7` |
| L2 | `insert` overwrote duplicate ids with a new `seq`, breaking list ordering | code-reviewer | Precondition documented on `TaskStore.insert`; in-memory store throws | `7d24155` |
| L3 | Error handler didn't check `res.headersSent` | code-reviewer | Defers to Express when headers are sent | `03f3ab2` |
| L4 | Title max length counted UTF-16 units (200 emoji rejected) vs "characters" in §3 | contract-auditor | Code points; §3 wording made explicit | `1223b64`, `57f38a7` |

### Reviewer-only findings
Round 1 has **16** findings (S1–S7, C1–C5, L1–L4); round 2 has **12** (R1–R11 plus the untested-boundaries row). S5, C2–C5 and L1–L3 were caught only by the `code-reviewer`; C1 and L4 only by the `contract-auditor`; S6 and S7 by both reviewers; S3 by the `contract-auditor` and the Director. The Director's probe independently found S1, S2, S3 and S4 — agreement on those four made them the highest-confidence findings. Two independent reviewers with different briefs found largely different defects: worth the cost.

### Accepted / not changed
- **AC5 "not verified" (contract-auditor):** the auditor was read-only and didn't run commands; verified separately by the gate above and after every fix.
- **Contract-first commit turned the suite red** (`1223b64`): adding codes to §5 made the coverage guard fail until `e4e64b7` landed. Intentional — that's the guard proving it works — but it breaks "never commit with failing tests". Lesson recorded in `WALKTHROUGH.md`: on a shared branch, land a contract amendment and its first implementing fix in one PR.
- **`npm audit` not run** by reviewers (network). Deferred to CI/Dependabot when the repo is public.

### Re-audit after fixes (round 2)
A fresh `contract-auditor` pass on the fixed code confirmed every round-1 finding resolved (AC5 run: tsc ✓, 89 tests, 0 skipped) and reported **FAIL** on a second, smaller layer — mostly Express defaults and gaps in the round-1 contract wording:

| # | Finding | Resolution | Commit |
|---|---|---|---|
| R1 | §2 promised `fields.body` for a "missing" body, but an empty `application/json` body parses as `{}` and reports `title: Required` | Contract wording corrected (absent vs empty) + test for the absent case | `a0d2ef3`, `9db4f20` |
| R2 | HEAD untested for `/:id`; empty HEAD body asserted only for `/health` | Tests for every GET route and an unknown id | `0069548` |
| R3 | `charset=utf-16` passed body-parser's gate → 400 `INVALID_JSON`, not 415 | Explicit UTF-8 guard → 415 | `9db4f20` |
| R4 | Non-JSON media types (`text/plain`, form, `vnd.api+json`) silently dropped → 400 instead of 415 | Media-type guard → 415; contract §2 spells out what triggers 415 | `a0d2ef3`, `9db4f20` |
| R5 | No PATCH test for 413 | Test added | `9db4f20` |
| R6 | `/HEALTH`, `/health/`, `/API/V1/TASKS`, trailing slashes answered 200 (Express is case-insensitive and non-strict by default) | Case-sensitive routing + trailing-slash guard → 404; §2 states paths are exact | `a0d2ef3`, `0069548` |
| R7 | `ETag` on every response; `If-None-Match` → 304 (not a contract status) | ETag disabled; §2 states no conditional requests | `a0d2ef3`, `0069548` |
| R8 | gzip/deflate/br bodies inflated — 100 kB limit applied to decoded size | `inflate: false` → 415 | `9db4f20` |
| R9 | Duplicate JSON keys: last wins | **Accepted** — standard `JSON.parse` behaviour; now documented in §2 | `a0d2ef3` |
| R10 | `cursorSecret` sharing contradicted "this server instance" wording | Contract wording: instances sharing a secret count as one server | `a0d2ef3` |
| R11 | `dueDate: "0000-01-01"` accepted; titles of only zero-width characters pass `trim()` | **Accepted** — valid per §3 as written; revisit if a client needs stricter rules | — |
| — | Untested: `limit=100`, repeated `status`/`cursor` | Tests added | `0069548` |

The gate caught two of my own mistakes during round 2 before they were committed: a middleware array that widened `req.params` typing, and a guard that answered bodiless POSTs with 415.

**Why stop at round 2:** round 1 found a High-severity contract break; round 2 found Express defaults and contract-wording gaps; each round's findings were smaller. A third independent pass is cheap to run (`contract-auditor` again) and is the first thing to do before this API holds real data — but for a worked example the evidence below is sufficient.

### Status
**Verified.** Meets `CONTRACT.md` (as amended, §7): typecheck ✓ · **107 tests, 11 files, 0 skipped** ✓ · build ✓ · contract-coverage guard ✓ (every §5 code asserted, `ErrorCode` in sync). Two independent reviewer passes; all findings fixed or accepted with a reason above.
