# Deploy to Vercel - Step by Step Guide

This guide will help you deploy your Golf Tracker app to the internet using Vercel (free hosting).

## Prerequisites

- ✅ Your code is in a Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Your Supabase database is set up and working
- ✅ You have a GitHub account (or GitLab/Bitbucket)

## Step 1: Push Your Code to GitHub

### 1.1 Initialize Git (if not already done)

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit - Golf Tracker app"
```

### 1.2 Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - Name: `golf-tracker` (or any name)
   - Make it **Public** or **Private** (your choice)
   - **Don't** initialize with README (you already have files)
3. Click "Create repository"

### 1.3 Push Your Code

GitHub will show you commands. Run these (replace with your repo URL):

```bash
git remote add origin https://github.com/YOUR_USERNAME/golf-tracker.git
git branch -M main
git push -u origin main
```

**Important**: Make sure `.env` is in `.gitignore` (it should be - never commit passwords!)

## Step 2: Deploy to Vercel

### 2.1 Sign Up for Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Sign up with GitHub (easiest option)
4. Authorize Vercel to access your GitHub

### 2.2 Import Your Project

1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `golf-tracker` repository
3. Click **"Import"**

### 2.3 Configure Project Settings

Vercel will auto-detect Next.js. You need to:

1. **Framework Preset**: Should be "Next.js" (auto-detected)
2. **Root Directory**: Leave as `./` (default)
3. **Build Command**: Should be `npm run build` (default)
4. **Output Directory**: Leave as `.next` (default)
5. **Install Command**: Should be `npm install` (default)

### 2.4 Add Environment Variables

**This is critical!** Click **"Environment Variables"** and add:

1. **DATABASE_URL**
   - Value: Your Supabase connection string
   - Example: `postgresql://postgres.dmxqthvbedliccwnouqu:YOUR_PASSWORD@aws-0-us-west-2.pooler.supabase.com:5432/postgres`
   - Make sure to use your actual password!

2. **NODE_ENV**
   - Value: `production`

3. Click **"Add"** for each variable

### 2.5 Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for the build to complete
3. You'll see a success message with your live URL!

## Step 3: Run Database Migrations in Production

After deployment, you need to run migrations on your production database:

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.production
   ```

5. Run migrations:
   ```bash
   DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npx prisma migrate deploy
   ```

### Option B: Using Supabase SQL Editor

1. Go to your Supabase dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"**
4. Copy the SQL from your migration file:
   - Look in `prisma/migrations/[timestamp]_init/migration.sql`
   - Copy the contents
5. Paste into SQL Editor and click **"Run"**

## Step 4: Test Your Deployed App

1. Visit your Vercel URL (something like `https://golf-tracker.vercel.app`)
2. Try logging in with your test account
3. Create a course
4. Start a round

## Step 5: Set Up Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Make sure all environment variables are set
- Verify `DATABASE_URL` is correct

### Database Connection Errors

- Double-check `DATABASE_URL` in Vercel environment variables
- Make sure you're using the connection pooler URL
- Verify your Supabase project is active

### Migrations Not Running

- Run migrations manually using Option A or B above
- Check that Prisma Client is generated in the build

### App Works Locally But Not on Vercel

- Check environment variables are set correctly
- Verify database allows connections from Vercel's IPs (should be automatic)
- Check Vercel build logs for errors

## Updating Your App

After making changes:

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```

2. Vercel will automatically deploy the new version!

## Security Notes

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Use environment variables in Vercel for all secrets
- ✅ Your database password is stored securely in Vercel
- ✅ HTTPS is automatic with Vercel

## Next Steps

- Set up automatic deployments from GitHub
- Configure custom domain
- Set up monitoring/analytics
- Add error tracking (Sentry, etc.)

---

**Your app will be live at**: `https://your-project-name.vercel.app`

Enjoy your live Golf Tracker app! 🎉

