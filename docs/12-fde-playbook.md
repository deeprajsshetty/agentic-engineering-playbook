# 12 — FDE playbook: running a client engagement

## Goal
Take a client from "we want to use Claude for engineering" to a measured, secure pilot and a team that runs the workflow without you — using the same discipline as the rest of this playbook.

## Which surface
- **Claude.ai Project** (yours) for discovery notes, proposals and the engagement's planning documents.
- **Claude Code** in the client's repository — under *their* accounts, policies and permissions — for the pilot.
- **Claude Code admin controls** (managed settings, GitHub Action) for rollout.

## Inputs → Outputs
- **In:** a sponsor, a business problem, access to one repository and its owners.
- **Out:** discovery brief, security sign-off, pilot plan with baseline metrics, pilot results, rollout pack (shared settings, team plugin, CI review, onboarding agenda), and a handover pack the client owns.

## Steps

### 1. Discovery (week 0)
Run it as a structured interview; record answers in a discovery brief (PRD-shaped).

| Area | Ask |
|---|---|
| Business goal | What outcome, measured how, by when? What happens if nothing changes? |
| Users | Which engineers/teams? Seniority? Current tools and workflow? Who will champion it? |
| Systems | Repos, languages, CI/CD, environments, deployment cadence, test coverage today |
| Data sensitivity | PII, PHI, PCI, secrets, IP classification; residency or retention requirements |
| Constraints | Approved vendors/providers (Claude API, Bedrock, Vertex, Foundry), network egress, budget |
| Success metrics | Cycle time, review findings, coverage, escaped defects, developer time saved |
| Out of scope | What must Claude never touch? (Production data, certain repos, infra) |

