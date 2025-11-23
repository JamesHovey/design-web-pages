#!/bin/bash
set -e

echo "🚀 Starting application..."

# Run database migrations on startup
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️  Running database migrations..."
  npx prisma migrate deploy
  echo "✅ Database migrations completed"
else
  echo "⚠️  DATABASE_URL not set - skipping migrations"
fi

# Start Next.js server
echo "🌐 Starting Next.js server..."
npx next start
