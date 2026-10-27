---
name: planning-and-task-breakdown
description: >-
  Breaks an approved spec into ordered tasks in that spec. Use after Tam has
  approved docs/specs/<slug>.md and before implementation. Do not use for a
  typo, a single-file fix, or when section 6 is already accepted.
---

# Planning and task breakdown

Turn an approved spec into small tasks with acceptance checks. This phase is read-only: no application code.

On conflict: `AGENTS.md` and `docs/agent-graph-pr.md` win, then rules, then this skill.

## When to use

`docs/specs/<slug>.md` says `approved (Tam, <date>)` and section 6 is empty, or Tam asked to replan.

**Skip:** exempt changes (typo, single file, "fast"), or Tam already accepted the task table.

## Process

1. Read the spec and the code it names (Next.js 15 routes, `src/lib/**`, Drizzle schema under `src/db`). Do not write code.
2. Map dependencies bottom-up: expand the schema → `src/lib` behavior with `tsx --test` → route or UI → contract the old shape in a later change. A migration the previous app cannot read waits for Tam.
3. Slice vertically. One task is one behavior through the layers it needs, not "all tables, then all routes".
4. Write the tasks in **section 6 of that spec**. This repo has no `tasks/todo.md`. Do not create one.
5. Order tasks so each leaves `npm run verify` green (`lint && test && build`). Checkpoint every few tasks. Do auth, child data, and SQLite work early.

Do not replace a spec that still has unchecked tasks for other work. Ask Tam.

### Task row

One task is one thread:

| Task | Acceptance | Verify | Files | Size |
|------|------------|--------|-------|------|
| short title | observable outcome | `npx tsx --test …`, `npm run verify`, URL, or screenshot | paths | S or M |

| Size | Files | Meaning |
|------|-------|---------|
| XS–S | 1–2 | one function, route, or additive migration |
| M | 3–5 | one vertical slice |
| L or XL | 5+ | split before starting |

Split when the title says "and", acceptance needs more than three checks, or the task crosses two subsystems.

Independent slices can be parallel threads. Drizzle migrations and edits to the same SQLite tables stay sequential. Agree the function or route shape before splitting lib and UI work.

## Rationalizations

| Excuse | Reality |
|--------|---------|
| "I'll sort dependencies while coding" | That is how slices land in the wrong order. |
| "The old rows are stale" | Unchecked tasks may be in flight. Ask before replacing them. |
| "One large task is easier" | S and M tasks finish. XL tasks wander. |

## Verification

- [ ] Every task has acceptance, verify, files, and size
- [ ] No task touches more than about 5 files
- [ ] Order is bottom-up and sliced vertically
- [ ] Checkpoints include `npm run verify`
- [ ] Tam has seen the task table before implementation

Adapted from addyosmani/agent-skills (MIT, © Addy Osmani). License: https://github.com/addyosmani/agent-skills/blob/main/LICENSE
