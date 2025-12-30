# How to Force Run Database Migration in Vercel

## Option 1: Use the Migration API Endpoint (Easiest)

I've created a temporary API endpoint that you can call to run migrations.

### Step 1: Set Migration Secret in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `MIGRATION_SECRET`
   - **Value**: `your-secret-password-here` (use a strong random string)
   - **Environment**: Production (and Preview if needed)
4. Click **Save**

### Step 2: Call the Migration Endpoint

After your next deployment, call this endpoint:

```bash
curl -X POST https://your-domain.vercel.app/api/admin/migrate \
  -H "Authorization: Bearer your-secret-password-here"
```

Or use a tool like Postman, or run this in your browser console (after deployment):

```javascript
fetch('/api/admin/migrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-secret-password-here'
  }
})
.then(r => r.json())
.then(console.log)
```

### Step 3: Verify Success

You should see a response like:
```json
{
  "success": true,
  "message": "Migration completed successfully",
  "output": "..."
}
```

### Step 4: Delete the Endpoint (Important!)

After migration is complete, **delete** `app/api/admin/migrate/route.ts` for security.

---

## Option 2: Use Vercel CLI (Recommended for One-Time)

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login and Link

```bash
vercel login
vercel link
```

### Step 3: Pull Environment Variables

```bash
vercel env pull .env.production
```

This creates a `.env.production` file with your Vercel environment variables.

### Step 4: Run Migration Locally

```bash
# Use the production DATABASE_URL
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)

# Run migration
npx prisma migrate deploy
```

Or use the force migration script:

```bash
npm run db:migrate:force
```

---

## Option 3: Force via Build Command (Automatic)

The build command has been updated to always run migrations. Simply:

1. **Make a small change** (like adding a comment) and push:
   ```bash
   git commit --allow-empty -m "Trigger migration"
   git push
   ```

2. Vercel will automatically run:
   ```bash
   prisma generate && npx prisma migrate deploy && next build
   ```

3. **Check the build logs** in Vercel dashboard to see if migration succeeded

---

## Option 4: Use Vercel Deploy Hooks

1. Go to **Settings** → **Deploy Hooks**
2. Create a new hook (optional, for triggering deployments)
3. Or just push a commit to trigger a new deployment with the updated build command

---

## Troubleshooting

### Migration fails with connection error

Check your `DATABASE_URL` in Vercel:
- Should use port `6543` for Supabase pooler
- Should include `pgbouncer=true&connection_limit=1`
- Format: `postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=1`

### Migration says "No pending migrations"

This means migrations are already applied. Verify by checking if `TeeTime` and `TeeTimeBooking` tables exist in your database.

### Migration times out

- The API endpoint approach (Option 1) has no timeout
- Build command has a default timeout, but API endpoint runs independently

### Check Migration Status

After migration, verify in your database:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('TeeTime', 'TeeTimeBooking');
```

---

## Quick Start (Recommended)

**Fastest way:**

1. Set `MIGRATION_SECRET` in Vercel environment variables
2. Push the current code (includes the migration endpoint)
3. After deployment, run:
   ```bash
   curl -X POST https://your-domain.vercel.app/api/admin/migrate \
     -H "Authorization: Bearer your-secret-password-here"
   ```
4. Delete `app/api/admin/migrate/route.ts` after success

---

## Security Note

⚠️ **IMPORTANT**: The migration endpoint is temporary. Delete it after migration is complete to prevent unauthorized access.

