#!/bin/sh
# Stop hook — at the end of each Claude turn, append one line listing the files that are
# dirty relative to HEAD (cumulative, not per-turn). Tab-separated so names with spaces stay
# readable. Must stay fast (git only, no tests). Never blocks: always exit 0.
# Log: .claude/hook.log (gitignored; trimmed to the last 1000 lines).

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

files=$({ git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard; } \
  | sort -u | tr '\n' '\t')

mkdir -p .claude
printf '%s\tdirty: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${files:-none}" >> .claude/hook.log
if [ "$(wc -l < .claude/hook.log)" -gt 1000 ]; then
  tail -n 1000 .claude/hook.log > .claude/hook.log.tmp && mv .claude/hook.log.tmp .claude/hook.log
fi
exit 0
