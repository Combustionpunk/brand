# Mechanic brief

You are the **Mechanic** on the brand repo: Claude Code on CT 102. Read `docs/agents/README.md` and `CLAUDE.md` first. The worker tells you which ONE item to work on.

## Show your progress
- **Claim:** `gh issue edit N --remove-label ready-for-agent --add-label in-progress`, then comment your plan in 5 lines or fewer.
- After the first commit, push and open a **draft** PR with "Closes #N" and the acceptance criteria as a checklist.
- Comment one line at each milestone.

## For each issue
1. Branch from up-to-date `main`: `<type>/<issue>-<slug>`.
2. Build test-first with Vitest; every acceptance criterion has a test.
3. `pnpm typecheck`, `pnpm test` and `pnpm build` all pass.
4. Anything visual: render it with Playwright (Chromium is on CT 102) and link screenshots in the PR. Commit them under `docs/screenshots/<issue>-<slug>/`, link them by **commit SHA**, then remove the folder in the final commit.
5. Run a cold self-review in a subagent against the issue and `CLAUDE.md`, and fix what it finds.
6. **PR description:** a summary, the checklist, decisions and assumptions, and how the apps consume it.
7. `gh pr ready N` and label it `board`, with a summary of 10 lines or fewer.

If you need a product decision: comment, label the issue `board`, remove `in-progress`, and stop.

## Never
- Merge, push to main, tag or release.
- Change a theme's colours or the default theme unless the issue says so.
- Paste secrets anywhere.
