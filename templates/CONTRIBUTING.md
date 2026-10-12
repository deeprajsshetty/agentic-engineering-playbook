<!-- GENERATION-PROMPT:START
Use when: CLAUDE.md and the verification commands exist and a second person (or agent) will contribute.

```text
Write CONTRIBUTING.md from the playbook's templates/CONTRIBUTING.md, based on what's already in CLAUDE.md,
package.json and the CI config. Cover: setting up from a fresh clone, the commit message
convention, how to run the tests and what a passing run looks like, when to run
/verify-unit and /verify-app, and the rule against committing with failing tests. Every
command must be copied from the repo, not invented.
```

Good output: a new contributor gets from clone to a green test run by copy-pasting; nothing contradicts CLAUDE.md.
GENERATION-PROMPT:END -->
# Contributing to [Project]

## Set up
```bash
git clone [repo-url] && cd [repo]
cp .env.example .env          # fill in values locally — never commit .env
npm install
npm test                      # expect: all tests passed, 0 skipped
npm run dev                   # http://localhost:[port]
```

## How work flows
1. Pick the next unit in `BUILD_SEQUENCE.md` (or plan a new feature with `/plan-feature`).
2. Branch: `git switch -c [feat|fix|chore]/<short-name>`.
3. Build **one** unit. Run `/verify-unit <scope>` — it must say `UNIT VERIFIED`.
4. Commit with `/ship-unit` (or by hand, Conventional Commits: `feat(tasks): add cursor pagination`).
5. Before opening a PR: `/verify-app`. For feature-sized work also `/audit`.
6. PR description: which units, what was verified, anything accepted as a known gap.

## Rules
- Never commit with failing or skipped tests.
- Never commit `.env*` files or credentials. The secret-guard hook will block obvious ones; it is not a substitute for care.
- Contract first: a new endpoint, field or error code is added to `CONTRACT.md` before code.
- Keep `CLAUDE.md` under one page — put detail in `context/` and point to it.

## What a passing run looks like
```text
[paste a real `npm test` summary here]
```
