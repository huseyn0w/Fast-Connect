# Fast Connect

Instant, registration-free group video conferencing. Create a room, share the link, and talk face to face in seconds — with screen sharing and chat built in.

**Features**
- No registration, no accounts, no downloads
- Real-time multi-party video/audio (full-mesh WebRTC)
- Shareable room links
- Screen sharing
- In-room chat

## Tech stack

| Layer    | Technology                                                        |
| -------- | ----------------------------------------------------------------- |
| Client   | Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, PeerJS   |
| Server   | Node 22, Express 5, Socket.IO 4, self-hosted PeerJS broker        |
| Tooling  | npm workspaces, Vitest, ESLint, Docker                            |

The repo is an npm-workspaces monorepo:

- [client/](client/) — the single-page app (UI + WebRTC logic).
- [server/](server/) — the signaling server (room membership + chat over Socket.IO) and the PeerJS broker that carries media. A backend is required: WebRTC needs a signaling channel and a peer broker.

## Getting started

Requires Node 20+.

```bash
npm install                 # installs both workspaces
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Run the server and client in two terminals:

```bash
npm run dev:server          # signaling on http://localhost:5000
npm run dev:client          # app on http://localhost:5173
```

Open http://localhost:5173. To test a real call, open the room link in a second browser/tab.

> Camera and microphone access requires a secure context. `localhost` counts as secure; any other host must be served over **HTTPS**.

## Common scripts (run from the repo root)

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev:client`| Vite dev server (HMR)                         |
| `npm run dev:server`| Signaling server with watch reload            |
| `npm run build`     | Builds both workspaces                         |
| `npm test`          | Runs the Vitest suites in both workspaces      |
| `npm run typecheck` | Type-checks both workspaces                     |
| `npm run lint`      | Lints the client                               |

## Configuration

Client ([client/.env.example](client/.env.example)):
- `VITE_SERVER_URL` — base URL of the signaling server (empty = same origin).
- `VITE_PEER_PATH` — PeerJS broker path; must match the server.

Server ([server/.env.example](server/.env.example)):
- `PORT`, `NODE_ENV`
- `CORS_ORIGINS` — comma-separated allowed browser origins (`*` for local dev only).
- `PEER_PATH` — path the PeerJS broker is mounted under.

## Docker & deployment

**Containerized development (live reload):**

```bash
docker compose -f docker-compose.dev.yml up --build   # http://localhost:5173
```

Source folders are bind-mounted, so host edits sync into the containers instantly: Vite HMR refreshes the browser and `tsx` restarts the server on change — no rebuild needed. File-watching uses polling so changes are detected reliably across the mount.

> macOS note: AirPlay Receiver holds port 5000. If it's in use, pick another host port for the server: `SERVER_PORT=5055 docker compose -f docker-compose.dev.yml up --build`.

**Production-style images (no reload):** `docker compose up --build` builds the same images shipped to production (static SPA via nginx + compiled server) and serves the client on `:8080`. Use it to validate the build locally. See [docker-compose.yml](docker-compose.yml).

Production deployment to a Hostinger VPS is documented in [DEPLOYMENT.md](DEPLOYMENT.md).

## License

GPL-3.0
