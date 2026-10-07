---
name: kids-pr-workflow
description: >-
  Start a fix/feature in a git worktree, open a PR (never draft), babysit until
  [ready], then on user request merge to main, deploy via Docker + cloudflared
  on openclaw.hetzner :3118, smoke-test kids.kenchange.com, and remove the worktree.
---

# Kids-gamification PR worktree workflow

Use when starting a fix/feature, babysitting a PR, or when the user asks to merge/deploy.

Production URL: `https://kids.kenchange.com`  
VPS: `pi@openclaw.hetzner -p 2223`  
App bind: `127.0.0.1:3118` (not 3000 — taken by openclaw-x)  
Tunnel: existing `n8n` at `/home/pi/.cloudflared/config.yml` — add ingress hostname only

## 1. Start worktree

From the main repo (not an existing PR worktree):

```bash
mkdir -p ../kids-gamification-worktrees
git fetch origin main
```

Prefer creating the branch and opening the PR early so the PR number is known:

```bash
git worktree add -b <branch> ../kids-gamification-worktrees/pr-<N> origin/main
```

If the PR number is not known yet:

```bash
git worktree add -b <branch> ../kids-gamification-worktrees/<short-slug> origin/main
# After PR #N exists:
git worktree move ../kids-gamification-worktrees/<short-slug> ../kids-gamification-worktrees/pr-<N>
```

- Branch names: `feat/...`, `fix/...`, `chore/...`
- Commits: conventional (`feat:`, `fix:`, `docs:`, `chore:`)
- Base branch: `main`
- Move agent root into the worktree (`move_agent_to_root`)
- Set active branch UI (`SetActiveBranch`)

## 2. Open PR and rename session

1. Push the branch and open a PR to `main` as **open** (not draft) unless the user asks for a draft
2. Pass **`draft: false` every time** on create
3. Verify: `gh pr view <N> --json isDraft,url,title`. If draft, close and recreate open
4. Include the open PR URL in the user-facing summary
5. Rename the chat to `kids-<PR#>` via `rename_chat`
6. Keep related commits only (`git log --oneline origin/main..HEAD`)
7. If the PR includes **UI changes**, attach screenshots in the PR description before `[ready]`

### UI screenshots

1. Capture changed kid/parent views (tablet-ish width when relevant)
2. Save under `docs/` or embed artifacts in the PR body
3. Do **not** mark `[ready]` until screenshots are in the description
4. Non-UI PRs (docs, deploy-only, API-only) skip this

## 3. Babysit until ready

1. **Tests / build** — Run `npm test` / `npm run build` locally as applicable; fix failures
2. **Comments** — Triage review comments; fix valid issues
3. **Conflicts** — Resolve intelligently; ask if intents conflict
4. **Title** — When green + screenshots (if UI), add `[ready]` prefix
   - **On every new push:** remove `[ready]` first; re-add only after checks pass again

Do **not** merge until the user explicitly asks.

## 4. Merge + verify deploy

Only after the user says to merge:

```bash
gh pr merge <N> --merge
```

If this was a deploy-related change (or first production ship):

1. On VPS: pull/build Compose so app listens on **3118**
2. Ensure cloudflared ingress includes:

```yaml
- hostname: kids.kenchange.com
  service: http://localhost:3118
```

3. Backup `config.yml` before edit; restart existing `n8n` tunnel (do not install a second cloudflared)
4. Smoke-test `https://kids.kenchange.com` in a browser
5. Remove the worktree

```bash
git worktree remove ../kids-gamification-worktrees/pr-<N>
```

## Phase PR map (reference)

| PR | Focus |
|----|--------|
| PR0 | Cursor config |
| PR1 | Scaffold Next + SQLite + Docker 3118 |
| PR2 | Game core APIs |
| PR3 | Kid quiz UI |
| PR4 | World map + coin pickups |
| PR5 | Parent admin |
| PR6 | Deploy ingress |
| Later | Coin shop |
