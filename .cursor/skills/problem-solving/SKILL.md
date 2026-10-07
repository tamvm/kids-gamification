---
name: problem-solving
description: >-
  Use when stuck: complexity spirals, recurring special cases, forced "only way"
  assumptions, scale uncertainty, or innovation blocks. Symptom → technique
  dispatch for simplification, inversion, meta-patterns, collision, and scale tests.
---

# Problem-solving techniques

Use when implementation is thrashing, not for routine small fixes.

## Quick dispatch

| Stuck symptom | Technique |
|---------------|-----------|
| Same thing 5 ways / growing special cases | **Simplification cascade** — one insight that deletes X, Y, Z |
| "Must be done this way" / forced design | **Inversion** — assume the opposite; what becomes possible? |
| Same bug/pattern in multiple layers | **Meta-pattern** — one rule across layers |
| Unsure it survives real use or kids/privacy constraints | **Scale game** — 0, 1, 1000×, and failure modes |
| Conventional approaches keep failing | **Collision** — treat this like an unrelated successful system |
| Code wrong / test failing / unexpected output | **Debug** — systematic debugging, not these reframes |

## How to apply

1. Name the stuck-type from the table.
2. Apply one technique; write the insight in one sentence.
3. Change the code to match the insight — delete special cases when possible.
4. Re-check `AGENTS.md` and child-data / security constraints before shipping.
5. If still stuck: reframe, combine two techniques, or ask Tam with evidence.

Useful combos: simplification + meta-pattern; scale + simplification; collision + inversion.

## Attribution

Technique names/ideas from Microsoft Amplifier / Karpathy-style practice; adapted for this Cursor repo from the sls-auto-scraper skill (trading-specific notes removed).
