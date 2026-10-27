---
name: test-driven-development
description: >-
  Red-green-refactor for src/lib with tsx --test. Use when changing behavior
  under src/lib or fixing a bug (Prove-It: failing test first). Do not use for
  docs, config, copy, or a change with no behavior.
---

# Test-driven development

Write a failing test before the code that passes it. For a bug, reproduce it with a test before touching the fix. "Seems right" is not done.

## When to use

Behavior under `src/lib/**`, a bug, or any change that can break existing behavior — including a function pasted in chat with no mention of tests.

**Skip:** docs, agent rules, CI, static copy, and config with no behavior.

## Commands

From `package.json`. Do not assume Jest or Vitest.

```
npm run test    # tsx --test on the src/lib/learn/*.test.ts paths in the script
npm run verify  # lint && test && build
```

Colocate tests as `src/lib/**/<name>.test.ts` using `node:test` (`describe` / `it`) and `node:assert/strict`, same as `src/lib/learn/*.test.ts`. Add a new file's path to the `test` script or `npm run test` will not run it. Loop on one file:

```
npx tsx --test src/lib/<area>/<name>.test.ts
```

Run `npm run verify` before the PR. Do not re-run a command that just passed if the code has not changed.

## Cycle

`RED (fails) → GREEN (minimal code) → REFACTOR (still green)`

A test that passes immediately proves nothing. Assert outcomes, not which helpers were called. Prefer the real function; mock only a slow or non-deterministic edge. Arrange, act, assert. One behavior per `it`. A little duplication is fine when each test reads alone. The test name states the behavior.

### Prove-It (bugs)

1. Add a `src/lib/**/*.test.ts` case that fails on current code.
2. Confirm the failure is the bug.
3. Apply the smallest fix.
4. The test passes, then `npm run verify`.

Do not start from the fix.

Most tests are pure `src/lib` functions (no network). Follow a neighbor if a test already uses a temp SQLite file. There is no E2E runner; a route change still needs `curl` or a browser check recorded on the PR.

## Red flags

- Library code before a failing test
- A bug fix with no reproduction test
- Skipping or editing a test only to go green
- Testing Next.js or Drizzle instead of our behavior

## Verification

- [ ] New `src/lib` behavior has a colocated test that failed first
- [ ] Bug fixes use Prove-It
- [ ] `npm run verify` exit 0
- [ ] No test skipped

Adapted from addyosmani/agent-skills (MIT, © Addy Osmani). License: https://github.com/addyosmani/agent-skills/blob/main/LICENSE
