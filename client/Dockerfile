# syntax=docker/dockerfile:1

# =============================================================================
# Fast Connect — web client (Vite + React + Tailwind SPA)
# Multi-stage: build the static bundle, then serve it with nginx.
#
# Build context is the REPOSITORY ROOT (root lockfile + workspace manifests).
# See docker-compose*.yml `build.context: .`.
#
# Vite inlines VITE_* env at BUILD time, so the signaling server URL and the
# PeerJS path are baked in here via build args.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — deps: install client workspace deps (incl. dev). Shared by dev+build.
# -----------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
RUN npm ci --workspace @fast-connect/client --include-workspace-root=false

# -----------------------------------------------------------------------------
# Stage 1b — dev: Vite dev server with HMR. Source is bind-mounted by
# docker-compose.dev.yml, so nothing is copied in here.
# -----------------------------------------------------------------------------
FROM deps AS dev
ENV NODE_ENV=development
WORKDIR /app
EXPOSE 5173
CMD ["npm", "run", "dev", "--workspace", "@fast-connect/client", "--", "--host"]

# -----------------------------------------------------------------------------
# Stage 1c — build the static SPA bundle.
#   VITE_SERVER_URL: base URL of the signaling server (Vite inlines it).
#     Local compose -> http://localhost:5000 ; production same-origin -> "".
#   VITE_PEER_PATH:  must match the server's PEER_PATH (default /peerjs).
# -----------------------------------------------------------------------------
FROM deps AS build
ARG VITE_SERVER_URL=""
ARG VITE_PEER_PATH="/peerjs"
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_PEER_PATH=$VITE_PEER_PATH
COPY client/ ./client/
RUN npm run build --workspace @fast-connect/client

# -----------------------------------------------------------------------------
# Stage 2 — serve the static bundle with nginx
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runtime

# SPA-aware nginx config (gzip, static caching, history-API fallback).
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Static assets produced by `vite build`.
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

# nginx:alpine already defines a sensible CMD; keep the default.
