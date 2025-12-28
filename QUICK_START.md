# Quick Start - Fix Login Error

If you're getting an "Internal server error" when trying to login, follow these steps:

## Step 1: Set Up Database Connection

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Edit `.env` and add your database URL. Choose one:

### Option A: Use Supabase (Free, Recommended)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add to `.env`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres?schema=public"
```

### Option B: Use Neon (Free)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. Add to `.env`:
```env
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Step 2: Set Up Database Tables

Run these commands:

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:migrate
```

When prompted for a migration name, type: `init`

## Step 3: Create Your First User

You have two options:

### Option A: Use the Registration API (Easiest)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","name":"Your Name","password":"yourpassword"}'
```

### Option B: Use Prisma Studio

1. Open Prisma Studio:
```bash
npm run db:studio
```

2. Go to http://localhost:5555
3. Click on "User" table
4. Click "Add record"
5. Fill in:
   - `email`: your email
   - `name`: your name
   - `password`: You need to hash this first (see below)

To hash a password, run:
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('yourpassword',10).then(h=>console.log(h))"
```

Copy the hash and use it as the password in Prisma Studio.

## Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Try Logging In

Go to http://localhost:3000/login and use the credentials you created.

## Troubleshooting

### "Can't reach database server"
- Check your `DATABASE_URL` is correct
- Make sure your database is running
- For cloud databases, check if your IP needs to be whitelisted

### "Database not initialized"
- Run `npm run db:migrate` to create tables

### "Prisma Client not generated"
- Run `npm run db:generate`

### Still having issues?
- Check the terminal/console for detailed error messages
- Make sure all dependencies are installed: `npm install`
- Clear Next.js cache: `rm -rf .next`

