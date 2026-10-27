---
name: spec-driven-development
description: >-
  Writes docs/specs/<slug>.md before coding. Use when a feature or multi-file
  change has no Tam-approved spec. Do not use for a typo, a single-file fix,
  or when Tam says "fast".
---

# Spec-driven development

Write `docs/specs/<slug>.md` from `docs/specs/_template.md` before any code. The spec is what we are building, why, and how we know it is done.

On conflict: `AGENTS.md` and `docs/agent-graph-pr.md` win, then `.cursor/rules/`, then this skill.

## When to use

- A feature, or a change across several files, routes, or tables
- Requirements are incomplete, or one ask bundles several independently testable capabilities
- Schema, auth, or child data may change

**Skip:** typo, single-file obvious fix, or Tam says "fast" / "just do it".

## Workflow

`SPECIFY → Tam approves → PLAN → TASKS → IMPLEMENT`

Do not start the next phase in the same turn as the draft spec.

### Phase 0 — Capability map (only if needed)

Skip when the ask is one capability. If acceptance criteria cluster into groups that could ship separately, propose a short map and wait for Tam:

| Module id | Responsibility | Depends on |
|-----------|----------------|------------|
| kebab-id | one capability | — |

Ids stay kebab-case. Dependencies point one way. No cycles. Then one spec per module, `docs/specs/<module-id>.md`, built in dependency order.

### Phase 1 — Specify

State assumptions before filling gaps. This app is Next.js 15 (App Router), React 19, SQLite via `better-sqlite3` and Drizzle. Local DB: `data/app.db`. Docker: `DATABASE_PATH=/data/app.db`. Do not assume Postgres or Prisma.

```
Dev:      npm run dev
Test:     npm run test          # tsx --test, src/lib/**/*.test.ts
Verify:   npm run verify        # lint && test && build
Migrate:  npm run db:migrate
Generate: npm run db:generate
```

Cover the template: goal, stories, scope / non-goals / assumptions, acceptance (each a command, URL, or screenshot), minimal design, boundaries, tests, risks, rollout, open questions.

**Boundaries**

- **Always:** `npm run verify` before the PR; behavior changes under `src/lib/**` get a `tsx --test` file; parameterized Drizzle queries; conventional commits; non-draft PR to `main` (merge commit, do not squash).
- **Ask Tam first:** new tables or columns, dependencies, CI, auth, collecting child data, destructive SQLite changes.
- **Never:** commit secrets; bind the host app to port 3000; delete `/data` or `data/app.db` to fix a migration; skip a failing test; merge unless Tam asks.

Turn a vague goal into a check (`npm run verify` exit 0, `curl -s localhost:3000/api/health`, a named screenshot).

**Stop.** Summarize the spec and open questions. Ask Tam to set `approved (Tam, <date>)`. End the turn. Do not plan or code until a later turn shows that status.

### Later phases

After approval, `planning-and-task-breakdown` fills section 6 of the same spec. Implement with `incremental-implementation` and `test-driven-development`. Put `spec: docs/specs/<slug>.md (approved by Tam <date>)` in the PR shared-state block.

If a decision changes, update the spec first, then the code. Commit the spec with the work.

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "Too simple for a spec" | Exempt work is already listed. Anything else needs acceptance criteria, even if the spec is short. |
| "I'll write it after the code" | That is a note. The spec exists to force clarity before code. |
| "I'll split modules while planning" | Boundaries and build order are decided before the specs, not after. |

## Verification

- [ ] File is `docs/specs/<slug>.md` and follows the template
- [ ] Every acceptance check is a command, URL, or screenshot
- [ ] Boundaries are Always / Ask Tam first / Never
- [ ] Status stays `draft` until Tam approves in a later turn
- [ ] This turn stopped after saving the spec

Adapted from addyosmani/agent-skills (MIT, © Addy Osmani). License: https://github.com/addyosmani/agent-skills/blob/main/LICENSE
