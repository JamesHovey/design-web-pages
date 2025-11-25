#!/bin/bash
set -e

echo "🚀 Starting application..."

# Detect Chromium executable for Puppeteer
# In Railway/Nixpacks, Chromium is installed via nix
if command -v chromium &> /dev/null; then
  export PUPPETEER_EXECUTABLE_PATH=$(command -v chromium)
  echo "✅ Found Chromium at: $PUPPETEER_EXECUTABLE_PATH"
elif command -v chromium-browser &> /dev/null; then
  export PUPPETEER_EXECUTABLE_PATH=$(command -v chromium-browser)
  echo "✅ Found Chromium at: $PUPPETEER_EXECUTABLE_PATH"
elif command -v google-chrome &> /dev/null; then
  export PUPPETEER_EXECUTABLE_PATH=$(command -v google-chrome)
  echo "✅ Found Chrome at: $PUPPETEER_EXECUTABLE_PATH"
else
  echo "⚠️  No Chromium/Chrome found - Puppeteer will use bundled version"
fi

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
