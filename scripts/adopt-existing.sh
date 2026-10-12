#!/bin/sh
# adopt-existing.sh — apply the agentic kit to an EXISTING repository (brownfield).
#
#   scripts/adopt-existing.sh [--dry-run] [--allow-dirty] [TARGET_DIR]
#
# Never overwrites a file. If a kit file already exists with different content, the
# kit version is written next to it as <file>.kit-new and listed at the end.
# Idempotent: running it twice changes nothing the second time.
set -eu

PLAYBOOK_ROOT=$(cd "$(dirname "$0")/.." && pwd)
# shellcheck source=scripts/lib/common.sh
. "$PLAYBOOK_ROOT/scripts/lib/common.sh"

DRY_RUN=0
ALLOW_DIRTY=0
TARGET=""

usage() {
  sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

while [ $# -gt 0 ]; do
  case $1 in
    --dry-run) DRY_RUN=1 ;;
    --allow-dirty) ALLOW_DIRTY=1 ;;
    -h|--help) usage 0 ;;
    -*) warn "unknown option: $1"; usage 1 ;;
    *) [ -z "$TARGET" ] || die "only one target directory allowed"; TARGET=$1 ;;
  esac
  shift
done

TARGET=${TARGET:-.}
[ -d "$TARGET" ] || die "target directory not found: $TARGET"
TARGET=$(cd "$TARGET" && pwd)
[ "$TARGET" != "$PLAYBOOK_ROOT" ] || die "refusing to adopt the kit into the playbook repo itself"

info "Adopting agentic kit into: $TARGET"
[ "$DRY_RUN" -eq 1 ] && info "(dry run — nothing will be written)"
info ""

# 1. Safe baseline ------------------------------------------------------------
git -C "$TARGET" rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || die "$TARGET is not a git repository. Run 'git init' and commit first — the kit relies on git for rollback."

if [ -n "$(git -C "$TARGET" status --porcelain)" ]; then
  if [ "$ALLOW_DIRTY" -eq 1 ]; then
    warn "working tree has uncommitted changes (continuing because of --allow-dirty)"
  else
    die "working tree has uncommitted changes. Commit or stash them first (or pass --allow-dirty) so the kit lands as its own reviewable change."
  fi
fi

branch=$(git -C "$TARGET" branch --show-current 2>/dev/null || true)
case $branch in
  main|master|trunk|develop)
    warn "you are on '$branch'. Recommended: git -C \"$TARGET\" switch -c chore/adopt-agentic-kit" ;;
  *) note "branch: ${branch:-detached}" ;;
esac
info ""

# 2. Copy the kit (never overwrite) -------------------------------------------
place_tree "$PLAYBOOK_ROOT/kit/.claude" "$TARGET/.claude"
place_tree "$PLAYBOOK_ROOT/kit/context" "$TARGET/context"
place_file "$PLAYBOOK_ROOT/kit/.env.example" "$TARGET/.env.example"
place_file "$PLAYBOOK_ROOT/kit/.worktreeinclude.example" "$TARGET/.worktreeinclude.example"

# CLAUDE.md: only seed it if the repo has none; otherwise offer the template as .kit-new.
project_name=$(basename "$TARGET")
place_rendered "$PLAYBOOK_ROOT/templates/CLAUDE.md.template" "$TARGET/CLAUDE.md" "$project_name"

make_hooks_executable "$TARGET"

# 3. .gitignore ----------------------------------------------------------------
info ""
ensure_gitignore_lines "$TARGET/.gitignore" "$PLAYBOOK_ROOT/kit/gitignore.additions"

if git -C "$TARGET" ls-files --error-unmatch .env >/dev/null 2>&1; then
  warn ".env is TRACKED by git. Remove it from the index (git rm --cached .env), rotate every secret it contained, and commit."
fi

# 4. Report --------------------------------------------------------------------
print_summary

cat <<EOF

Next steps (docs/10-brownfield-adoption.md):
  1. Review:        git -C "$TARGET" status && git -C "$TARGET" diff
  2. In Claude Code (inside $TARGET):
       /init            # if CLAUDE.md is still the unfilled template
       /onboard-repo    # maps the repo, drafts CLAUDE.md + context/ files, lists risks
  3. Back-fill a lightweight CONTRACT.md for existing APIs (templates/CONTRACT.md).
  4. Record a test baseline: npm test  → paste the summary into CONTRIBUTING.md.
  5. Prove the loop with one small unit: /verify-unit → /ship-unit → open a PR.
  6. Health check:  $PLAYBOOK_ROOT/scripts/doctor.sh "$TARGET"
EOF
