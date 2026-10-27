---
name: interview-me
description: >-
  One question at a time, only when requirements are ambiguous. Use when who,
  why, or success is missing and no approved spec exists. Do not use when the
  ask is clear, Tam says "fast", or the edit is a typo or a single file.
---

# Interview me

Use only when the ask is ambiguous — missing who it is for, why now, or what success is — and guessing would invent them. A clear ask goes to `spec-driven-development`, or straight to the edit if it is exempt.

Tam has to be in the conversation. On a non-interactive run, report the gap and stop. Do not interview yourself.

## When not to use

- Outcome, user, and the done-check are already stated
- Tam says "fast" / "just do it"
- Typo, rename, format, or a single-file fix
- A question about how the code works
- You can already predict Tam's answers to the next three questions

## Process

1. **Hypothesis.** One sentence and a confidence number (0–100). Below ~70%, say what is still missing.
2. **One question, plus a guess.** Then wait.
   ```
   Q: one question
   GUESS: your answer, and why
   ```
   Do not send a list of questions.
3. **Want versus should.** If the reply is "scalable", "clean architecture", or "the usual way", ask what Tam would want with nobody to justify it to.
4. **Restate** in Tam's words: Outcome, User, Why now, Success, Constraint, Out of scope. Out of scope stays. About five to eight lines.
5. **Explicit yes.** "Whatever you think", "sounds good", and silence are not yes. If Tam corrects you, restate again.
6. **Stop the turn.** Give the confirmed intent. Offer to draft `docs/specs/<slug>.md` next, via `spec-driven-development`. Do not write the spec, the plan, or code in this turn.

Stop interviewing when you can predict Tam's reaction to the next three questions. If several rounds do not raise confidence, say so and step back.

The durable write-up is the spec. Do not save a second intent doc unless Tam asks.

## Red flags

- Three questions in one message, or a question with no guess
- A spec or code before an explicit yes
- Planning in the same turn as the yes
- No Out of scope line

## Verification

- [ ] The first turn had a hypothesis and a confidence number
- [ ] Questions were one at a time, each with a guess
- [ ] The restate included Out of scope and got an explicit yes
- [ ] The turn stopped there

Adapted from addyosmani/agent-skills (MIT, © Addy Osmani). License: https://github.com/addyosmani/agent-skills/blob/main/LICENSE
