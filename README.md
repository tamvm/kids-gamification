# Kids Quest (kids-gamification)

English-only family learning portal for two kid profiles (Little ~4, Big ~8).  
Quiz answers earn **energy** to explore a Chessworld-style map; **coins** are map pickups for a later shop.

**Planned live URL:** [kids.kenchange.com](https://kids.kenchange.com) · **VPS port:** `127.0.0.1:3118`

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- SQLite via `better-sqlite3` + Drizzle ORM
- Docker Compose on Hetzner; existing Cloudflare tunnel `n8n`

## Local development

```bash
npm install
npm run db:generate   # if schema changed
npm run db:migrate    # applies migrations + seeds when empty
npm run dev           # http://localhost:3000
```

Migrate/seed before first run (`db:migrate` seeds when empty). Health is connectivity-only:

```bash
curl -s http://localhost:3000/api/health
# → {"status":"ok"}
```

## Economy (locked)

| | Energy | Coins |
|---|---|---|
| Earn | Correct quiz answers (+ streaks) | Map pickups (chest / star / sparkle) |
| Spend | Move / unlock map nodes | Shop (v2) |

## Deploy (Coolify on Hetzner)

Primary path: **Coolify** — see [`docs/COOLIFY_DEPLOYMENT.md`](docs/COOLIFY_DEPLOYMENT.md).

- Container port `3000`, persistent volume `/data` for SQLite
- After creating the Coolify app, set GitHub Actions variable `COOLIFY_APP_UUID`
- Merge to `main` → CI → **Coolify Deploy** workflow (self-hosted runner)
- Wire `kids.kenchange.com` via cloudflared + **Zero Trust** (no app auth)

Manual fallback: `docker compose up -d --build` → `127.0.0.1:3118` (see `deploy/README.md`).

## Agent harness

- [`AGENTS.md`](AGENTS.md) — agent behavior
- [`docs/agent-graph-pr.md`](docs/agent-graph-pr.md) — plan → build → independent review → human merge
- `.cursor/agents/` — verifier, security-auditor, ui-reviewer
- `.cursor/rules/` + `.cursor/skills/` — discipline + PR workflow

## Curriculum (seed)

- **Logic · Little Thinkers** — first set for the little explorer (~age 4): patterns, same/different, categories, size, sequence (12 MCQs). Meadow map node.
- Math / Writing / Chess — later nodes; placeholders remain in seed.

Re-run `npm run db:seed` (or `db:migrate`) to upsert Logic content on an existing DB.

## Phase map

1. Scaffold (this) — app shell, schema, seed, Docker `:3118`
2. Game core APIs — energy / coins / review
3. Kid quiz UI
4. World map + pickups
5. Parent admin
6. Production ingress + Zero Trust smoke
7. Coin shop (later)
