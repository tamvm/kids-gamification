---
name: incremental-implementation
description: >-
  Ships one thin slice, then verifies with npm run verify. Use when a planned
  task touches more than one file. Do not use for a single-file change that is
  already minimal.
---

# Incremental implementation

One slice, then test, verify, and commit. The tree stays buildable between slices.

## When to use

A task in an approved `docs/specs/<slug>.md` that spans more than one file, or a change that would otherwise land as one large edit.

**Skip:** one file and one function, already minimal.

## Cycle

1. Implement the smallest complete behavior.
2. Test it. Behavior under `src/lib/**` follows `test-driven-development` (`npx tsx --test` on that file).
3. `npm run verify` (`lint && test && build`).
4. One conventional commit for that slice.
5. Next slice.

PRs target `main`, open (not draft). History uses a merge commit (`gh pr merge --merge`), not squash. Do not merge until Tam asks.

## Slicing

- **Vertical (default):** Drizzle change if needed, then `src/lib`, then the Next.js 15 route that calls it. Stop when that path works.
- **Risk first:** auth, child data, and SQLite before polish.
- **Contract first:** lock the function or route shape, then split lib and UI.

Migrations are expand/contract. Add a nullable column or new table before code that requires it. Drop the old shape only in a later PR, after the running app no longer reads it. Do not delete `data/app.db` or the Docker `/data` volume.

## Rules

- Simplest thing that works. No new abstraction for a single use. No extra features.
- Edit only the files the task names. Mention unrelated issues; do not fix them here.
- One concern per commit. Do not mix a refactor, a migration, and UI.
- Existing tests stay green after every slice.
- Incomplete user-visible behavior stays off unless Tam asked. New behavior defaults to the safe option.
- A slice can be reverted on its own. Additive schema rolls back more cleanly than a drop.

## Red flags

- A large edit before `npm run test`
- Drive-by refactors
- A red build between commits
- A migration the previous deploy cannot read
- Re-running `npm run verify` when nothing changed since the last green run

## Verification

- [ ] Each slice has its own commit and a green `npm run verify`
- [ ] Spec acceptance checks hold
- [ ] The branch has no leftover uncommitted work

Adapted from addyosmani/agent-skills (MIT, © Addy Osmani). License: https://github.com/addyosmani/agent-skills/blob/main/LICENSE
