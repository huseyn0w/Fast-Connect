# Deploying Fast Connect to a Hostinger VPS

Fast Connect needs **HTTPS**, **persistent Node processes**, and **WebSocket** support (Socket.IO + PeerJS). Hostinger **shared/web hosting cannot run this** — it has no long-lived Node runtime and no WebSocket support. Use a **Hostinger VPS** (Ubuntu), which is what this guide targets.

> Why HTTPS is non-negotiable: browsers only grant camera/microphone access (`getUserMedia`) on secure origins. Without TLS the app loads but no one can turn on their camera.

The production stack runs three containers via [docker-compose.prod.yml](docker-compose.prod.yml):

- **caddy** — edge proxy; terminates TLS with automatic Let's Encrypt certs and proxies WebSockets.
- **client** — the static SPA, served by nginx.
- **server** — the Socket.IO + PeerJS signaling server.

## 1. Provision the VPS

In hPanel, create a **VPS** with the **Ubuntu 22.04/24.04** template (the "Ubuntu with Docker" template saves a step). Note the VPS public IP.

SSH in:

```bash
ssh root@YOUR_VPS_IP
```

If Docker isn't preinstalled:

```bash
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version
```

## 2. Point your domain at the VPS

In Hostinger DNS (hPanel → Domains → DNS / Nameservers), add an **A record**:

| Type | Name           | Value         |
| ---- | -------------- | ------------- |
| A    | `meet` (or `@`)| `YOUR_VPS_IP` |

Wait for it to resolve (`dig +short meet.example.com` should return your IP). Caddy can only issue a certificate once DNS points at the server.

## 3. Open the firewall

```bash
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP (ACME challenge + redirect)
ufw allow 443/tcp    # HTTPS
ufw enable
```

## 4. Get the code and configure

```bash
git clone https://github.com/huseyn0w/fast-connect.git
cd fast-connect
cp .env.production.example .env.production
nano .env.production        # set DOMAIN and ACME_EMAIL
```

`.env.production`:

```
DOMAIN=meet.example.com
ACME_EMAIL=you@example.com
```

The [deploy/Caddyfile](deploy/Caddyfile) reads `DOMAIN`/`ACME_EMAIL` from the environment, so you normally don't edit it. The server's `CORS_ORIGINS` is derived from `DOMAIN` automatically in the compose file.

## 5. Build and start

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

First boot, Caddy obtains a TLS certificate (a few seconds). Check status and logs:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy
```

## 6. Verify

```bash
curl https://meet.example.com/health      # -> {"status":"ok",...}
```

Open `https://meet.example.com`, create a room, and join the link from a second device. Allow camera/mic when prompted.

## 7. Updating / redeploying

```bash
cd fast-connect
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Camera/mic never turns on | Page not served over HTTPS | Confirm the site loads on `https://` and the cert issued (`docker compose ... logs caddy`). |
| "Connecting…" never resolves; WebSocket errors in console | Proxy not forwarding upgrades, or DNS not propagated | Confirm DNS resolves to the VPS; check `caddy` logs; ensure ports 80/443 are open. |
| CORS errors in the console | `CORS_ORIGINS` doesn't match the site origin | It's derived from `DOMAIN`; make sure `DOMAIN` in `.env.production` matches the URL you open (no trailing slash, correct subdomain). |
| Certificate not issued | A record wrong or ports blocked | Verify `dig +short DOMAIN`, open 80/443, then `docker compose ... restart caddy`. |
| Port 80 already in use | Host nginx/apache running | Stop it (`systemctl stop nginx`) or remap; Caddy needs 80/443. |

## Local validation before deploying

You can run the exact production images locally (HTTP, no TLS) to sanity-check the build:

```bash
docker compose up --build
# open http://localhost:8080
```
