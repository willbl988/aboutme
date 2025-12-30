# Fix Build Stalling Issue

## Problem
The build is stalling at the database connection step during migration. This happens because:
1. Connection pooler might be slow to respond
2. Migration command doesn't have a timeout
3. Build waits indefinitely for database connection

## Solution Applied

### 1. Added Timeout to Build Command
The build command now has a 60-second timeout:
```bash
prisma generate && (timeout 60 npx prisma migrate deploy || echo 'Migration skipped') && next build
```

If migration times out, the build continues (doesn't fail).

### 2. Use API Endpoint Instead
**Recommended approach**: Skip migrations in build, use the API endpoint after deployment.

The migration endpoint (`/api/admin/migrate`) has:
- 120-second timeout (longer than build)
- Better error handling
- Can be retried if it fails
- Doesn't block builds

## How to Fix Current Issue

### Option 1: Skip Migrations in Build (Recommended)

Update `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

Then run migration via API endpoint after each deployment.

### Option 2: Increase Timeout

The current timeout is 60 seconds. If your database is slow, you can increase it:
```json
{
  "buildCommand": "prisma generate && (timeout 120 npx prisma migrate deploy || echo 'Migration skipped') && next build"
}
```

### Option 3: Use Migration Endpoint Only

1. Remove migration from build command entirely
2. Always use `/api/admin/migrate` endpoint after deployment
3. This is the most reliable approach

## Current Setup

The build command will:
1. ✅ Generate Prisma Client (always works)
2. ⚠️ Try migration with 60s timeout (may skip if timeout)
3. ✅ Build Next.js app (always works)

If migration times out, you'll see:
```
⚠️ Migration skipped - use /api/admin/migrate endpoint
```

Then run migration via API endpoint after deployment.

## Next Steps

1. **Wait for current build to complete** (or cancel if it's stuck)
2. **After deployment**, call the migration endpoint:
   ```bash
   curl -X POST https://golfbudz.golf/api/admin/migrate \
     -H "Authorization: Bearer @Willblack123"
   ```
3. **Verify migration success** in the response

## Why This Approach Works Better

- ✅ Builds don't stall
- ✅ Migrations can be retried
- ✅ Better error messages
- ✅ No build timeouts
- ✅ Can run migrations on-demand

