#!/bin/bash
# Force database migration script
# This script will attempt to run migrations with better error handling

set -e

echo "🔧 Starting database migration..."

# Generate Prisma Client first
echo "📦 Generating Prisma Client..."
npx prisma generate

# Check migration status
echo "📊 Checking migration status..."
npx prisma migrate status || echo "⚠️  Migration status check failed, continuing..."

# Deploy migrations
echo "🚀 Deploying migrations..."
npx prisma migrate deploy

echo "✅ Migration complete!"

