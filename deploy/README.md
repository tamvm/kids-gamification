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

`cloudflared` tunnel **`n8n`** is already on the VPS.

1. Backup: `cp ~/.cloudflared/config.yml ~/.cloudflared/config.yml.bak-kids-$(date +%Y%m%d%H%M%S)`
2. Insert rule from `cloudflared/ingress-snippet.yml` (set port to Coolify’s published host port if not 3118)
3. Restart the existing tunnel — do not install a second cloudflared
4. Confirm DNS for `kids.kenchange.com`
5. Enable Zero Trust Access

SSH (from a machine with keys): `pi@openclaw.hetzner -p 2223`
