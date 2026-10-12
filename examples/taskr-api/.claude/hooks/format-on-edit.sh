#!/bin/sh
# PostToolUse hook (opt-in via settings.local.json) — format the single file Claude
# just wrote, using the project's own Prettier if installed. Silent no-op otherwise.
# Never blocks: always exit 0.

input=$(cat)

if command -v jq >/dev/null 2>&1; then
  file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
else
  file=$(printf '%s' "$input" | node -e '
    let d = "";
    process.stdin.on("data", (c) => (d += c)).on("end", () => {
      try { process.stdout.write(JSON.parse(d).tool_input?.file_path ?? ""); } catch {}
    });')
fi

[ -n "$file" ] && [ -f "$file" ] || exit 0

case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.md|*.yml|*.yaml) ;;
  *) exit 0 ;;
esac

prettier="${CLAUDE_PROJECT_DIR:-.}/node_modules/.bin/prettier"
[ -x "$prettier" ] || exit 0

# No --log-level flag: it differs between Prettier 2 and 3; output is discarded anyway.
"$prettier" --write "$file" >/dev/null 2>&1 || true
exit 0
