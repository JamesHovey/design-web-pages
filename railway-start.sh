#!/bin/bash
set -e

echo "🚀 Starting application..."

# Run database migrations on startup
if [ -n "$DATABASE_URL" ]; then
  echo "🗄️  Running database migrations..."

  # Try prisma migrate deploy first
  if npx prisma migrate deploy 2>/dev/null; then
    echo "✅ Database migrations completed"
  else
    echo "⚠️  Prisma migrate failed, trying fallback migration script..."
    # Fallback to custom migration script
    if node scripts/run-migrations.js; then
      echo "✅ Fallback migrations completed"
    else
      echo "❌ Migration failed, but continuing..."
    fi
  fi
else
  echo "⚠️  DATABASE_URL not set - skipping migrations"
fi

# Start Next.js server
echo "🌐 Starting Next.js server..."
npx next start
