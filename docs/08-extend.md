# 08 — Extend and reuse: skills, subagents, hooks, plugins, MCP

## Goal
Turn what you repeat into reusable, narrowly scoped extensions — and choose the lightest one that does the job.

## Which surface
**Claude Code (CLI or Desktop)** — all extensions are files under `.claude/` (project), `~/.claude/` (personal) or a plugin.

## Inputs → Outputs
- **In:** a workflow you've done three times; a convention Claude keeps missing; an external service you call.
- **Out:** a skill, subagent, hook, rule, plugin or MCP connection — committed, documented and tested.

## Steps

### 1. Pick the extension type

| You want… | Use | Lives in | Loads |
|---|---|---|---|
| A repeatable workflow you trigger (`/verify-unit`) | **Skill** with `disable-model-invocation: true` | `.claude/skills/<name>/SKILL.md` | When you type `/name` |
| Knowledge Claude should apply when relevant | **Skill** (model-invocable) | same | Description always; body when relevant |
| A focused specialist with its own context and minimal tools | **Subagent** | `.claude/agents/<name>.md` | When delegated to |
| Something that must *always* happen or *never* happen | **Hook** (+ permission rules) | `.claude/settings.json` → `hooks` | On lifecycle events |
| A rule for one area of the codebase | **Rule** with `paths:` | `.claude/rules/<name>.md` | When matching files are touched |
| Your conventions across every repo, shareable with a team | **Plugin** | Its own repo / marketplace | Wherever installed |
| An external system Claude must discover or act on | **CLI** first, **MCP** if it earns it | `.mcp.json` or `claude mcp add` | Tools listed every session |

Custom commands (`.claude/commands/*.md`) still work but have been merged into skills; prefer skills for new work.

### 2. Write a good skill
```markdown
---
name: api-endpoints
description: How to add or change an API endpoint. Use when creating routes, handlers, controllers or request validation.
allowed-tools:
  - Read
  - Bash(npm test *)
---
# Steps …   # operational, numbered
# Constraints …  # checkable in the output
```
Criteria: the `description` says **when** to trigger; steps are operations, not aspirations; constraints can be checked; important prohibitions explain why; scope is narrow. Arguments: `$ARGUMENTS`, `$0`, `$1`, or named via `arguments:`. Examples: [`kit/.claude/skills/`](../kit/.claude/skills/).

### 3. Write a good subagent
```markdown
---
name: contract-auditor
description: Audits implementation against CONTRACT.md. Use before merging parallel branches.
tools: Read, Grep, Glob
model: inherit
---
You audit code against CONTRACT.md. Report mismatches; do not reassure and do not fix. …
Output — exactly this format: …
```
Minimal `tools`; an explicit stance; a fixed output format. Add `isolation: worktree` for agents that edit in parallel. Examples: [`kit/.claude/agents/`](../kit/.claude/agents/).

### 4. Write a good hook
- **Fast** (milliseconds) — no test suites, no network.
- `PreToolUse` with `matcher: "Write|Edit"` can **block** by exiting `2` (stderr is shown to Claude). Exit `0` = no opinion; other codes = non-blocking error.
- Reference scripts as `"${CLAUDE_PROJECT_DIR}/.claude/hooks/x.sh"`; read the event JSON from stdin (`tool_input.file_path`, `tool_input.content` / `new_string`).
- Test it like code: [`scripts/test-hooks.sh`](../scripts/test-hooks.sh).

### 5. Build and publish your plugin
This repo *is* a marketplace: [`.claude-plugin/marketplace.json`](../.claude-plugin/marketplace.json) lists [`plugin/my-standards`](../plugin/my-standards/).
```text
/plugin marketplace add deeprajsshetty/agentic-engineering-playbook
/plugin install my-standards@deeprajsshetty-standards
/reload-plugins
```
Update: edit → bump `version` in `plugin.json` → push → `/plugin marketplace update deeprajsshetty-standards` → `/reload-plugins`. Validate before pushing:
```bash
claude plugin validate .
claude plugin validate plugin/my-standards
```
Plugin skills are namespaced (`/my-standards:atomic-commit`). Rule of thumb: **repo-specific → kit/project `.claude/`; personal and portable → plugin.** Where both exist, project `context/` files win (the plugin skills say so).

Inspect a well-built third-party plugin before writing your own: `/plugin` → browse `claude-plugins-official`, install, then read its `SKILL.md` files under `~/.claude/plugins/`.

### 6. CLI vs MCP — the lightest effective tool
1. **CLI** for a known operation (`vercel ls`, `gh pr checks`, `supabase migration list`) — cheapest in context, reviewable.
2. **Thin CLI wrapper** (`scripts/foo.sh`) when an API has no CLI.
3. **MCP** when you need discovery or structured actions the CLI can't express — it costs context every session it's loaded.

Teach the preference with a skill (the plugin's `external-tools`). Compare yourself: ask *"status of my latest Vercel deployment"* with the Vercel MCP connected, then *"… use the Vercel CLI"*, and look at `/context`.

```bash
claude mcp add --transport http <name> <url>           # remote MCP server
claude mcp add <name> -- npx -y <package>               # local stdio server
claude mcp add --scope project --transport http <name> <url>   # shared via .mcp.json
```
Authenticate remote servers in-session with `/mcp`.

### When to use something else
Building your **own** MCP server or a custom agent on the Agent SDK is covered in [12 — FDE playbook](12-fde-playbook.md#6-optional-advanced-custom-mcp-servers-and-the-agent-sdk) — it's beyond the bootcamp.

## Verified when…
- [ ] Each new skill triggers when it should (and not when it shouldn't) in a fresh session.
- [ ] Each subagent returns its fixed format on a real task.
- [ ] Each hook has a test that proves block and allow cases.
- [ ] `claude plugin validate` passes for the marketplace and plugin; install works in a fresh session.
- [ ] `/context` shows no MCP server you aren't using.

## Three Standards check
- **Scale:** Does the extension live at the right level (project vs personal vs team plugin) so others get it automatically?
- **Secure:** Minimal `tools`/`allowed-tools`; hooks can't be bypassed by the agent editing them (keep `.claude/` changes reviewed); MCP servers from trusted sources at narrow scope.
- **Understand:** Could you predict when each skill loads and what each hook will do on a given action?

## Common mistakes
- Vague skill descriptions ("helps with code") — they never trigger, or always do.
- Subagents with all tools and no output format — they become a second, unfocused main agent.
- Slow hooks (tests, network) — every turn gets slower.
- Forgetting to bump the plugin `version` — installed copies don't update.
- Reaching for MCP for an operation you could name in one CLI command.

## Course reference
Module 2 — Slash Commands (custom command location), Plugins, Install a Plugin, Vercel (CLI vs. MCP). Module 4–5 — `/verify-unit` command, visual and accessibility agents.
