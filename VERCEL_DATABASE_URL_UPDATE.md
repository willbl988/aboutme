# Update DATABASE_URL in Vercel

## Current Issue
Your DATABASE_URL in Vercel is using port **5432** (direct connection) which causes connection pool errors.

## Solution
Update it to use port **6543** (connection pooler) with pooling parameters.

## Steps to Update in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` in the list
5. Click **Edit** (or the three dots menu → Edit)
6. Replace the value with:

```
postgresql://postgres.dmxqthvbedliccwnouqu:toNwYhfqhXCE3ZPa@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Key changes:**
- Changed port from `:5432` to `:6543`
- Added `?pgbouncer=true&connection_limit=1` at the end

7. Make sure it's enabled for **Production**, **Preview**, and **Development** environments
8. Click **Save**
9. **Redeploy** your application (or wait for automatic redeploy on next push)

## Alternative: Using Vercel CLI

If you have Vercel CLI installed and logged in:

```bash
npx vercel env add DATABASE_URL production
# When prompted, paste the connection string above
```

## Verify the Fix

After updating and redeploying:
- The build should complete successfully
- No more "MaxClientsInSessionMode" errors
- Database connections should work properly

