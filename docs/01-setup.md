# 01 — Setup and safety baseline

## Goal
A working Claude Code install on every surface you'll use, connected to your editor, with current-docs lookup (Context7) and a safety baseline in place before the first real project.

## Which surface
**CLI** for install and verification; **Desktop app** for the Code tab; **Claude app** on your phone for Remote Control. All share `~/.claude/` and the project's `.claude/`.

## Inputs → Outputs
- **In:** a Pro, Max, Team, Enterprise or Console account; git; Node 22+ (for the Golden Path stack).
- **Out:** `claude --version` works; `claude doctor` is clean; user settings in `~/.claude/settings.json`; Context7 available; the kit's `.claude/` ready to drop into projects.

## Steps

### 1. Install (native installer — recommended)
```bash
curl -fsSL https://claude.ai/install.sh | bash
claude --version
claude doctor
```
Alternatives: `brew install --cask claude-code` (manual upgrades: `brew upgrade claude-code`), `winget install Anthropic.ClaudeCode`, or npm (`npm install -g @anthropic-ai/claude-code`, needs Node 22+, never with `sudo`). Native installs auto-update.

### 2. Sign in and open a project
```bash
cd ~/code/some-project
claude          # first run opens the browser to sign in; accept the workspace-trust prompt
```
Exit with `/exit` or `Ctrl+C` twice. Resume later with `claude --continue` (most recent) or `claude --resume` (picker).

### 3. Connect your editor
In a terminal inside VS Code/Cursor or JetBrains, start `claude` and run `/ide` to link diffs and diagnostics. Or install the VS Code extension for checkpoints and inline diffs.

### 4. Desktop app
Install Claude Desktop, open the **Code** tab, and for each session set: **Environment** (Local), **project folder** (the repo itself, not its parent), **model**, and **permission mode** (Manual · Accept edits · Plan · Auto · Bypass permissions). Move a terminal session into Desktop with `/desktop`.

### 5. Voice (optional)
```text
/voice tap
```
Persisted in `~/.claude/settings.json` as `{ "voice": { "enabled": true, "mode": "tap" } }`. Requires a claude.ai sign-in and a local microphone (not API-key, Bedrock/Vertex/Foundry, SSH or cloud sessions).

### 6. Current documentation via Context7 (MCP)
```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp
claude mcp list
```
Restart the session, then: *"Use Context7 to fetch the current Express docs for registering middleware."* ⚠️ Verify: course-described, not confirmed in current docs — the package name and endpoint are published by Context7, not Anthropic; check their README if the command fails.

MCP scopes: `--scope local` (default, you only), `--scope project` (writes `.mcp.json`, shared — Claude asks before using project servers), `--scope user` (all your projects).

### 7. Safety baseline (do once per machine, then per repo)
- **Per machine** — in `~/.claude/settings.json`, deny reading secrets everywhere:
  ```json
  { "permissions": { "deny": ["Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(//**/.env)"] } }
  ```
- **Per repo** — apply the kit (`scripts/adopt-existing.sh` or `scripts/bootstrap-new.sh`): least-privilege `.claude/settings.json`, the secret-guard hook, `.env` in `.gitignore`, `.env.example` with empty values.
- **Default mode** — in current versions (v2.1.283+) new interactive sessions start in **auto** mode (a classifier reviews actions); they fall back to Manual where auto mode is unavailable (unsupported model, org policy, HIPAA configuration). For unfamiliar or sensitive repos start in Manual: `claude --permission-mode manual`.
- **Never** run `--dangerously-skip-permissions` outside a container/VM with nothing you care about.

### When to use something else
Homebrew/WinGet if your org manages software that way; a [dev container](https://code.claude.com/docs/en/devcontainer) when you want hard isolation for unattended runs.

## Verified when…
- [ ] `claude --version` prints a version; `claude doctor` reports no installation issues.
- [ ] A session in a real repo can summarise its structure.
- [ ] `/ide` connects to the right editor window.
- [ ] `claude mcp list` shows `context7` connected and a Context7 query returns current docs.
- [ ] `~/.claude/settings.json` denies reading `.env` and SSH/cloud credentials.

## Three Standards check
- **Scale:** Is your personal config (`~/.claude/`) separate from project config (`.claude/`), so teammates get the project rules without your preferences?
- **Secure:** Are credentials unreadable by default? Are MCP servers limited to ones you trust, at the narrowest scope?
- **Understand:** Do you know which settings file a rule came from? (`/permissions` shows rules by scope; `/status` shows the account and model.)

## Common mistakes
- Opening the parent folder instead of the repo — Claude reads and loads the wrong `CLAUDE.md`.
- Installing many MCP servers "just in case": each costs context. Add them when a task needs them.
- `sudo npm install -g` — permission problems and a security risk.
- Putting an API key in `~/.zshrc` that silently overrides your claude.ai sign-in (voice and `/schedule` then disappear).

## Course reference
Module 2 — Setting Up the Agentic Development Environment; Extended Memory: Ogham MCP & Context7 (Ogham is a third-party memory server — ⚠️ Verify: course-described, not confirmed in current docs). Module 3 — Claude Code Desktop App.
