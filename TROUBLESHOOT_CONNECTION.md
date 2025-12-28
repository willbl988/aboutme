# Troubleshooting Supabase Connection

If you're getting "Can't reach database server" errors, try these steps:

## Step 1: Check Supabase Project Status

1. Go to https://supabase.com/dashboard
2. Open your project
3. Make sure the project status shows **"Active"** (not "Paused" or "Setting up")
4. If it's still setting up, wait a few more minutes

## Step 2: Check Database Settings

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to **"Connection string"** section
3. Make sure you're copying from the **"URI"** tab
4. Check if there are any **IP restrictions** enabled
   - If IP restrictions are on, you may need to:
     - Disable them temporarily, OR
     - Add your current IP address to the allowlist

## Step 3: Try Different Connection Methods

### Option A: Direct Connection (Current)
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

### Option B: Connection Pooler (Port 6543)
In Supabase dashboard, go to Settings → Database → Connection pooling
Use the connection string from there (usually port 6543)

### Option C: Session Mode Connection Pooler
Look for "Session mode" connection string in Supabase dashboard

## Step 4: Check Your Network

- Make sure you're not behind a corporate firewall blocking port 5432
- Try from a different network (mobile hotspot) to test
- Check if your ISP blocks database connections

## Step 5: Verify Connection String Format

Your connection string should look exactly like this (with your actual password):
```
postgresql://postgres:YOUR_PASSWORD@db.dmxqthvbedliccwnouqu.supabase.co:5432/postgres?sslmode=require
```

Make sure:
- No extra spaces
- Password is correct
- All parts are included
- It's in quotes in the .env file

## Step 6: Test Connection with psql (Optional)

If you have PostgreSQL client installed:
```bash
psql "postgresql://postgres:toNwYhfqhXCE3ZPa@db.dmxqthvbedliccwnouqu.supabase.co:5432/postgres?sslmode=require"
```

If this works, the issue is with Prisma. If it doesn't, the issue is network/connection.

## Step 7: Alternative - Use Supabase's Connection Pooler

1. Go to Supabase dashboard
2. Settings → Database → Connection pooling
3. Copy the "Session mode" connection string
4. Use that in your .env file instead

## Still Not Working?

1. **Check Supabase status page**: https://status.supabase.com
2. **Try creating a new Supabase project** (sometimes projects can have issues)
3. **Contact Supabase support** through their dashboard
4. **Try a different database provider** (Neon, Railway, etc.)

## Quick Test

Run this to test if the connection string is being read correctly:
```bash
node -e "console.log(process.env.DATABASE_URL)" 
```
(You need to load it from .env first, but this helps verify the format)

