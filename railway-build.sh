#!/bin/bash
# Don't exit on error for migration step
set +e

echo "🚀 Starting Railway build process..."

# Always generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Try to run migrations if DATABASE_URL is set, but don't fail build if it fails
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set - skipping database migration"
  echo "⚠️  Make sure to add a PostgreSQL database in Railway dashboard"
else
  echo "🗄️  Attempting database migrations..."
  npx prisma migrate deploy

  if [ $? -ne 0 ]; then
    echo "⚠️  Database migration failed (database may not be available during build)"
    echo "⚠️  Migrations will run automatically on first application start"
    echo "⚠️  Continuing with build..."
  else
    echo "✅ Database migrations completed successfully"
  fi
fi

# Build Next.js application - fail if this fails
set -e
echo "🏗️  Building Next.js application..."
npx next build

echo "✅ Build completed successfully!"
