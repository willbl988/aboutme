# Quick Setup Guide

Follow these steps to get your Golf Tracker application running with a database.

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Next.js and React
- Prisma (database ORM)
- PostgreSQL client
- bcryptjs (password hashing)
- All other dependencies

## Step 2: Set Up Database

### Option A: Use Supabase (Recommended - Free)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to be created (takes ~2 minutes)
4. Go to **Settings** → **Database**
5. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with your database password (shown when you created the project)

### Option B: Use Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string from the dashboard

### Option C: Local PostgreSQL

If you have PostgreSQL installed:

```bash
createdb golf_tracker
```

## Step 3: Configure Environment Variables

1. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

2. Edit `.env` and add your database URL:

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
NODE_ENV="development"
```

**For Supabase**, it will look like:
```env
DATABASE_URL="postgresql://postgres:your-password@db.xxxxx.supabase.co:5432/postgres?schema=public"
```

**For Neon**, it will look like:
```env
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Step 4: Set Up Database Schema

Run these commands to create the database tables:

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables (migrations)
npm run db:migrate
```

When prompted for a migration name, type: `init`

## Step 5: Start the Development Server

```bash
npm run dev
```

## Step 6: Create Your First Account

1. Open [http://localhost:3000](http://localhost:3000)
2. You'll be redirected to the login page
3. Since there's no registration page yet, you can create a user via Prisma Studio:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555` where you can:
1. Click on the **User** table
2. Click **Add record**
3. Fill in:
   - `email`: your email
   - `name`: your name
   - `password`: (we'll hash this - see below)

**Important**: Passwords need to be hashed. For now, you can use this quick script:

Create a file `hash-password.js`:
```javascript
const bcrypt = require('bcryptjs');
const password = process.argv[2];
bcrypt.hash(password, 10).then(hash => console.log(hash));
```

Then run:
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('yourpassword',10).then(h=>console.log(h))"
```

Copy the hash and use it as the password in Prisma Studio.

**Or**, you can add a registration endpoint (already created at `/api/auth/register`) and use it via curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","name":"Your Name","password":"yourpassword"}'
```

## Step 7: You're Ready!

Now you can:
- Log in with your account
- Create golf courses
- Start rounds
- Track scores

## Troubleshooting

### "Can't reach database server"
- Check your `DATABASE_URL` is correct
- For cloud databases, make sure your IP is allowed (usually automatic)
- Check if the database is running (for local PostgreSQL)

### "Migration failed"
- Make sure your database is empty or you're okay with resetting it
- Check database permissions
- Verify the connection string

### "Prisma Client not generated"
- Run `npm run db:generate` again
- Make sure `node_modules` is installed: `npm install`

## Next Steps

- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Customize the application to your needs
- Add more features!

