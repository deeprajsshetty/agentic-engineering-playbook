---
name: external-tools
description: Which command-line tools to use for external services (GitHub, Vercel, Supabase) instead of MCP servers, and when MCP is worth it. Use whenever a task involves deployments, environment variables, pull requests, databases or another external service.
---

# External tools — CLI first

**Hierarchy (lightest effective tool):**

1. **CLI** for a known operation — cheapest in context, scriptable, reviewable.
2. **Thin CLI wrapper** (a small script in `scripts/`) when a service has an API but no CLI.
3. **MCP** only when you need *discovery* (you don't know what operation you need) or a structured action the CLI can't do — it costs context on every turn it's loaded.

## Installed CLIs and their common operations

| Tool | Use it for | Read-only (safe) | Mutating (ask first) |
|---|---|---|---|
| `gh` | PRs, issues, CI status | `gh pr view`, `gh pr checks`, `gh run list`, `gh issue list` | `gh pr create`, `gh pr merge`, `gh repo create` |
| `vercel` | Deployments, env vars | `vercel ls`, `vercel env ls`, `vercel inspect <url>` | `vercel --prod`, `vercel env add`, `vercel env rm` |
| `supabase` | Migrations, types, local stack | `supabase status`, `supabase migration list` | `supabase db push`, `supabase link` |

## Rules

- Prefer a CLI command over the equivalent MCP tool whenever you already know the operation.
- Never print secret values: `vercel env ls` lists names; do not `vercel env pull` into the conversation.
- Production-affecting commands (`--prod`, `db push`, `merge`) need the director's explicit go-ahead in the current conversation.

> Add a row each time you install a new CLI, then run `/plugin marketplace update deeprajsshetty-standards` and `/reload-plugins`.
