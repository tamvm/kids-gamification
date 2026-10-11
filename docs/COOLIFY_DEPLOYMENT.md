# Coolify deploy (Kids Quest)

Production target: **Coolify** on the Hetzner host (`openclaw`), same pattern as Magic English / other `*.kenchange.com` apps.

| Item | Value |
|------|--------|
| Repo | `tamvm/kids-gamification` |
| Public URL | `https://kids.kenchange.com` |
| Dockerfile | `/Dockerfile` (repo root) |
| Container port | **`3000`** (Coolify “Ports Exposes”) |
| SQLite path | `DATABASE_PATH=/data/app.db` (persistent volume **required**) |
| Coolify app UUID | set GitHub Actions variable `COOLIFY_APP_UUID` after create |
| Health | `GET /api/health` → `{"status":"ok"}` |

Compose on `:3118` remains a **manual fallback** (`docker-compose.yml`). Prefer Coolify once the app UUID exists.

---

## What Tam does once in Coolify UI

This cloud agent **cannot** SSH to the VPS or create Coolify resources from here. Please:

### 1. Create the application

1. Coolify → **+ New Resource** → Application → GitHub → `tamvm/kids-gamification`
2. **Branch:** `main` (deploy after merge; or temporarily the scaffold branch for a first smoke)
3. **Base Directory:** `/` (repo root)
4. **Build Pack:** Dockerfile
5. **Dockerfile location:** `Dockerfile`
6. **Ports Exposes:** `3000`
7. **Domains:** add `kids.kenchange.com` if Coolify/Traefik is used for that host; on this VPS you often also wire **cloudflared** (below)

### 2. Persistent storage (SQLite — do not skip)

1. Application → **Storages** (or Persistent Storage)
2. Add a volume mount: host/volume → container path **`/data`**
3. Without this, kid progress is wiped on every redeploy

### 3. Environment variables

```bash
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
DATABASE_PATH=/data/app.db
```

No app auth secrets yet — put **Cloudflare Zero Trust** on the hostname before public use.

### 4. First deploy + note the UUID + host port

1. Deploy once from Coolify UI
2. Copy the application **UUID** (URL or settings)
3. Note the published host port Coolify assigned (e.g. `127.0.0.1:3118→3000`) if Traefik is not the public path

### 5. GitHub Actions variable

In `tamvm/kids-gamification` → Settings → Secrets and variables → Actions → **Variables**:

| Name | Value |
|------|--------|
| `COOLIFY_APP_UUID` | *(paste UUID from step 4)* |

Optional: `COOLIFY_BASE_URL` (default `http://localhost:8000` on the self-hosted runner).

Token: reuse runner file `~/.coolify/github-actions.token` **or** set repo secret `COOLIFY_API_TOKEN` (same as vocabulary-learning).

### 6. Cloudflare tunnel + Zero Trust

If other apps use tunnel `n8n` → localhost ports:

1. Point `kids.kenchange.com` ingress at `http://localhost:<coolify-host-port>` (see `deploy/cloudflared/ingress-snippet.yml`; update port if Coolify did not use 3118)
2. Enable **Cloudflare Access** on `kids.kenchange.com` before sharing with the kids

---

## Auto-deploy on merge

Workflows:

- `.github/workflows/ci.yml` — lint + build (self-hosted)
- `.github/workflows/coolify-deploy.yml` — after CI succeeds on `main`, or `workflow_dispatch`

Deploy API (same as Magic English):

```http
GET {COOLIFY_BASE_URL}/api/v1/deploy?uuid=<COOLIFY_APP_UUID>&force=false
Authorization: Bearer <token>
```

---

## Smoke checklist

```bash
curl -sS https://kids.kenchange.com/api/health
# → {"status":"ok"}
```

Open the landing page behind Access; confirm SQLite persists across a second Coolify redeploy (energy/coins later).

---

## Helpful replies for the agent

Paste back when ready:

```text
COOLIFY_APP_UUID=...
COOLIFY_HOST_PORT=...          # e.g. 3118
TUNNEL_UPDATED=yes|no
ZERO_TRUST=yes|no
COOLIFY_APP_UUID_VAR_SET=yes|no
```
