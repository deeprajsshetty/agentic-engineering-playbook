#!/bin/sh
# doctor.sh — health check for a repository that uses the agentic kit. Read-only.
#
#   scripts/doctor.sh [TARGET_DIR]
#
# Exit code: 0 if no FAIL (warnings allowed), 1 if any check FAILs.
set -u

PLAYBOOK_ROOT=$(cd "$(dirname "$0")/.." && pwd)
# shellcheck source=scripts/lib/common.sh
. "$PLAYBOOK_ROOT/scripts/lib/common.sh"

case ${1:-} in -h|--help) sed -n '2,6p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;; esac

TARGET=${1:-.}
[ -d "$TARGET" ] || die "target directory not found: $TARGET"
TARGET=$(cd "$TARGET" && pwd)

PASS=0; WARN=0; FAIL=0
pass() { PASS=$((PASS + 1)); printf '%sPASS%s  %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warnc() { WARN=$((WARN + 1)); printf '%sWARN%s  %s\n' "$C_YELLOW" "$C_RESET" "$*"; }
fail() { FAIL=$((FAIL + 1)); printf '%sFAIL%s  %s\n' "$C_RED" "$C_RESET" "$*"; }

info "Agentic kit doctor — $TARGET"
info ""

# Tooling
if command -v claude >/dev/null 2>&1; then
  pass "claude installed ($(claude --version 2>/dev/null | head -1))"
else
  fail "claude not found — install: curl -fsSL https://claude.ai/install.sh | bash"
fi

if command -v node >/dev/null 2>&1; then
  major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)
  if [ "$major" -ge 22 ]; then pass "node $(node --version)"; else warnc "node $(node --version) — Golden Path expects Node 22+"; fi
else
  warnc "node not found — needed for the secret-guard hook and the Golden Path stack"
fi

if command -v gh >/dev/null 2>&1; then pass "gh installed"; else warnc "gh not installed — needed for PR workflows and Desktop CI status (brew install gh)"; fi

# Git state
if git -C "$TARGET" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  pass "git repository (branch: $(git -C "$TARGET" branch --show-current 2>/dev/null || echo '?'))"
  if [ -z "$(git -C "$TARGET" status --porcelain)" ]; then pass "working tree clean"; else warnc "working tree has uncommitted changes"; fi

  if git -C "$TARGET" check-ignore -q --no-index .env 2>/dev/null; then pass ".env is gitignored"; else fail ".env is NOT gitignored — add it to .gitignore"; fi
  tracked_env=$(git -C "$TARGET" ls-files | grep -E '(^|/)\.env(\.|$)' | grep -vE '\.env\.(example|sample|template)$' || true)
  if [ -z "$tracked_env" ]; then pass "no .env files tracked"; else fail "tracked env files: $(echo "$tracked_env" | tr '\n' ' ')— git rm --cached them and rotate secrets"; fi
  kitnew=$(cd "$TARGET" && find . -name '*.kit-new' -not -path './node_modules/*' -not -path './.git/*' | head -5)
  if [ -z "$kitnew" ]; then pass "no unmerged *.kit-new files"; else warnc "unmerged kit conflicts: $(echo "$kitnew" | tr '\n' ' ')"; fi
else
  fail "not a git repository — the kit relies on git for rollback and scope checks"
fi

# CLAUDE.md
if [ -f "$TARGET/CLAUDE.md" ]; then
  lines=$(wc -l < "$TARGET/CLAUDE.md" | tr -d ' ')
  if [ "$lines" -le 120 ]; then pass "CLAUDE.md is $lines lines"
  elif [ "$lines" -le 200 ]; then warnc "CLAUDE.md is $lines lines — aim for one page; move detail to context/ or .claude/rules/"
  else fail "CLAUDE.md is $lines lines — over the 200-line guidance; adherence drops"; fi
  if grep -q '\[Two or three sentences' "$TARGET/CLAUDE.md"; then warnc "CLAUDE.md still contains template placeholders — run /onboard-repo or fill it in"; fi
  if grep -qi '^## Commands' "$TARGET/CLAUDE.md"; then pass "CLAUDE.md has a Commands section"; else warnc "CLAUDE.md has no '## Commands' section — /verify-unit falls back to defaults"; fi
else
  fail "CLAUDE.md missing — run /init, then /onboard-repo"
fi

# .claude settings
for f in "$TARGET/.claude/settings.json" "$TARGET/.claude/settings.local.json"; do
  [ -f "$f" ] || continue
  json_valid "$f"; rc=$?
  case $rc in
    0) pass "${f#"$TARGET"/} is valid JSON" ;;
    2) warnc "cannot validate ${f#"$TARGET"/} (no jq, node or python3)" ;;
    *) fail "${f#"$TARGET"/} is INVALID JSON — Claude Code will ignore it" ;;
  esac
done
[ -f "$TARGET/.claude/settings.json" ] || fail ".claude/settings.json missing — run scripts/adopt-existing.sh"
if [ -f "$TARGET/.claude/settings.json" ] && grep -q 'Read(.env)' "$TARGET/.claude/settings.json"; then
  pass "settings deny reading .env"
elif [ -f "$TARGET/.claude/settings.json" ]; then
  warnc "settings.json has no Read(.env) deny rule"
fi

# Hooks and skills
for h in secret-guard.mjs activity-log.sh; do
  p="$TARGET/.claude/hooks/$h"
  if [ ! -f "$p" ]; then warnc "hook missing: .claude/hooks/$h"
  # .mjs hooks run via `node <file>`; only shell hooks need the exec bit.
  elif case $h in *.sh) [ ! -x "$p" ];; *) false;; esac; then fail "hook not executable: .claude/hooks/$h (chmod +x)"
  else pass "hook present: $h"; fi
done
kit_skills=$(find "$PLAYBOOK_ROOT/kit/.claude/skills" -name SKILL.md | wc -l | tr -d ' ')
skills=$(find "$TARGET/.claude/skills" -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$skills" -ge "$kit_skills" ]; then pass "$skills skills installed"; else warnc "$skills skills found in .claude/skills (kit ships $kit_skills)"; fi

# Planning docs
for d in CONTRACT.md BUILD_SEQUENCE.md; do
  if [ -f "$TARGET/$d" ]; then pass "$d present"; else warnc "$d missing — see templates/$d"; fi
done

info ""
info "Result: $PASS pass · $WARN warn · $FAIL fail"
[ "$FAIL" -eq 0 ]