### 2. Access and security checklist (before any session runs)
- [ ] **Accounts:** Claude seats or API keys owned by the client (Team/Enterprise or their cloud provider), not yours.
- [ ] **Least privilege:** one pilot repo; branch protection on `main`; Claude never has deploy rights; you work on branches + PRs.
- [ ] **Secrets:** no secrets in repos or prompts; `.env` ignored; kit deny rules + `secret-guard` hook installed; production credentials never on the pilot machine.
- [ ] **Data handling:** review [data usage](https://code.claude.com/docs/en/data-usage) and retention with their security team; zero-data-retention or provider-specific terms where required.
- [ ] **What Claude may / may not touch:** written into `CLAUDE.md` *Never do* and enforced in `.claude/settings.json` (deny rules for sensitive paths; `ask` for git writes).
- [ ] **Isolation:** sandboxing on (`/sandbox`) or a dev container for any unattended run; `bypassPermissions` disabled org-wide (`permissions.disableBypassPermissionsMode`) if policy requires.
- [ ] **Audit trail:** every change is a reviewed commit/PR; `activity-log.sh` Stop hook log; OpenTelemetry monitoring if they need usage visibility ([monitoring](https://code.claude.com/docs/en/monitoring-usage)).
- [ ] **Sign-off:** security owner approves this checklist in writing.

### 3. Pilot plan (2–4 weeks)
Pick **one well-bounded workflow** in **one repo**: e.g. "add endpoints to service X", "raise test coverage of module Y", "migrate Z to the new SDK". Not "everything".

1. **Baseline** (before Claude): cycle time from ticket start to merged PR for the last ~10 comparable items; review findings per PR; coverage of the target module; escaped defects in the last quarter.
2. **Adopt the kit** on a branch ([10 — Brownfield adoption](10-brownfield-adoption.md)); `/onboard-repo` with the team present.
3. **Acceptance criteria** for the pilot itself, written like `CONTRACT.md` §1 — e.g. "8 items shipped through the atomic loop; 0 secrets incidents; every PR passes CI and human review."
4. **Run** with the client's engineers driving and you coaching. Every unit: `/verify-unit` → `/ship-unit` → PR → human review.
5. **Measure** the same metrics on pilot items. Track review findings by category (Structural / Consistency / Visual / Security) — that tells you which standards need stronger encoding.

| Metric | Baseline | Pilot | Source |
|---|---|---|---|
| Cycle time (median, hours) | | | Tickets + PR timestamps |
| Review findings per PR | | | PR comments, `/audit` tables |
| Test coverage (target module) | | | Coverage report |
| Escaped defects | | | Incident/bug tracker |
| Tokens / cost per item | | | `/usage`, analytics |

### 4. Rollout
- **Shared project settings:** commit `.claude/settings.json`, skills, agents and `context/` to each repo (via `adopt-existing.sh`).
- **Team plugin:** move the team's cross-repo conventions into a plugin in a client-owned marketplace repo. Make it automatic per repo by committing this to `.claude/settings.json` (applies after each developer trusts the folder):
  ```json
  {
    "extraKnownMarketplaces": {
      "acme-standards": { "source": { "source": "github", "repo": "acme/claude-standards" } }
    },
    "enabledPlugins": { "acme-engineering@acme-standards": true }
  }
  ```
  For the whole organisation, admins put the same keys in managed settings ([plugins for your organization](https://code.claude.com/docs/en/plugins/org)).
- **CI review:** the opt-in `claude-review.yml` from this repo, or the managed [Code Review](https://code.claude.com/docs/en/code-review) product.
- **Onboarding session (90 min):** 15 — mental model and Three Standards · 20 — live: plan → unit → verify → ship on their repo · 15 — their `CLAUDE.md`, skills and hooks: what each does · 20 — hands-on, each engineer ships one unit · 10 — safety rules and how to report problems · 10 — Q&A.

### 5. Handover pack — what the client keeps
| Item | Owner after handover | How it stays current |
|---|---|---|
| `CLAUDE.md` + `context/` per repo | Tech lead of each repo | Updated in the same PR as any refactor; `/doctor prompt-audit` quarterly |
| `CONTRACT.md` per service | Service owner | Contract change first, code second; change-log section |
| Team plugin + marketplace repo | Platform / DevEx team | Version bump per change; `/plugin marketplace update` |
| `.claude/settings.json` policy | Security + platform | Reviewed like any security config; managed settings for org-wide rules |
| Pilot report (metrics, findings, decisions) | Sponsor | Re-measure at 90 days |
| Runbook: this playbook's `docs/` adapted | Platform team | — |

### 6. Optional advanced: custom MCP servers and the Agent SDK
> Beyond the bootcamp. The Agent SDK details below are verified against the Claude Code docs; the MCP SDK is published by the Model Context Protocol project — check its own docs before building.

**Build a custom MCP server when** the client has an internal system (ticketing, data catalogue, deployment platform) with no CLI, the agent needs to *discover* what's available, and many teams will reuse it. Before that, try a thin CLI wrapper plus a skill — cheaper in context and easier to secure. If you do build one: the official MCP SDKs (e.g. `@modelcontextprotocol/sdk` for TypeScript); expose narrow, typed tools; read-only by default; authenticate per user; register with `claude mcp add --scope project` so it's reviewed in `.mcp.json`.

**Build on the Claude Agent SDK when** the client needs Claude's agent loop *inside their own product or pipeline* (a triage bot, a migration service, a review agent in their platform), not in a developer's terminal:
```bash
npm install @anthropic-ai/claude-agent-sdk      # TypeScript
pip install claude-agent-sdk                     # Python
```
```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Review src/ for unhandled errors and report findings only.",
  options: { allowedTools: ["Read", "Grep", "Glob"], permissionMode: "dontAsk" },
})) {
  if (message.type === "result") console.log(message.subtype);
}
```
The SDK loads the project's `.claude/` skills, commands and `CLAUDE.md` like Claude Code does. Products built on it authenticate with API keys (or a cloud provider), not claude.ai logins.

| Need | Lightest fit |
|---|---|
| Developers run a known operation | CLI + skill |
| Developers need to discover/act on an internal system | Custom MCP server |
| Unattended job in CI | `claude -p` or the GitHub Action |
| Agent embedded in the client's own application | Agent SDK |

## Verified when…
- [ ] Discovery brief and security checklist signed off before the first session.
- [ ] Pilot ran in one repo with baseline and pilot metrics in the same table.
- [ ] Every pilot change went through branch → `UNIT VERIFIED` → PR → human review.
- [ ] Rollout pack merged in each target repo; onboarding session delivered.
- [ ] Handover table has a named owner for every item.

## Three Standards check
- **Scale:** Will the workflow survive your departure — documents, plugin and settings in client-owned repos?
- **Secure:** Did their security team approve data handling, access and isolation *in writing*? Can Claude reach production or customer data? (It shouldn't.)
- **Understand:** Can their engineers explain why each gate exists, not just run it?

## Common mistakes
- Piloting on the hardest, least-tested repo — the result says more about the repo than the method.
- No baseline — then "faster" is an opinion.
- Using your own accounts or keys inside a client environment.
- Rolling out broadly before the pilot's findings are encoded into `CLAUDE.md`, skills and hooks.
- Handing over files without owners.

## Course reference
Synthesis of the course's discipline (Modules 1–4: planning documents, Three Standards, atomic shipping, verification) applied to client delivery. Custom MCP servers are listed in the course as later material; the Agent SDK is beyond the course — both verified against current Claude Code docs where noted.
