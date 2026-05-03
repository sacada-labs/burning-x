FROM oven/bun:1

WORKDIR /app

# Install build tools for compiling native addons
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
ENV HOST=0.0.0.0
ENV DATABASE_URL=/data/prod.db

EXPOSE 3000

# Use exec so bun is PID 1 and receives signals properly
CMD ["sh", "-c", "bun scripts/migrate.ts && exec bun .output/server/index.mjs"]
