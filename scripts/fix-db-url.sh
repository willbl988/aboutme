#!/bin/bash
# Script to convert DATABASE_URL to use connection pooler
# This ensures migrations and runtime both use the pooler

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set"
  exit 1
fi

# Check if already using pooler
if echo "$DATABASE_URL" | grep -q ":6543"; then
  echo "DATABASE_URL already uses connection pooler (port 6543)"
  exit 0
fi

# Convert port 5432 to 6543
NEW_URL=$(echo "$DATABASE_URL" | sed 's/:5432/:6543/')

# Add pooling parameters if not present
if echo "$NEW_URL" | grep -q "pgbouncer=true"; then
  echo "Connection string already has pgbouncer=true"
else
  if echo "$NEW_URL" | grep -q "?"; then
    NEW_URL="${NEW_URL}&pgbouncer=true&connection_limit=1"
  else
    NEW_URL="${NEW_URL}?pgbouncer=true&connection_limit=1"
  fi
fi

echo "Updated DATABASE_URL:"
echo "$NEW_URL"
echo ""
echo "Update this in Vercel:"
echo "1. Go to Vercel Dashboard → Project → Settings → Environment Variables"
echo "2. Update DATABASE_URL to: $NEW_URL"
echo "3. Redeploy your application"

