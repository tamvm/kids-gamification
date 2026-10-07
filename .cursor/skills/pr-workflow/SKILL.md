---
name: pr-workflow
description: >-
  Start a fix/feature on a branch (optional worktree), open a non-draft PR to main,
  babysit CI and independent review until [ready], then merge only when Tam asks.
---

# kids-gamification PR workflow

Use when starting a fix/feature, babysitting a PR, or when Tam asks to merge.

Graph + shared state: `docs/agent-graph-pr.md`.

## 0. Shared state

Put this block in the PR description at open (update as you go):

```text
acceptance: <1–3 observable outcomes>
layers: none | web | mobile | api
child_data: yes | no
ui_screenshots: yes | n/a
verify: <commands + exit codes / reviewer verdicts>
risks: <privacy, auth, rollback>
```

## 1. Branch / worktree

```bash
mkdir -p ../kids-worktrees
git fetch origin main
git worktree add -b <branch> ../kids-worktrees/pr-<N> origin/main
```

Branch names: `feat/...`, `fix/...`, `chore/...`. Conventional commits.

## 2. Open PR

1. Push and open a PR to `main` as **ready for review** (never draft unless asked).
2. If UI changed: embed screenshots under `## Screenshots` before babysitting to `[ready]`.
3. Set `ui_screenshots: yes` or `n/a` in shared state.

## 3. Babysit until ready

1. Local / inspector verify; run `/verifier` in fresh context.
2. If `child_data: yes` or auth/storage touched → `/security-auditor`.
3. If UI → `/ui-reviewer` + screenshots present.
4. Fix CI failures and actionable review comments.
5. Set `[ready]` only when green. Strip `[ready]` on every new push; re-add when green again.
6. Do **not** merge until Tam explicitly asks.

## 4. Merge

Only after Tam says to merge:

```bash
gh pr merge <N> --merge
```

Deploy path is TBD — note status; do not invent infrastructure.

## 5. Cleanup

```bash
git worktree remove ../kids-worktrees/pr-<N>
```

## Must not

- Finish without a non-draft PR
- Merge without Tam's ask
- Mark UI `[ready]` without screenshots
- Let the implementer self-approve in lieu of `/verifier`
