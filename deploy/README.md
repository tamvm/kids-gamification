# Deploy

**Preferred:** Coolify — see [`docs/COOLIFY_DEPLOYMENT.md`](../docs/COOLIFY_DEPLOYMENT.md).

## Coolify (summary)

- Dockerfile at repo root, expose container port **3000**
- Persistent volume on **`/data`** (`DATABASE_PATH=/data/app.db`)
- Set GitHub variable `COOLIFY_APP_UUID` after creating the app
- Auto-deploy: Actions workflow **Coolify Deploy** (self-hosted runner → `localhost:8000`)
- Put Cloudflare Zero Trust on `kids.kenchange.com` before kids use it

## Manual Compose fallback

```bash
docker compose up -d --build
```

- Publishes **`127.0.0.1:3118:3000`**
- Do **not** bind host port 3000 (`openclaw-x.kenchange.com` already uses it)

## Cloudflare tunnel

`cloudflared` tunnel **`n8n`** on `openclaw.hetzner` (systemd: `cloudflared-n8n`).

**Live (2026-10-12):** ingress rule `kids.kenchange.com` → `http://localhost:3118` is in `/home/pi/.cloudflared/config.yml`. Smoke:

```bash
curl -sS https://kids.kenchange.com/api/health
# → {"status":"ok"}
```

To add or change a hostname:

1. Backup: `cp ~/.cloudflared/config.yml ~/.cloudflared/config.yml.bak-kids-$(date +%Y%m%d%H%M%S)`
2. Insert rule from `cloudflared/ingress-snippet.yml` (before the catch-all `http_status:404`)
3. `sudo systemctl restart cloudflared-n8n` — do not install a second cloudflared
4. If the hostname is new in Cloudflare, route DNS to tunnel `n8n` (Zero Trust public hostname or `cloudflared tunnel route dns`)
5. Enable **Zero Trust Access** before kids use the site (app has no login yet)

SSH (from a machine with keys): `pi@openclaw.hetzner -p 2223`
