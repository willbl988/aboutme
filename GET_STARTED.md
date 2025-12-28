# Get Started - Complete Setup Guide

Follow these steps to get your Golf Tracker app running with a database.

## Step 1: Set Up a Free Database (5 minutes)

We'll use **Supabase** - it's free and easy to set up.

### 1.1 Create Supabase Account
1. Go to **https://supabase.com**
2. Click **"Start your project"** or **"Sign up"**
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

### 1.2 Create a New Project
1. Click **"New Project"** button
2. Fill in:
   - **Name**: `golf-tracker` (or any name you like)
   - **Database Password**: Create a strong password (SAVE THIS - you'll need it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (Hobby)
3. Click **"Create new project"**
4. Wait 2-3 minutes for the project to be created

### 1.3 Get Your Database Connection String
1. Once your project is ready, go to **Settings** (gear icon in left sidebar)
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"** section
4. Click on the **"URI"** tab
5. You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Copy this entire string** (you'll need it in the next step)

## Step 2: Configure Your App (2 minutes)

### 2.1 Update .env File
1. Open the `.env` file in your project root (I created it for you)
2. Find the line that says:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/golf_tracker?schema=public"
   ```
3. Replace it with your Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```
   **Important**: Replace `YOUR_PASSWORD` with the password you created in Step 1.2

4. Save the file

### 2.2 Install Dependencies (if not done)
```bash
npm install
```

## Step 3: Set Up Database Tables (1 minute)

Run these commands in your terminal:

```bash
# Generate Prisma Client (database tools)
npm run db:generate

# Create database tables
npm run db:migrate
```

When prompted for a migration name, type: `init` and press Enter

You should see: ✅ "Migration applied successfully"

## Step 4: Create Your First User Account (1 minute)

You need to create a user account before you can login. Run this command:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","name":"Your Name","password":"yourpassword123"}'
```

**Replace**:
- `your@email.com` with your actual email
- `Your Name` with your name
- `yourpassword123` with a password (at least 6 characters)

You should see a response like:
```json
{"success":true,"user":{"id":"...","email":"your@email.com","name":"Your Name"}}
```

## Step 5: Start Your App (30 seconds)

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. If it's already running, restart it to pick up the new .env file:
   - Press `Ctrl+C` to stop
   - Run `npm run dev` again

3. Open your browser to: **http://localhost:3000**

## Step 6: Login!

1. You'll be redirected to the login page
2. Enter the email and password you used in Step 4
3. Click "Sign In"
4. You should now be logged in! 🎉

## What's Next?

- Create golf courses
- Start tracking rounds
- Add players and scores

## Troubleshooting

### "Can't reach database server"
- Double-check your `DATABASE_URL` in `.env`
- Make sure you replaced `YOUR_PASSWORD` with your actual Supabase password
- Verify the connection string is in quotes: `DATABASE_URL="..."`

### "Migration failed"
- Make sure your database is accessible
- Check that `DATABASE_URL` is correct
- Try running `npm run db:generate` again first

### "User already exists"
- That email is already registered
- Try a different email or use the login page instead

### Still having issues?
- Check the terminal for error messages
- Make sure all steps were completed
- Verify your `.env` file has the correct `DATABASE_URL`

## Quick Reference

**Your .env file should look like:**
```env
DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
NODE_ENV="development"
```

**Commands you'll use:**
- `npm run dev` - Start development server
- `npm run db:generate` - Generate database client
- `npm run db:migrate` - Create/update database tables
- `npm run db:studio` - Open database GUI (optional)

---

**Need help?** Check the error messages in your terminal - they'll tell you exactly what's wrong!

