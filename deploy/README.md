# Deploy on openclaw.hetzner

## App

```bash
docker compose up -d --build
```

- Listens on **`127.0.0.1:3118`** (container port 3000)
- SQLite volume: `kids-data` → `/data/app.db`
- Do **not** use host port 3000 (`openclaw-x.kenchange.com` already uses it)

## Cloudflare tunnel

`cloudflared` is already installed and running tunnel **`n8n`**.

1. Backup: `cp ~/.cloudflared/config.yml ~/.cloudflared/config.yml.bak-kids-$(date +%Y%m%d%H%M%S)`
2. Insert the rule from `cloudflared/ingress-snippet.yml` **above** the `http_status:404` catch-all
3. Restart the existing tunnel (`sudo systemctl restart cloudflared-n8n` or the active process)
4. Confirm DNS for `kids.kenchange.com` already points at the tunnel
5. Put Cloudflare Zero Trust Access in front of the hostname

SSH: `pi@openclaw.hetzner -p 2223`
