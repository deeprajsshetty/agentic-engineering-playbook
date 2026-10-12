# taskr-api — worked example

A minimal task API (Express 5, TypeScript strict, zod, Vitest) built through the playbook's full lifecycle: kit adoption → PRD → frozen contract → six atomic units → Director's Audit with independent reviewer subagents → fixes, one commit each → re-audit → fixes.

**The process is the point.** Start with [WALKTHROUGH.md](WALKTHROUGH.md).

| File | Job |
|---|---|
| [PRD.md](PRD.md) | What and why; success criteria |
| [CONTRACT.md](CONTRACT.md) | Endpoints, data model, typed errors — the source of truth (amended after audit, see §7) |
| [BUILD_SEQUENCE.md](BUILD_SEQUENCE.md) | Six atomic units and what "verified" meant for each |
| [AUDIT_LOG.md](AUDIT_LOG.md) | Two audit rounds (16 + 12 findings) and the commit that resolved or accepted each |
| [WALKTHROUGH.md](WALKTHROUGH.md) | Commit-by-commit map to lifecycle stages and prompts |
| [CLAUDE.md](CLAUDE.md) | Standing orders for Claude Code in this folder |

```bash
npm ci && npm test && npm run dev
```
