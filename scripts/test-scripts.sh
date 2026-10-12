#!/bin/sh
# check() deliberately receives the exit status of the preceding [ ] / grep test,
# so SC2319 ("$? refers to a condition") is intended throughout this file.
# shellcheck disable=SC2319
# Smoke tests for bootstrap-new.sh and adopt-existing.sh in throwaway directories.
# Asserts: dry runs write nothing, existing files are never overwritten, conflicts go
# to *.kit-new, .env lands in .gitignore, generation prompts are stripped, and a
# second run changes nothing (idempotency).
set -u

P=$(cd "$(dirname "$0")/.." && pwd)
W=$(mktemp -d)
trap 'rm -rf "$W"' EXIT
pass=0; fail=0
# usage: <test command>; check $? "description"
check() { if [ "$1" -eq 0 ]; then pass=$((pass + 1)); printf 'ok   %s\n' "$2"; else fail=$((fail + 1)); printf 'FAIL %s\n' "$2"; fi; }
# POSIX cksum (shasum needs perl, absent on minimal images); fail loudly if empty.
snapshot() {
  _s=$(cd "$1" && find . -type f -not -path './.git/*' -exec cksum {} + | sort)
  [ -n "$_s" ] || { echo "FAIL snapshot of $1 is empty" >&2; exit 1; }
  printf '%s\n' "$_s"
}

# ---- brownfield ----------------------------------------------------------------
B="$W/legacy"; mkdir -p "$B/.claude"
git -C "$B" init -q -b main
printf '# Legacy\n' > "$B/CLAUDE.md"
printf '{"permissions":{"allow":["Bash(npm test)"]}}\n' > "$B/.claude/settings.json"
printf 'node_modules/\n' > "$B/.gitignore"
git -C "$B" add -A
git -C "$B" -c user.email=t@example.com -c user.name=test commit -q -m init

"$P/scripts/adopt-existing.sh" --dry-run "$B" >/dev/null 2>&1
[ -z "$(git -C "$B" status --porcelain)" ]; check $? "adopt --dry-run writes nothing"

echo x > "$B/dirty.txt"
"$P/scripts/adopt-existing.sh" "$B" >/dev/null 2>&1; rc=$?
[ "$rc" -ne 0 ] && [ ! -e "$B/.claude/skills" ]; check $? "adopt refuses a dirty tree"
rm "$B/dirty.txt"

"$P/scripts/adopt-existing.sh" "$B" >/dev/null 2>&1
grep -qx "# Legacy" "$B/CLAUDE.md"; check $? "adopt keeps existing CLAUDE.md"
[ -f "$B/CLAUDE.md.kit-new" ]; check $? "adopt writes CLAUDE.md.kit-new"
grep -q "Bash(npm test)" "$B/.claude/settings.json" && [ -f "$B/.claude/settings.json.kit-new" ]; check $? "adopt keeps existing settings.json"
grep -qx ".env" "$B/.gitignore"; check $? "adopt adds .env to .gitignore"
[ "$(find "$B/.claude/skills" -name SKILL.md | wc -l | tr -d " ")" -eq 10 ]; check $? "adopt installs 10 skills"
[ -x "$B/.claude/hooks/secret-guard.mjs" ] && [ -x "$B/.claude/hooks/activity-log.sh" ]; check $? "adopt makes hooks executable"
! grep -q GENERATION-PROMPT "$B/CLAUDE.md.kit-new"; check $? "kit-new strips generation prompt"

s1=$(snapshot "$B")
"$P/scripts/adopt-existing.sh" --allow-dirty "$B" >/dev/null 2>&1
s2=$(snapshot "$B")
[ "$s1" = "$s2" ]; check $? "adopt is idempotent"

# ---- greenfield ------------------------------------------------------------------
G="$W/new-app"
"$P/scripts/bootstrap-new.sh" --dry-run "$G" >/dev/null 2>&1
[ ! -e "$G" ]; check $? "bootstrap --dry-run creates nothing"

GIT_AUTHOR_NAME=test GIT_AUTHOR_EMAIL=t@example.com GIT_COMMITTER_NAME=test GIT_COMMITTER_EMAIL=t@example.com \
  "$P/scripts/bootstrap-new.sh" --ui --name "Demo & Co" "$G" >/dev/null 2>&1
[ -f "$G/PRD.md" ] && [ -f "$G/CONTRACT.md" ] && [ -f "$G/BUILD_SEQUENCE.md" ] && [ -f "$G/docs/DESIGN_SPEC.md" ]; check $? "bootstrap creates planning docs"
head -1 "$G/CLAUDE.md" | grep -q "Demo & Co"; check $? "bootstrap fills project name"
git -C "$G" log --oneline 2>/dev/null | grep -q "bootstrap project"; check $? "bootstrap makes the first commit (identity from env vars)"
[ -z "$(git -C "$G" status --porcelain)" ]; check $? "bootstrap leaves a clean tree"
! grep -rq GENERATION-PROMPT "$G" --exclude-dir=.git; check $? "bootstrap strips all generation prompts"
grep -qx ".env" "$G/.gitignore"; check $? "bootstrap ignores .env"

s1=$(snapshot "$G")
"$P/scripts/bootstrap-new.sh" --ui "$G" >/dev/null 2>&1
s2=$(snapshot "$G")
[ "$s1" = "$s2" ]; check $? "bootstrap is idempotent (re-run without --name)"

mkdir "$W/occupied"; touch "$W/occupied/file"
"$P/scripts/bootstrap-new.sh" "$W/occupied" >/dev/null 2>&1; rc=$?
[ "$rc" -ne 0 ]; check $? "bootstrap refuses a non-empty foreign dir"

# Regression (Phase 8 audit, High): a foreign repo that merely has .claude/settings.json
# must be refused, and nothing in it may be committed.
F="$W/foreign"; mkdir -p "$F/.claude"
git -C "$F" init -q -b main
printf '{}\n' > "$F/.claude/settings.json"; echo "SECRET=1" > "$F/credentials.txt"
GIT_AUTHOR_NAME=test GIT_AUTHOR_EMAIL=t@example.com GIT_COMMITTER_NAME=test GIT_COMMITTER_EMAIL=t@example.com \
  "$P/scripts/bootstrap-new.sh" "$F" >/dev/null 2>&1; rc=$?
[ "$rc" -ne 0 ] && [ -z "$(git -C "$F" log --oneline 2>/dev/null)" ]; check $? "bootstrap refuses a foreign repo with .claude/settings.json and commits nothing"

# Re-running on a bootstrapped repo with uncommitted user work must refuse.
echo "draft" > "$G/notes.txt"
"$P/scripts/bootstrap-new.sh" "$G" >/dev/null 2>&1; rc=$?
[ "$rc" -ne 0 ] && ! git -C "$G" log --name-only --format= | grep -qx notes.txt; check $? "bootstrap re-run refuses a dirty tree and never commits user files"
rm "$G/notes.txt"

printf '\n%s passed, %s failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
