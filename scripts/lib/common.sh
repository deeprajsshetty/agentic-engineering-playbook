# shellcheck shell=sh
# Shared helpers for bootstrap-new.sh, adopt-existing.sh and doctor.sh.
# POSIX sh. Source with:  . "$PLAYBOOK_ROOT/scripts/lib/common.sh"
#
# Callers must set PLAYBOOK_ROOT and DRY_RUN (0|1) before using copy/write helpers.

CREATED=0
SKIPPED=0
CONFLICTS=0
CONFLICT_LIST=""
CREATED_PATHS=""   # newline-separated absolute paths created by place_file (for precise staging)

if [ -t 1 ]; then
  C_RESET=$(printf '\033[0m'); C_GREEN=$(printf '\033[32m'); C_YELLOW=$(printf '\033[33m'); C_RED=$(printf '\033[31m'); C_DIM=$(printf '\033[2m')
else
  C_RESET=""; C_GREEN=""; C_YELLOW=""; C_RED=""; C_DIM=""
fi

info() { printf '%s\n' "$*"; }
ok()   { printf '%s✔%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
note() { printf '%s•%s %s\n' "$C_DIM" "$C_RESET" "$*"; }
warn() { printf '%s!%s %s\n' "$C_YELLOW" "$C_RESET" "$*" >&2; }
die()  { printf '%s✘%s %s\n' "$C_RED" "$C_RESET" "$*" >&2; exit 1; }

dry_prefix() { [ "${DRY_RUN:-0}" -eq 1 ] && printf '[dry-run] ' || true; }

# Remove the <!-- GENERATION-PROMPT:START ... GENERATION-PROMPT:END --> block from a template.
strip_generation_prompt() {
  awk '/GENERATION-PROMPT:START/ { skip = 1 } !skip { print } /GENERATION-PROMPT:END/ { skip = 0 }' "$1"
}

# Escape a string for use as a sed replacement (handles \ & and the | delimiter).
sed_escape() { printf '%s' "$1" | sed -e 's/[\\&|]/\\&/g'; }

# render_template <template> <dest-tmp> <project-name>
render_template() {
  _name=$(sed_escape "$3")
  _today=$(date '+%Y-%m-%d')
  strip_generation_prompt "$1" | sed -e "s|{{PROJECT_NAME}}|$_name|g" -e "s|{{DATE}}|$_today|g" > "$2"
}

# place_file <source> <dest>
# Never overwrites. Identical → skip. Different → write <dest>.kit-new (unless an
# identical .kit-new is already there) and record the conflict.
place_file() {
  _src=$1; _dst=$2
  if [ -e "$_dst" ]; then
    if cmp -s "$_src" "$_dst"; then
      SKIPPED=$((SKIPPED + 1)); note "unchanged  ${_dst#"$TARGET"/}"
      return 0
    fi
    _new="$_dst.kit-new"
    CONFLICTS=$((CONFLICTS + 1)); CONFLICT_LIST="$CONFLICT_LIST ${_dst#"$TARGET"/}"
    if [ -e "$_new" ] && cmp -s "$_src" "$_new"; then
      note "conflict   ${_dst#"$TARGET"/} (kit version already in .kit-new)"
      return 0
    fi
    if [ -e "$_new" ]; then
      # An existing, different .kit-new may be the user's in-progress merge — never clobber it.
      warn "conflict   ${_dst#"$TARGET"/}: ${_new#"$TARGET"/} exists and differs — left untouched; delete it and re-run to get the current kit version"
      return 0
    fi
    warn "$(dry_prefix)conflict   ${_dst#"$TARGET"/} exists and differs → writing ${_new#"$TARGET"/}"
    [ "${DRY_RUN:-0}" -eq 1 ] || cp -p "$_src" "$_new"
    return 0
  fi
  ok "$(dry_prefix)create     ${_dst#"$TARGET"/}"
  CREATED=$((CREATED + 1))
  if [ "${DRY_RUN:-0}" -eq 0 ]; then
    mkdir -p "$(dirname "$_dst")"
    cp -p "$_src" "$_dst"
    CREATED_PATHS="$CREATED_PATHS
$_dst"
  fi
}

# place_tree <source-dir> <dest-dir> — place_file for every file under source-dir.
place_tree() {
  _list=$(mktemp)
  (cd "$1" && find . -type f ! -name '.DS_Store' | sort) > "$_list"
  while IFS= read -r _rel; do
    _rel=${_rel#./}
    place_file "$1/$_rel" "$2/$_rel"
  done < "$_list"
  rm -f "$_list"
}

# place_rendered <template> <dest> <project-name> — render (strip prompt, fill placeholders) then place.
place_rendered() {
  _tmp=$(mktemp)
  render_template "$1" "$_tmp" "$3"
  place_file "$_tmp" "$2"
  rm -f "$_tmp"
}

# ensure_gitignore_lines <gitignore> <lines-file> — append only the lines that are missing.
ensure_gitignore_lines() {
  _gi=$1; _added=0
  [ -e "$_gi" ] || { [ "${DRY_RUN:-0}" -eq 1 ] || : > "$_gi"; }
  while IFS= read -r _line; do
    [ -z "$_line" ] && continue
    if [ -e "$_gi" ] && grep -qxF -- "$_line" "$_gi"; then continue; fi
    case $_line in \#*) [ "$_added" -eq 0 ] && _header=$_line; continue ;; esac
    if [ "$_added" -eq 0 ]; then
      [ "${DRY_RUN:-0}" -eq 1 ] || printf '\n%s\n' "${_header:-# --- agentic kit ---}" >> "$_gi"
    fi
    _added=$((_added + 1))
    ok "$(dry_prefix).gitignore += $_line"
    [ "${DRY_RUN:-0}" -eq 1 ] || printf '%s\n' "$_line" >> "$_gi"
  done < "$2"
  [ "$_added" -eq 0 ] && note "unchanged  .gitignore (all kit entries present)"
  return 0
}

# json_valid <file> — jq, else node, else python3.
json_valid() {
  if command -v jq >/dev/null 2>&1; then jq empty "$1" >/dev/null 2>&1
  elif command -v node >/dev/null 2>&1; then node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$1" >/dev/null 2>&1
  elif command -v python3 >/dev/null 2>&1; then python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$1" >/dev/null 2>&1
  else return 2
  fi
}

make_hooks_executable() {
  for _h in "$1"/.claude/hooks/*.sh "$1"/.claude/hooks/*.mjs; do
    [ -e "$_h" ] || continue
    [ -x "$_h" ] && continue
    ok "$(dry_prefix)chmod +x   ${_h#"$1"/}"
    [ "${DRY_RUN:-0}" -eq 1 ] || chmod +x "$_h"
  done
}

print_summary() {
  info ""
  info "Summary: $CREATED created · $SKIPPED unchanged · $CONFLICTS conflict(s)"
  if [ "$CONFLICTS" -gt 0 ]; then
    info "Conflicts (your file was kept; kit version saved alongside as <file>.kit-new):"
    for _c in $CONFLICT_LIST; do info "  - $_c  →  merge from $_c.kit-new, then delete the .kit-new"; done
  fi
}
