# `my-standards` — personal plugin

Cross-project conventions that follow you into every repository: `CLAUDE.md` describes *a project*; this plugin describes *how you work*.

| Skill | Loads when… |
|---|---|
| `my-standards:api-endpoints` | Adding routes/handlers — unless the project has its own conventions |
| `my-standards:testing-standards` | Writing or fixing tests — unless the project has its own |
| `my-standards:atomic-commit` | Preparing a commit or commit message |
| `my-standards:external-tools` | Any task touching GitHub, Vercel, Supabase or another external service |

## Install

The marketplace manifest lives at the repo root ([`.claude-plugin/marketplace.json`](../../.claude-plugin/marketplace.json)), so the whole playbook repo is the marketplace:

```text
/plugin marketplace add deeprajsshetty/agentic-engineering-playbook
/plugin install my-standards@deeprajsshetty-standards
/reload-plugins
```

Try it locally without installing: `claude --plugin-dir ./plugin/my-standards`.

## Update

1. Edit a skill, bump `version` in `.claude-plugin/plugin.json` (installed copies stay on the old version until you do), commit, push.
2. In Claude Code:
   ```text
   /plugin marketplace update deeprajsshetty-standards
   /reload-plugins
   ```

## Validate

```bash
claude plugin validate .                     # marketplace (repo root)
claude plugin validate plugin/my-standards   # plugin
```

## Add a skill

Create `skills/<name>/SKILL.md` with a `description` that says **when** to trigger, operational steps, and constraints that can be checked in the output. Keep each skill narrow — context activates only where it applies.
