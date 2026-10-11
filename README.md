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

Health check (also auto-seeds if DB empty after migrate):

```bash
curl -s http://localhost:3000/api/health
```

## Economy (locked)

| | Energy | Coins |
|---|---|---|
| Earn | Correct quiz answers (+ streaks) | Map pickups (chest / star / sparkle) |
| Spend | Move / unlock map nodes | Shop (v2) |

## Deploy (Hetzner)

```bash
docker compose up -d --build
# publishes 127.0.0.1:3118 → container :3000
```

Then append [`deploy/cloudflared/ingress-snippet.yml`](deploy/cloudflared/ingress-snippet.yml) to `~/.cloudflared/config.yml` on `openclaw.hetzner` (backup first) and restart the existing `n8n` tunnel. Do **not** bind host port 3000.

Protect the hostname with Cloudflare Zero Trust; the app has no built-in auth.

## Agent harness

- [`AGENTS.md`](AGENTS.md) — agent behavior
- [`docs/agent-graph-pr.md`](docs/agent-graph-pr.md) — plan → build → independent review → human merge
- `.cursor/agents/` — verifier, security-auditor, ui-reviewer
- `.cursor/rules/` + `.cursor/skills/` — discipline + PR workflow

## Phase map

1. Scaffold (this) — app shell, schema, seed, Docker `:3118`
2. Game core APIs — energy / coins / review
3. Kid quiz UI
4. World map + pickups
5. Parent admin
6. Production ingress + Zero Trust smoke
7. Coin shop (later)
