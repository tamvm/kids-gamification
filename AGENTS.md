# AGENTS.md

Agent behavior for **kids-gamification**. Read this first, then `docs/agent-graph-pr.md`.

## Behavior

- Challenge unsafe, wrong, or incomplete premises before coding.
- Keep diffs surgical. Prefer reuse over rebuild.
- On non-trivial work, run a brief scope challenge (`.cursor/rules/engineering-discipline.mdc`).
- When stuck on design thrash, use `.cursor/skills/problem-solving/SKILL.md`.
- Non-trivial PRs follow `docs/agent-graph-pr.md`: research → implement → **independent** verify → human merge.
- Typo / single-file obvious fixes stay a single loop.

## Cursor Cloud / PR rules

**Every update opens a PR:** Push a feature branch and open an open (non-draft) PR for every code, docs, or agent-rules change. Details: `.cursor/rules/pr-workflow.mdc` and `.cursor/skills/pr-workflow/SKILL.md`.

**PRs must not be draft:** Always open as ready for review unless Tam explicitly asks for draft.

**UI screenshots in PR body:** If the PR changes user-visible UI, embed screenshots in the PR description before marking `[ready]`. Set `ui_screenshots: yes` in the shared-state block.

**Babysit until `[ready]`:** Wait until required checks pass and actionable review comments are resolved; then prefix the title with `[ready]`. On every new push, strip `[ready]` first and only re-add when green again. Do not merge until Tam explicitly asks.

**Independent review:** Before `[ready]` on non-trivial or `child_data: yes` work, run fresh-context reviewers:
- `/verifier`
- `/security-auditor` when auth, storage, APIs, or child data are touched
- `/ui-reviewer` when UI changes

Builder must not self-approve. Cap build↔review loops (~2); escalate remaining blockers to Tam.

## Stack / verify

Stack is **TBD** (repo started as an empty shell). When code lands, update this table and add `./scripts/agent-verify.sh`.

| Surface | Dir | Run | Test | Lint/Build |
|---------|-----|-----|------|------------|
| TBD | — | — | — | — |

Until then: verify by inspection + reviewer agents; do not claim "tests pass" without commands.

## Related

- `.cursor/agents/` — verifier, security-auditor, ui-reviewer
- `.cursor/rules/engineering-discipline.mdc`
- `.cursor/rules/pr-workflow.mdc`
- `docs/agent-graph-pr.md`
