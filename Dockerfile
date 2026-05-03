FROM oven/bun:1

WORKDIR /app

# Install build tools for compiling better-sqlite3 native addon
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        python3 \
        make \
        g++ \
        gcc \
        libc6-dev \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
ENV NODE_ENV=production
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

# Just start the server — no migrations for now
CMD ["bun", ".output/server/index.mjs"]
