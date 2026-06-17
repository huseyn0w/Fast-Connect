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
# Stage 1 — build the static SPA bundle
# -----------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Build-time configuration (inlined into the JS bundle by Vite).
#   VITE_SERVER_URL: base URL of the signaling server.
#     Local compose -> http://localhost:5000
#     Production (same-origin behind the edge proxy) -> leave EMPTY ""
#   VITE_PEER_PATH:  must match the server's PEER_PATH (default /peerjs).
ARG VITE_SERVER_URL=""
ARG VITE_PEER_PATH="/peerjs"
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_PEER_PATH=$VITE_PEER_PATH

# Install client workspace deps (incl. dev — needed to build) via root lockfile.
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
RUN npm ci --workspace @fast-connect/client --include-workspace-root=false

# Copy the client source and build.
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
