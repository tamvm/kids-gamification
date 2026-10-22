# Coolify deploy (Kids Quest)

Production target: **Coolify** on the Hetzner host (`openclaw`), same pattern as Magic English / other `*.kenchange.com` apps.

| Item | Value |
|------|--------|
| Repo | `tamvm/kids-gamification` |
| Public URL | `https://kids.kenchange.com` |
| Dockerfile | `/Dockerfile` (repo root) |
| Container port | **`3000`** (Coolify “Ports Exposes”) |
| SQLite path | `DATABASE_PATH=/data/app.db` (persistent volume **required**) |
| Coolify project UUID | `n12vvevc3k8zni7tj5jag6a4` (`kids-gamification`) |
| Coolify app UUID | `vzxs693e0y3ebkr3euxpfe6t` — also set GitHub Actions variable `COOLIFY_APP_UUID` |
| Host port mapping | `3118:3000` |
| Deploy key (Coolify) | `kids-gamification-deploy` (`iesu1wr4boc0u6qhig06kntt`) — **add public key to GitHub** (see below) |
| Health | `GET /api/health` → `{"status":"ok"}` |

Compose on `:3118` remains a **manual fallback** (`docker-compose.yml`). Prefer Coolify once the app UUID exists.

---

## Blocker for first deploy (needs Tam — 1 minute)

Coolify app **already exists** (created via API). Git clone will fail until this deploy key is on the GitHub repo:

1. Open https://github.com/tamvm/kids-gamification/settings/keys
2. **Add deploy key** (read-only is enough):
   - Title: `coolify-kids-gamification`
   - Key:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIF6Sqv6ahrNYPP2ex7qxBZu1SSYzF7+Whlj08UdjtJY1 kids-gamification-coolify
```

3. Also set repo Actions variable `COOLIFY_APP_UUID=vzxs693e0y3ebkr3euxpfe6t`
4. Reply `DEPLOY_KEY_ADDED=yes` — agent will queue Coolify deploy + wire tunnel if needed

---

## Option A: give the agent Coolify API access (already done for create)

Agent used SSH + Coolify CLI token on the VPS to create the project/app. For future cloud-only access without SSH:

The cloud agent **can** create the app, persistent `/data` volume, env vars, and queue a deploy via Coolify’s REST API — but only if it can reach your Coolify instance.

Your Coolify dashboard hostname (the one you open in the browser) currently redirects (likely Cloudflare Access). Pick **one** access path:

### A1 — Public Coolify URL + Access service token (best for cloud agents)

1. Coolify → **Keys & Tokens** → **API tokens** → create a token with permission to manage applications (read/write).
2. Cloudflare Zero Trust → Access → **Service Auth** → create a Service Token for the Coolify Access app (or reuse an existing automation token).
3. Paste back to the agent (chat is fine for a short-lived setup token; revoke after):

```text
COOLIFY_BASE_URL=https://<your-coolify-host>
COOLIFY_API_TOKEN=<coolify bearer token>
CF_ACCESS_CLIENT_ID=<access client id>
CF_ACCESS_CLIENT_SECRET=<access client secret>
```

Optional but helpful if you already know them:

```text
COOLIFY_PROJECT_UUID=...          # or leave blank — agent will list /projects
COOLIFY_SERVER_UUID=...           # or leave blank — agent will list /servers
COOLIFY_PRIVATE_KEY_UUID=...      # deploy key already used by other apps (repo is private)
```

The agent will then:

1. `GET /api/v1/servers` + `GET /api/v1/projects` (create project `kids-gamification` if needed)
2. `POST /api/v1/applications/private-deploy-key` (or github-app variant) with:
   - repo `tamvm/kids-gamification`, branch `main` (or current scaffold branch for first smoke)
   - `build_pack=dockerfile`, `dockerfile_location=Dockerfile`, `ports_exposes=3000`
   - domain `https://kids.kenchange.com` when ready
3. `POST /api/v1/applications/{uuid}/storages` → persistent mount `/data`
4. Set envs: `PORT`, `HOSTNAME`, `DATABASE_PATH=/data/app.db`
5. `GET/POST /api/v1/deploy?uuid=...`
6. Tell you the **app UUID** to store as GitHub Actions variable `COOLIFY_APP_UUID`

**Security:** prefer a short-lived / narrowly scoped token; revoke after setup if you want.

### A2 — SSH tunnel from your laptop (if you do not want Access headers)

On a machine that already SSHes to the VPS:

```bash
ssh -p 2223 -L 8000:localhost:8000 pi@openclaw.hetzner -N
```

Then either:

- run the create curls yourself against `http://localhost:8000`, or
- temporarily expose that tunnel to the agent (usually harder than A1).

---

## Option B: create once in Coolify UI

If you prefer clicking:

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
SESSION_SECRET=<unique random value, not the demo session secret>
PARENT_PASSWORD=<unique parent password, not the README demo password>
```

Do not set `PUBLIC_HOST` to `localhost` or `127.0.0.1` on this app. If either secret is missing or still the documented demo value, the container refuses to boot. Use a fresh `/data` volume so the only profiles are `Celine (demo)` and `Test Child`. Put **Cloudflare Zero Trust** on the hostname before public use.

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
