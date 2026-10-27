# Spec: <title>

**Status:** draft | approved (Tam, YYYY-MM-DD) | superseded

**Flags**

- child_data: yes | no
- layers: none | web | mobile | api
- ui: yes | no

## 1. Goal

What we are building, for whom, and what done looks like. One short paragraph.

## 2. User stories

- As a <parent|child>, I want <action> so that <outcome>.

## 3. Scope / non-goals / assumptions

**In scope**

- 

**Non-goals**

- 

**Assumptions** (correct these before approval)

- Next.js 15 App Router, React 19, SQLite via Drizzle (`data/app.db` local, `/data/app.db` in Docker).
- 

## 4. Acceptance criteria

Each row is checkable with a command, a URL, or a screenshot.

| # | Criterion | Check |
|---|-----------|-------|
| 1 | | `npm run verify` exit 0 / `curl -s localhost:3000/api/health` / screenshot |

## 5. Minimal design

**Reuse:** existing modules, routes, and Drizzle tables to extend (name them). Do not add a second stack.

**Files / routes / tables**

| Path or table | Change |
|---------------|--------|
| | |

**Migration:** expand/contract only. Expand (nullable column or new table) before code that depends on it. Contract (drop old shape) in a later change, after the running app no longer reads it. Do not delete the SQLite file.

**Boundaries**

- **Always:** `npm run verify` (`lint && test && build`); `tsx --test` for `src/lib/**` behavior; conventional commits; non-draft PR to `main` (merge commit, do not squash).
- **Ask Tam first:** new tables or columns, dependencies, CI, auth, new child data, destructive SQL.
- **Never:** secrets in git; host port 3000; wiping `/data` or `data/app.db`; merging without Tam.

## 6. Plan & tasks

One row is one thread. Fill this after Tam approves the sections above.

| Task | Acceptance | Verify | Files | Size |
|------|------------|--------|-------|------|
| | | | | S / M |

**Checkpoints:** `npm run verify` exit 0. UI: screenshot. Child data or auth: `/security-auditor` and `/verifier`.

## 7. Test plan

- `src/lib/**`: failing `node:test` via `npx tsx --test <file>` first, then `npm run test`.
- Route or health: `curl` or browser.
- `npm run verify` before the PR.

## 8. Risks

- **Child privacy:** what is collected, why, who can read it, what is logged.
- **Auth:** who is allowed to call the route.
- **SQLite data loss:** migration expand/contract, volume `/data` kept on rollback.

## 9. Rollout & rollback

Ship on the non-draft PR. After Tam asks to merge, deploy is Coolify (container `:3000`, host **3118**, volume `/data`). Rollback: `git revert -m 1` the merge commit and redeploy the previous release. Do not delete `/data`. Schema must still be readable by the previous app until the contract PR.

## 10. Open questions

- 
