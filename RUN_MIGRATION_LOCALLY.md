# Run Migration Locally with Production Database

Since Vercel serverless functions can't run npm commands, we'll run the migration locally using your production DATABASE_URL.

## Step 1: Install Vercel CLI (if needed)

```bash
npm i -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

## Step 3: Link Your Project

```bash
cd /Users/willb/Repos/aboutme
vercel link
```

Select your project when prompted.

## Step 4: Pull Environment Variables

```bash
vercel env pull .env.production
```

This creates a `.env.production` file with your Vercel environment variables.

## Step 5: Run Migration

```bash
# Set the production DATABASE_URL
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"')

# Run the migration
npx prisma migrate deploy
```

Or use the force migration script:

```bash
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"')
npm run db:migrate:force
```

## Step 6: Verify Success

You should see:
```
✅ Applied migration: <migration_name>
```

## Alternative: One-Line Command

```bash
vercel env pull .env.production && export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"') && npx prisma migrate deploy
```

## Verify Tables Created

After migration, you can verify the tables exist by checking your database or running:

```bash
npx prisma studio
```

Then open the TeeTime and TeeTimeBooking tables.

