# Database Setup - Step by Step

You're seeing this error because `DATABASE_URL` is not set. Follow these steps:

## Option 1: Use Supabase (Easiest - Free)

1. **Go to Supabase**: https://supabase.com
2. **Sign up** for a free account
3. **Create a new project**:
   - Click "New Project"
   - Enter project name (e.g., "golf-tracker")
   - Enter a database password (save this!)
   - Choose a region
   - Click "Create new project"
   - Wait 2-3 minutes for setup

4. **Get your connection string**:
   - Go to **Settings** → **Database**
   - Scroll to "Connection string"
   - Select "URI" tab
   - Copy the connection string
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

5. **Update your .env file**:
   ```bash
   # Edit .env file
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```
   Replace `YOUR_ACTUAL_PASSWORD` with the password you set when creating the project.

## Option 2: Use Neon (Free)

1. **Go to Neon**: https://neon.tech
2. **Sign up** for a free account
3. **Create a new project**
4. **Copy the connection string** from the dashboard
5. **Add to .env**:
   ```bash
   DATABASE_URL="your-neon-connection-string"
   ```

## Option 3: Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create database**:
   ```bash
   createdb golf_tracker
   ```

2. **Update .env**:
   ```bash
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/golf_tracker?schema=public"
   ```

## After Setting DATABASE_URL

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Create database tables**:
   ```bash
   npm run db:migrate
   ```
   When prompted, name the migration: `init`

3. **Create your first user**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
   ```

4. **Restart your dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

5. **Login** with the credentials you created!

## Verify It's Working

Check your terminal - you should no longer see the DATABASE_URL error. If you do, make sure:
- The `.env` file is in the root directory (same level as `package.json`)
- The `DATABASE_URL` value is in quotes
- There are no extra spaces or characters
- You've restarted the dev server after creating/updating `.env`

