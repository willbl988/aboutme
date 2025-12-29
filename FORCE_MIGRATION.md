# How to Force Database Migration

The database migration for tee times tables needs to be applied. Here are several ways to force it:

## Option 1: Via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project** (if not already linked):
   ```bash
   vercel link
   ```

4. **Run migration via Vercel CLI**:
   ```bash
   vercel env pull .env.production
   npx prisma migrate deploy
   ```

   Or use the force migration script:
   ```bash
   npm run db:migrate:force
   ```

## Option 2: Via Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Functions**
3. Create a new **Serverless Function** or use **Deploy Hooks**
4. Or go to **Settings** → **Build & Development Settings**
5. The build command has been updated to: `prisma generate && npx prisma migrate deploy && next build`
6. **Trigger a new deployment** by pushing a commit or manually redeploying

## Option 3: Manual Migration via Vercel CLI (One-time)

Run this command locally with your production DATABASE_URL:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migration
npx prisma migrate deploy
```

Or use the force migration script:
```bash
npm run db:migrate:force
```

## Option 4: Create a Migration Endpoint (Temporary)

You can create a temporary API endpoint to run migrations (remove after use):

1. Create `app/api/admin/migrate/route.ts`:
   ```typescript
   import { NextResponse } from 'next/server'
   import { execSync } from 'child_process'

   export async function POST(request: Request) {
     try {
       // Add authentication check here
       const authHeader = request.headers.get('authorization')
       if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET}`) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }

       execSync('npx prisma migrate deploy', { stdio: 'inherit' })
       return NextResponse.json({ success: true })
     } catch (error: any) {
       return NextResponse.json({ error: error.message }, { status: 500 })
     }
   }
   ```

2. Set `MIGRATION_SECRET` in Vercel environment variables
3. Call the endpoint: `POST /api/admin/migrate` with `Authorization: Bearer <secret>`
4. **Delete the endpoint after migration is complete**

## Option 5: Force via Build Command

The build command has been updated to always run migrations. Simply:

1. **Push a new commit** (even a small change)
2. Vercel will automatically run the build command which includes `npx prisma migrate deploy`
3. The migration will be applied during the build

## Current Build Command

The build command in `vercel.json` and `package.json` is now:
```bash
prisma generate && npx prisma migrate deploy && next build
```

This will:
- Generate Prisma Client
- **Always run migrations** (will fail if there are issues)
- Build the Next.js app

## Troubleshooting

### Migration fails with "prepared statement does not exist"
This is a connection pooling issue. Make sure your `DATABASE_URL` uses port `6543` (Supabase pooler) with `pgbouncer=true`:
```
postgresql://user:pass@host:6543/db?pgbouncer=true&connection_limit=1
```

### Migration times out
- Increase timeout in build command (not recommended)
- Run migration manually via Option 1 or 3
- Check database connection limits

### Migration says "No pending migrations"
This means the migration has already been applied. Check your database to confirm the `TeeTime` and `TeeTimeBooking` tables exist.

## Verify Migration Success

After migration, verify the tables exist:

```sql
-- Run in your database (via Supabase SQL Editor or psql)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('TeeTime', 'TeeTimeBooking');
```

You should see both tables listed.

