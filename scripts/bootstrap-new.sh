#!/bin/sh
# bootstrap-new.sh — scaffold a NEW project (greenfield) with the agentic kit and planning docs.
#
#   scripts/bootstrap-new.sh [--dry-run] [--ui] [--name NAME] TARGET_DIR
#
#   --ui        also create docs/DESIGN_SPEC.md, docs/DESIGN_STANDARD.md, docs/MOTION_BRIEF.md
#   --name      project name used in CLAUDE.md (default: the directory name)
#
# Creates TARGET_DIR (must be new or empty, or a previous bootstrap of the same project,
# identified by .claude/.kit-bootstrap), runs git init, copies the kit, creates planning
# docs from templates, and commits ONLY the files it created. Idempotent: re-running on a
# clean bootstrapped directory adds only what is missing.
set -eu

PLAYBOOK_ROOT=$(cd "$(dirname "$0")/.." && pwd)
# shellcheck source=scripts/lib/common.sh
. "$PLAYBOOK_ROOT/scripts/lib/common.sh"

DRY_RUN=0
WITH_UI=0
NAME=""
TARGET=""

usage() {
  sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'
  exit "${1:-0}"
}

while [ $# -gt 0 ]; do
  case $1 in
    --dry-run) DRY_RUN=1 ;;
    --ui) WITH_UI=1 ;;
    --name) [ $# -ge 2 ] || die "--name needs a value"; NAME=$2; shift ;;
    -h|--help) usage 0 ;;
    -*) warn "unknown option: $1"; usage 1 ;;
    *) [ -z "$TARGET" ] || die "only one target directory allowed"; TARGET=$1 ;;
  esac
  shift
done

[ -n "$TARGET" ] || { warn "TARGET_DIR is required"; usage 1; }

# 1. Target directory ----------------------------------------------------------
if [ -e "$TARGET" ]; then
  [ -d "$TARGET" ] || die "$TARGET exists and is not a directory"
  TARGET=$(cd "$TARGET" && pwd)
  if [ -n "$(ls -A "$TARGET")" ] && [ ! -f "$TARGET/.claude/.kit-bootstrap" ]; then
    die "$TARGET is not empty and was not bootstrapped by this script. For an existing project use scripts/adopt-existing.sh."
  fi
  RERUN=1
  if [ -d "$TARGET/.git" ] && [ -n "$(git -C "$TARGET" status --porcelain)" ]; then
    die "$TARGET has uncommitted changes. Commit or stash them before re-running bootstrap."
  fi
else
  RERUN=0
  if [ "$DRY_RUN" -eq 0 ]; then
    mkdir -p "$TARGET"
    TARGET=$(cd "$TARGET" && pwd)
  else
    TARGET=$(cd "$(dirname "$TARGET")" 2>/dev/null && pwd)/$(basename "$TARGET")
  fi
fi
[ "$TARGET" != "$PLAYBOOK_ROOT" ] || die "refusing to bootstrap into the playbook repo itself"

# On a re-run without --name, reuse the name the first run wrote into CLAUDE.md so
# rendered files stay identical (and no spurious .kit-new conflicts appear).
if [ -z "$NAME" ] && [ -f "$TARGET/CLAUDE.md" ]; then
  NAME=$(sed -n '1s/^# CLAUDE\.md — //p' "$TARGET/CLAUDE.md")
fi
NAME=${NAME:-$(basename "$TARGET")}
info "Bootstrapping '$NAME' in: $TARGET"
[ "$DRY_RUN" -eq 1 ] && info "(dry run — nothing will be written)"
[ "$RERUN" -eq 1 ] && note "existing bootstrap detected — only missing files will be added"
info ""

# 2. git -------------------------------------------------------------------------
if [ -d "$TARGET/.git" ]; then
  note "git already initialised"
else
  ok "$(dry_prefix)git init (branch main)"
  if [ "$DRY_RUN" -eq 0 ]; then
    # `git init -b` needs git ≥ 2.28; fall back to renaming the unborn branch.
    git -C "$TARGET" init -q -b main 2>/dev/null \
      || { git -C "$TARGET" init -q && git -C "$TARGET" symbolic-ref HEAD refs/heads/main; }
  fi
fi

# 3. Kit -------------------------------------------------------------------------
place_tree "$PLAYBOOK_ROOT/kit/.claude" "$TARGET/.claude"
place_tree "$PLAYBOOK_ROOT/kit/context" "$TARGET/context"
place_file "$PLAYBOOK_ROOT/kit/.env.example" "$TARGET/.env.example"
place_file "$PLAYBOOK_ROOT/kit/.worktreeinclude.example" "$TARGET/.worktreeinclude.example"
make_hooks_executable "$TARGET"

