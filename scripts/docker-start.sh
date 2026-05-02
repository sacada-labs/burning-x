#!/usr/bin/env bash
set -e

echo "🚀 Starting TanStack Start application..."

# Run Drizzle migrations when the drizzle folder exists.
if [ -d "./drizzle" ] && [ -n "$DATABASE_URL" ]; then
	echo "📦 Running database migrations..."
	bun run db:migrate
fi

echo "🌐 Starting server on port ${PORT:-3000}..."
exec bun run .output/server/index.mjs
