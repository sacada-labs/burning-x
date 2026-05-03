# syntax=docker/dockerfile:1

# ═══════════════════════════════════════════════════════════════════════════════
# TanStack Start + Bun + better-sqlite3 — Production Dockerfile
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Base ─────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS base
WORKDIR /app

# ─── Dependencies ─────────────────────────────────────────────────────────────
# Native modules (better-sqlite3) need Python, make & a C++ compiler.
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends \
	python3 \
	make \
	g++ \
	gcc \
	libc6-dev \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ─── Build ────────────────────────────────────────────────────────────────────
FROM deps AS build
COPY . .
ENV NODE_ENV=production
RUN bun run build

# ─── Production ───────────────────────────────────────────────────────────────
FROM base AS production
WORKDIR /app

# ca-certificates is required for HTTPS requests (OAuth, PostHog, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
	ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Full node_modules is copied so CLI tools like drizzle-kit remain available
# for migrations. The .output/server directory is self-contained (Nitro traces
# better-sqlite3 and its native binary into .output/server/node_modules).
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts

# SQLite lives on a volume so the DB survives container restarts.
RUN mkdir -p /data
VOLUME ["/data"]

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/data/prod.db

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD bun -e "fetch('http://localhost:' + (process.env.PORT || 3000)).then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))" || exit 1

# Default: start the Nitro server directly.
# Override this CMD with scripts/docker-start.sh if you want auto-migrations.
CMD ["bun", ".output/server/index.mjs"]
