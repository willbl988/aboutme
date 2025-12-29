# Fix: MaxClientsInSessionMode Error

## Problem
You're seeing this error:
```
FATAL: MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

This happens when using Supabase's **direct connection** (port 5432) which has strict connection limits.

## Solution: Use Supabase Connection Pooler

Supabase provides a connection pooler that can handle many more connections. You need to use port **6543** instead of **5432**.

### Step 1: Get Your Pooler Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll to **"Connection string"** section
4. Click on the **"Connection pooling"** tab (NOT "URI")
5. Select **"Transaction"** mode (recommended for Prisma)
6. Copy the connection string - it should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
   ```
   **Note**: Port is **6543** (not 5432)

### Step 2: Update Your DATABASE_URL

#### For Local Development (.env file):
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

#### For Vercel (Environment Variables):
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. **IMPORTANT**: Make sure it uses port **6543** (NOT 5432) and includes `?pgbouncer=true&connection_limit=1`
4. Example (correct format):
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
   **Note**: Port is **6543**, not 5432!
5. If your current DATABASE_URL uses port 5432, change it to 6543
6. **Redeploy** your application after updating

**Quick Check**: Your DATABASE_URL should contain `:6543` not `:5432`

### Important Parameters:
- `pgbouncer=true`: Tells Prisma to use connection pooling mode
- `connection_limit=1`: Limits each Prisma client instance to 1 connection (required for pooler)

### Step 3: Verify the Fix

After updating the connection string:
1. Restart your development server (if local)
2. Try logging in again
3. The error should be resolved

## Alternative: Increase Pool Size (Supabase Pro Plan)

If you're on Supabase Pro plan, you can increase the `pool_size` in your database settings, but using the connection pooler (port 6543) is the recommended solution.

## Why This Happens

- **Direct connection (port 5432)**: Each connection uses a full database session, limited to ~100 connections
- **Connection pooler (port 6543)**: Shares connections efficiently, can handle 1000s of concurrent requests

Prisma works best with the connection pooler in Transaction mode.

