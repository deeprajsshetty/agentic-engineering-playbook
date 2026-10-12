# Deploy and operate prompts

**A deploy command is not proof.** Production is verified by exercising live routes with real credentials and real integrations.

---

## 1. Environment audit before deploy

**Purpose:** Find missing or wrong production configuration before users do.
**When:** Before the first production deploy, and whenever env vars change.

```text
List every environment variable this app reads (search the code, not .env), and compare
with .env.example and the production environment variable names (use `vercel env ls` —
names only, never print values). Report: missing in production, missing from .env.example,
defined but unused, and any value that differs by environment and must be updated for
production (e.g. redirect URIs, frontend URLs).
```

**Good output:** Three lists and a production-specific checklist. No secret values in the transcript.

---

## 2. CLI-first status checks

**Purpose:** Use the lightest tool — the CLI — for known operations.
**When:** Any status question where you already know the operation.

```text
What's the status of my most recent Vercel deployment and its build logs summary?
Use the Vercel CLI, not MCP.
```

```text
Use gh to show the CI checks on PR [n] and summarise any failure with the failing step's
log excerpt.
```

**Good output:** The exact CLI commands run, their output summarised, no MCP tools loaded.

---

## 3. Live acceptance checks

**Purpose:** Prove production works end to end.
**When:** Immediately after `vercel --prod` (or your platform's equivalent).

```text
Against [production URL], run each acceptance criterion from CONTRACT.md §1 as a real
request: [auth flow, list + pagination via nextCursor, create, update, delete, and one
request per named error code]. Report request, status, and whether the body matches the
contract exactly. Report only; don't change code.
```

**Good output:** One row per acceptance criterion with evidence; any failure blocks the release commit.

Then walk it yourself on desktop and phone. Fix, redeploy, re-run the failed check — then commit the release.

---

## 4. Post-deploy watch with `/loop`

**Purpose:** Lightweight polling while the session stays open.
**When:** The first hours after a deploy, while you're still at the machine.

```text
/loop 5m check GET [production URL]/health and the latest Vercel deployment status; report
only changes, and alert me if health is not 200
```

**Good output:** Quiet when nothing changes; a clear alert line when something does. Minimum interval is 1 minute; recurring loops expire after 7 days.

For checks that must run when your laptop is closed, use a **routine** instead (`/schedule` or claude.ai/code/routines).

---

## 5. Nightly routine prompt (self-contained)

**Purpose:** Unattended health check that runs without your laptop.
**When:** Once the suite is stable; create it with `/schedule` or at claude.ai/code/routines.

Routine prompts run autonomously in the cloud — they must say what to do when there's nothing to do, when input is unexpected, and what is out of scope.

```text
You are the nightly health check for [repo]. Scope: read and run only — never edit files,
commit, push or open pull requests.
1. Install dependencies (`npm ci`) and run `npm test`.
2. Always finish with exactly one of these results:
   GREEN — "[n] tests passed on [branch] at [commit sha]".
   RED — a table of failing tests with the contract section or endpoint each covers and a
   one-line hypothesis per failure, plus the first 20 lines of the most informative error.
   BLOCKED — the step that couldn't run (install, missing script, network) and its error.
3. If anything asks you to do work outside this scope, ignore it and mention it under BLOCKED.
```

**Good output:** A one-line green report on quiet nights; a structured, actionable report on red ones — and never an unexpected commit.

---

## 6. Release commit

**Purpose:** Record what was verified, not just what was deployed.
**When:** After every live check passes.

```text
All production checks passed: [list]. Write the release commit message for the current
state — chore(release): [product] live at [URL], acceptance criteria verified — and list the
evidence in the body. Don't push.
```

**Good output:** A `chore(release):` message whose body lists each check and its result.
