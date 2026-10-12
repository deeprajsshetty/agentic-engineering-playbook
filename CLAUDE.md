# CLAUDE.md — agentic-engineering-playbook

## What this is
A public documentation + tooling repo: a lifecycle-ordered playbook for agentic engineering with Claude, a copy-paste reference, and a drop-in kit (`kit/`, `plugin/`, `scripts/`) applied to other repos. The worked example in `examples/taskr-api/` is the only application code.

## Stack and constraints
- Markdown docs; Bash/POSIX-sh scripts (must pass `shellcheck`); JSON config (must pass `jq empty`).
- `examples/taskr-api`: Node 22+, TypeScript strict, Express, Vitest + supertest. No other runtime code in the repo.
- No secrets anywhere. `.env` is ignored; `.env.example` files have empty values.

## Standing orders
- **Verify before you write.** Every command, flag, settings key, hook event or path must match the current Claude Code docs (https://code.claude.com/docs). If it cannot be confirmed, keep it only with the marker `⚠️ Verify: course-described, not confirmed in current docs`.
- **Never copy course text verbatim.** Condense and reorganise; credit lives in `sources/README.md`.
- **Lifecycle docs use the fixed 8-part structure:** Goal · Which surface · Inputs → Outputs · Steps · Verified when… · Three Standards check · Common mistakes · Course reference.
- **Prompts go in fenced blocks**, ready to copy, with `[bracketed]` placeholders.
- **Kit files are generic.** Anything specific to one project belongs in `examples/`, not `kit/`.
- **One phase or unit = one conventional commit** (`feat:`, `docs:`, `chore:`, `fix:`, `test:`, `ci:`). Run the checks below first.

## Checks before every commit
```bash
find . -name '*.json' -not -path '*/node_modules/*' -print0 | xargs -0 -n1 jq empty
shellcheck -x scripts/*.sh scripts/lib/*.sh kit/.claude/hooks/*.sh
scripts/test-hooks.sh && scripts/test-scripts.sh
lychee --offline --include-fragments --no-progress --exclude-path node_modules './**/*.md'
(cd examples/taskr-api && npx tsc --noEmit && npx vitest run)
```

## Where things are
| Need | Read |
|---|---|
| What is being built, in what order | `BUILD_SEQUENCE.md` |
| Step-by-step onboarding for newcomers | `docs/BEGINNERS-GUIDE.md` |
| Page map and lifecycle | `README.md`, `docs/README.md` |
| Course attribution / module map | `sources/README.md` |
| Audit findings and resolutions | `AUDIT_LOG.md` |
