#!/bin/bash
set -e

echo "🚀 Starting Railway build process..."

# Always generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Only run migrations if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set - skipping database migration"
  echo "⚠️  Make sure to add a PostgreSQL database in Railway dashboard"
else
  echo "🗄️  Running database migrations..."
  npx prisma migrate deploy
fi

# Build Next.js application
echo "🏗️  Building Next.js application..."
npx next build

echo "✅ Build completed successfully!"
