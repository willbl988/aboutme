#!/bin/bash
# Migration script with timeout and better error handling

set -e

echo "🔧 Starting database migration with timeout..."

# Generate Prisma Client first
echo "📦 Generating Prisma Client..."
npx prisma generate

# Try migration with timeout
echo "🚀 Attempting to deploy migrations (60s timeout)..."
timeout 60 npx prisma migrate deploy || {
  echo "⚠️  Migration timed out or failed"
  echo "💡 Use the /api/admin/migrate endpoint after deployment instead"
  exit 0  # Don't fail the build
}

echo "✅ Migration complete!"

