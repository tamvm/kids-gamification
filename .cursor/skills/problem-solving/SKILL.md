---
name: problem-solving
description: >-
  Use when stuck: complexity spirals, recurring special cases, forced "only way"
  assumptions, scale uncertainty, or innovation blocks. Symptom → technique
  dispatch for simplification, inversion, meta-patterns, collision, and scale tests.
  Derived from Microsoft Amplifier patterns (same lineage as ClaudeKit's
  problem-solving skill); adapted for this Cursor repo — not a kit slash command.
---

# Problem-solving techniques

Use when implementation is thrashing, not for routine small fixes.

## Quick dispatch

| Stuck symptom | Technique |
|---------------|-----------|
| Same thing 5 ways / growing special cases | **Simplification cascade** — one insight that deletes X, Y, Z |
| "Must be done this way" / forced design | **Inversion** — assume the opposite; what becomes possible? |
| Same bug/pattern in multiple layers | **Meta-pattern** — one rule across routes / lib / frontend |
| Unsure it survives production load or money paths | **Scale game** — 0, 1, 1000×, and failure modes |
| Conventional approaches keep failing | **Collision** — treat this like an unrelated successful system |
| Code wrong / test failing / unexpected output | **Debug** — use systematic debugging, not these reframes |

## How to apply

1. Name the stuck-type from the table (do not invent a sixth ritual).
2. Apply one technique; write the insight in one sentence.
3. Change the code to match the insight — delete special cases when possible.
4. Re-check against `REVIEW.md` trading/security constraints before shipping.
5. If still stuck: reframe (wrong problem?), combine two techniques, or ask with evidence.

Useful combos: simplification + meta-pattern; scale + simplification; collision + inversion.

## Repo-specific notes

- Shared-logic mismatches (`lib/signals.js` source of truth ↔ `public/js/dashboard.js` independent rendering) are usually a **meta-pattern** fix that keeps both in sync, not two independent bugs.
- Data-source differences (eToro API vs market-data fetchers: CoinGecko / Yahoo / Binance / Hyperliquid / vnstock in `lib/prices.js` and `lib/fetchers/*`) — invert "one unified fetcher" if the sources truly diverge; prefer thin per-source adapters over a leaky god-fetcher that silently falls back.
- Schema lives in `db.js` (embedded SQLite via `better-sqlite3`), not separate migration files — a "scale game" on a schema change means checking existing rows and the auto-migration path on startup, not a Postgres migration tool.
- Do not use these techniques to justify broad refactors when a small explicit fix is enough (`REVIEW.md`: prefer small, explicit fixes over broad refactors).

## Attribution

Technique names/ideas from [Microsoft Amplifier](https://github.com/microsoft/amplifier) (insight-synthesizer / when-stuck dispatch). ClaudeKit Engineer packages the same lineage; this file is a Cursor-native rewrite for investor-metrics, not a copy of kit `references/*.md`.
