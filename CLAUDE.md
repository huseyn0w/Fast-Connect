# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Fast Connect is a registration-free group video conferencing app (full-mesh WebRTC). It is an **npm-workspaces monorepo** with two packages:

- [client/](client/) — Vite + React 18 + TypeScript + Tailwind SPA (UI + all WebRTC client logic).
- [server/](server/) — Node 22 + Express 5 + Socket.IO 4 + self-hosted PeerJS broker (signaling + chat relay).

A backend is required and intentional: WebRTC needs a signaling channel (room membership) and a peer broker (media negotiation). The mesh topology is deliberate — keep it; do not introduce an SFU unless explicitly asked.

## Commands

Run from the repo root (workspace-aware). Requires Node 20+.

- `npm install` — installs both workspaces (single root lockfile).
- `npm run dev:server` — signaling server with watch reload (`tsx`), port 5000.
- `npm run dev:client` — Vite dev server (HMR), port 5173.
- `npm run build` — builds both workspaces (`server` → `tsc`; `client` → `tsc -b && vite build`).
- `npm test` — runs Vitest in both workspaces. Single package: `npm run test --workspace @fast-connect/server` (or `@fast-connect/client`). Single file: `npm run test --workspace @fast-connect/client -- room.test`.
- `npm run typecheck` / `npm run lint` (lint is client-only, flat ESLint config).

Local containers: `docker compose up --build` (serves client on :8080, server on :5000). Production deploy: [DEPLOYMENT.md](DEPLOYMENT.md).

## Architecture

### Two signaling channels (the core mental model)

1. **Socket.IO** carries **room membership + chat only**. The typed event contract is duplicated, by design, in [server/src/events.ts](server/src/events.ts) and [client/src/lib/signaling/events.ts](client/src/lib/signaling/events.ts) — keep them in sync (they're separate to avoid coupling the browser build to the Node build). Server handlers live in [server/src/signaling.ts](server/src/signaling.ts); ephemeral room state is a swappable in-memory [RoomRegistry](server/src/rooms.ts).
2. **PeerJS** carries the **media**. The server self-hosts the PeerJS broker (mounted at `PEER_PATH`, default `/peerjs`) in [server/src/index.ts](server/src/index.ts) — it no longer relies on the public PeerJS cloud. The client points PeerJS at that broker via [client/src/lib/peer/createPeer.ts](client/src/lib/peer/createPeer.ts).

### Join/call flow (full mesh)

On join, the server sends the **newcomer** the existing roster (`room:peers`) and broadcasts `peer:joined` to everyone else. The **newcomer initiates** one PeerJS call per existing peer; existing peers answer in `peer.on("call")`. A single call per pair exchanges **both** cameras (caller passes its stream to `peer.call`, answerer passes its stream to `call.answer`). Screen sharing rides a **separate** call tagged with `metadata.kind: "screen"`; receivers route by that flag. This asymmetry (newcomer calls, others answer) avoids double-calling and the old "stream must be ready on the existing side" race.

All of this lives in [client/src/hooks/useConference.ts](client/src/hooks/useConference.ts) — the heart of the app. Connection/peer bookkeeping is held in refs so React only re-renders when the rendered collections (`participants`, `messages`, `screenShare`) change. Local camera/mic acquisition + mute toggles are isolated in [useLocalMedia](client/src/hooks/useLocalMedia.ts).

### Routing & identity

React Router v6. Rooms are **shareable URLs**: `/room/:roomId` (a real improvement over the old localStorage-only flow). The display name is kept in `sessionStorage` ([client/src/lib/session.ts](client/src/lib/session.ts)); [Room.tsx](client/src/pages/Room.tsx) shows a `JoinGate` to collect it when absent, then renders `ConnectedRoom`.

### UI

Tailwind (config in [client/tailwind.config.ts](client/tailwind.config.ts)) with a dark "deep-space/aurora" theme. Single violet accent (`aurora`) with a rare cyan glow; shared primitives in `client/src/components/ui/`. Framer Motion for entrance/hover motion (kept restrained; honor `prefers-reduced-motion`). Icons come from `@phosphor-icons/react` — do not hand-roll SVG icons.

## Conventions & gotchas

- **Server is ESM with NodeNext resolution**: relative imports in `server/src` must end in `.js` (even in `.ts` files and tests). Match this.
- **Vite env vars** are `VITE_*` and inlined at **build time** (read in [client/src/config.ts](client/src/config.ts)). Changing the server URL for a deployed client means rebuilding the client (the Docker build takes `VITE_SERVER_URL` as a build arg).
- **HTTPS is required in production** for `getUserMedia`; deployment uses Caddy for automatic TLS. `localhost` is a secure context, so plain HTTP is fine in dev.
- `npm audit` flags are dev-only (esbuild/vite/vitest dev server) and never ship — production serves static files via nginx.
- Server config ([server/src/config.ts](server/src/config.ts)) treats empty-string env vars as unset (`||`, not `??`) and fails fast on a bad `PORT`.
