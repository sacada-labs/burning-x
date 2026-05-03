FROM oven/bun:1

WORKDIR /app

# Install system dependencies:
# - build tools for compiling better-sqlite3 native addon
# - curl for healthcheck
# - nodejs + npm for running the app (better-sqlite3 doesn't work with Bun on Linux)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        gcc \
        libc6-dev \
        ca-certificates \
        curl \
        nodejs \
        npm \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies with Bun (build step works fine)
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and build for Node.js runtime
# NITRO_PRESET=node-server ensures the output works with Node, not Bun
COPY . .
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
RUN bun run build

# SQLite database directory
RUN mkdir -p /data
VOLUME ["/data"]

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/data/prod.db

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Run migrations with Node (drizzle-kit needs Node for better-sqlite3)
# Then start the server with Node (Bun can't load better-sqlite3 native addon on Linux)
CMD ["sh", "-c", "npx drizzle-kit migrate && node .output/server/index.mjs"]
