# syntax=docker/dockerfile:1

# =============================================================================
# Fast Connect — signaling server (Express 5 + Socket.IO + self-hosted PeerJS)
# Multi-stage build for an npm-workspaces monorepo.
#
# Build context is the REPOSITORY ROOT (so the root lockfile + workspace
# manifests are available). See docker-compose*.yml `build.context: .`.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1 — build: install all deps (incl. dev) and compile TS -> dist
# -----------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Copy the manifests needed for a deterministic, cache-friendly install.
# The root lockfile resolves the whole workspace tree.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json

# Install dependencies for the server workspace (and its transitive deps)
# using the root lockfile. --include-workspace-root=false keeps us from
# pulling the (non-existent) root deps.
RUN npm ci --workspace @fast-connect/server --include-workspace-root=false

# Copy the server source and build.
COPY server/tsconfig.json ./server/tsconfig.json
COPY server/src ./server/src

RUN npm run build --workspace @fast-connect/server

# -----------------------------------------------------------------------------
# Stage 2 — runtime: production deps only + compiled output
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install ONLY production dependencies for the server workspace.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --omit=dev --workspace @fast-connect/server --include-workspace-root=false \
    && npm cache clean --force

# Copy the compiled JS from the build stage.
COPY --from=build /app/server/dist ./server/dist

# Run as the unprivileged user that ships with the node image.
USER node

EXPOSE 5000

# Liveness check against the app's own /health endpoint.
# Node is guaranteed present in the image, so we avoid depending on wget/curl.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# server/package.json `main` is dist/index.js; we cd into the workspace dir.
WORKDIR /app/server
CMD ["node", "dist/index.js"]
