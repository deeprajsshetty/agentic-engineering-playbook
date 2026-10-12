# 09 — Ship and operate

## Goal
Deploy with secrets handled correctly, prove production works by exercising it, and keep operating it — PRs, CI, monitoring — from wherever you are.

## Which surface
- **CLI** for deploys and env configuration (Vercel CLI first).
- **Desktop** for PR monitoring and the Browser pane during final visual review.
- **Mobile** via **Remote Control** to steer a running session; **Dispatch** (Cowork tab, Pro/Max) to start new work from your phone.

## Inputs → Outputs
- **In:** `APP VERIFIED` merge candidate, `.env.example`, `CONTRACT.md` acceptance criteria.
- **Out:** a production deployment, a live acceptance report, a release commit, and monitoring in place.

## Steps

### 1. Secrets and environment
- Local values in `.env` / `.env.local` — gitignored, never read by Claude (kit deny rules + secret guard).
- `.env.example` lists **every** variable with empty values; commit it.
- Generate secrets locally: `openssl rand -hex 32`.
- Production values go into the platform, never the repo:
  ```bash
  vercel env ls                          # names only — safe to show Claude
  vercel env add JWT_SECRET production   # you type the value, not Claude
  ```
- Values that differ per environment (OAuth redirect URIs, frontend URLs, webhook endpoints) — list them and update each provider console.
- Run the [environment audit prompt](../prompts/deploy/README.md#1-environment-audit-before-deploy).

### 2. Deploy (Vercel example — CLI first)
```bash
git status            # clean
npm run build         # passes locally
git push
vercel --prod
```
If env vars changed after the first deploy, redeploy. For provider-side config (OAuth consent screens, webhooks/subscriptions, cron secrets), keep a checklist in `docs/` — those steps are not in git.

### 3. Production verification — a deploy is not proof
Run the [live acceptance prompt](../prompts/deploy/README.md#3-live-acceptance-checks): every acceptance criterion from `CONTRACT.md` §1, every named error code, against the real URL with real credentials. Then walk the product yourself on desktop and a phone. For UIs, a final [visual pass against production data](../prompts/verify/README.md#3-visual-consistency-pass-subagent): long names, long threads, empty folders, 390px.

Any failure: fix → `/verify-unit` → redeploy → re-run the failed check. Then:
```bash
git commit --allow-empty -m "chore(release): v1 live at <url>, acceptance criteria verified"
```
(or a real release commit with the evidence in the body — [deploy prompt 6](../prompts/deploy/README.md#6-release-commit)).

### 4. PRs and CI
- Desktop: after opening a PR, the CI status bar (needs `gh`) offers **Auto-fix CI & address comments** and **Auto-merge when ready**. Use auto-merge only with comprehensive CI and a reviewed diff.
- CLI: `gh pr checks`, `gh run view --log-failed`.
- Optional Claude PR review: [`.github/workflows/claude-review.yml`](../.github/workflows/claude-review.yml) ([07](07-automate.md#6-claude-in-github-actions)).

### 5. Steer from your phone — Remote Control
```bash
claude --remote-control "My project"     # new interactive session, also controllable remotely
claude remote-control                    # server mode: start sessions from claude.ai/code or the app
```
Inside an existing session (CLI, Desktop, VS Code): `/remote-control` (alias `/rc`). Open the shown URL or the session list in the Claude app. Code runs on your machine the whole time — keep it awake and online.

| Workflow | Best for |
|---|---|
| Remote Control | Steering a session already running on your machine |
| Dispatch (Cowork tab) | Starting new Code sessions from your phone |
| Channels | Pushing external events (CI, chat) into a running session |
| Cloud session / routine | Work that must continue while your machine sleeps |

Use mobile for status, short decisions and small corrections. Ask for a notification when something finishes (*"Notify me when the tests finish"*; configure push in `/config`). Compose plans and review big diffs at a desk.

### 6. Keep operating
- Nightly suite or deploy verification as a **routine** ([07](07-automate.md#4-scheduling--pick-by-where-it-must-run)).
- `/loop` for watching a deploy while you're at the machine.
- Keep `CLAUDE.md`, `CONTRACT.md` and `.env.example` current with every change — they're the operations manual for the next session.

## Verified when…
- [ ] `git ls-files | grep -E '\.env($|\.)' ` shows only `.env.example`.
- [ ] Every env var in `.env.example` exists in production (names checked with `vercel env ls`).
- [ ] Every `CONTRACT.md` acceptance criterion passed against the production URL, with evidence recorded.
- [ ] Desktop and phone walkthroughs done; reduced-motion and keyboard paths checked for UIs.
- [ ] A release commit records what was verified.

## Three Standards check
- **Scale:** Is deployment reproducible by someone else from `CONTRIBUTING.md` and the docs checklist?
- **Secure:** Secrets only in the platform; least-privilege keys (service-role keys server-side only); cron and webhook endpoints authenticated; remote sessions only from your own devices.
- **Understand:** If production breaks tonight, do you know which log, which env var and which commit to check first?

## Common mistakes
- Treating `vercel --prod` exiting 0 as "it works".
- Pasting secret values into the conversation to "set them up faster".
- Forgetting provider-side production config (redirect URIs, webhook endpoints) — the app deploys fine and fails live.
- Approving large diffs from a phone.
- Testing OAuth inside an embedded preview — use a real browser.

## Course reference
Module 3 — Remote Control, PR monitoring, execution environments. Module 4 — Deploying and Configuring Production Infrastructure; Verifying What We Built. Module 5 — Final Pass & Deployment. Module 6 — Wire Up Our Contact Form (ship checks).
