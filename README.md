# kids-gamification

Kids gamification app (stack TBD).

## Agent harness

Multi-agent workflow for Cursor lives in-repo:

- [`AGENTS.md`](AGENTS.md) — how agents should behave
- [`docs/agent-graph-pr.md`](docs/agent-graph-pr.md) — plan → build → independent review → human merge
- `.cursor/agents/` — `verifier`, `security-auditor`, `ui-reviewer` (read-only reviewers)
- `.cursor/rules/` — engineering discipline + PR gates
- `.cursor/skills/` — PR workflow + problem-solving

Adapted from the good parts of `tamvm/sls-auto-scraper` (trading/Coolify-specific pieces removed) plus dedicated review agents.