# Marker that identifies this directory as bootstrapped (fixed content keeps re-runs idempotent).
marker=$(mktemp)
printf '%s
' "Bootstrapped by agentic-engineering-playbook (scripts/bootstrap-new.sh). Safe to delete after setup." > "$marker"
place_file "$marker" "$TARGET/.claude/.kit-bootstrap"
rm -f "$marker"

# 4. Planning documents from templates (generation prompts stripped) --------------
T="$PLAYBOOK_ROOT/templates"
place_rendered "$T/CLAUDE.md.template" "$TARGET/CLAUDE.md" "$NAME"
for doc in PRD CONTRACT BUILD_SEQUENCE AUDIT_LOG CONTRIBUTING; do
  place_rendered "$T/$doc.md" "$TARGET/$doc.md" "$NAME"
done
place_rendered "$T/ADR.md" "$TARGET/docs/adr/0000-template.md" "$NAME"
if [ "$WITH_UI" -eq 1 ]; then
  for doc in DESIGN_SPEC DESIGN_STANDARD MOTION_BRIEF; do
    place_rendered "$T/$doc.md" "$TARGET/docs/$doc.md" "$NAME"
  done
fi

readme=$(mktemp)
cat > "$readme" <<EOF
# $NAME

> Bootstrapped with the [agentic engineering playbook](https://github.com/deeprajsshetty/agentic-engineering-playbook).

## Planning documents
| File | Job |
|---|---|
| [PRD.md](PRD.md) | What we're building, for whom, and what success means |
| [CONTRACT.md](CONTRACT.md) | Endpoints, shapes, typed errors, acceptance criteria |
| [BUILD_SEQUENCE.md](BUILD_SEQUENCE.md) | Ordered atomic units and what "verified" means |
| [CLAUDE.md](CLAUDE.md) | Standing orders for Claude Code |

See [CONTRIBUTING.md](CONTRIBUTING.md) to get started.
EOF
place_file "$readme" "$TARGET/README.md"
rm -f "$readme"

# 5. .gitignore --------------------------------------------------------------------
info ""
gi_lines=$(mktemp)
{ cat "$PLAYBOOK_ROOT/kit/gitignore.additions"; printf '%s\n' "node_modules/" "dist/" "coverage/" ".DS_Store"; } > "$gi_lines"
ensure_gitignore_lines "$TARGET/.gitignore" "$gi_lines"
rm -f "$gi_lines"

# 6. First commit --------------------------------------------------------------------
print_summary
info ""
if [ "$DRY_RUN" -eq 1 ]; then
  note "[dry-run] would commit: chore: bootstrap project from agentic-engineering-playbook"
elif [ -z "$CREATED_PATHS" ] && [ -z "$(git -C "$TARGET" status --porcelain -- .gitignore)" ]; then
  note "nothing to commit"
elif ! git -C "$TARGET" var GIT_COMMITTER_IDENT >/dev/null 2>&1; then
  warn "no git identity (user.name/user.email) — skipping the commit. Set one, then commit the files listed above."
else
  # Stage exactly what this script created or changed — never `git add -A`.
  printf '%s\n' "$CREATED_PATHS" | while IFS= read -r p; do
    [ -n "$p" ] && git -C "$TARGET" add -- "$p"
  done
  git -C "$TARGET" add -- .gitignore
  if [ "$RERUN" -eq 1 ]; then msg="chore: add missing kit files from agentic-engineering-playbook"; else msg="chore: bootstrap project from agentic-engineering-playbook"; fi
  git -C "$TARGET" commit -q -m "$msg"
  ok "committed: $msg ($(git -C "$TARGET" rev-parse --short HEAD))"
fi

cat <<EOF

Next steps (docs/11-greenfield-kickoff.md):
  1. Discovery + PRD in a Claude.ai Project (prompts/plan, templates/PRD.md) → replace PRD.md.
  2. cd "$TARGET" && claude --add-dir "$PLAYBOOK_ROOT" --permission-mode plan
       → fill CONTRACT.md, then BUILD_SEQUENCE.md (generation prompts: $PLAYBOOK_ROOT/templates/).
  3. Add the stack by hand, then fill CLAUDE.md (stack, Commands section).
     (Framework generators refuse non-empty folders: generate first, then use adopt-existing.sh.)
  4. Build unit 1 → /verify-unit → /ship-unit. Repeat.
  5. Health check:  $PLAYBOOK_ROOT/scripts/doctor.sh "$TARGET"
EOF
