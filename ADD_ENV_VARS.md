# How to Add Environment Variables to Existing Vercel Project

## Method 1: Via Vercel Dashboard (Easiest)

### Step 1: Go to Your Project
1. Go to https://vercel.com/dashboard
2. Click on your **golf-tracker** project (or whatever you named it)

### Step 2: Open Settings
1. Click on the **"Settings"** tab at the top
2. Click on **"Environment Variables"** in the left sidebar

### Step 3: Add Environment Variables

Add these two variables:

#### Variable 1: DATABASE_URL
1. Click **"Add New"** button
2. **Key**: `DATABASE_URL`
3. **Value**: `postgresql://postgres.dmxqthvbedliccwnouqu:toNwYhfqhXCE3ZPa@aws-0-us-west-2.pooler.supabase.com:5432/postgres`
4. **Environments**: Check all three:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
5. Click **"Save"**

#### Variable 2: NODE_ENV
1. Click **"Add New"** button again
2. **Key**: `NODE_ENV`
3. **Value**: `production`
4. **Environments**: Check all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Step 4: Redeploy

After adding environment variables, you need to redeploy:

1. Go to the **"Deployments"** tab
2. Find your latest deployment
3. Click the **"⋯"** (three dots) menu
4. Click **"Redeploy"**
5. Confirm by clicking **"Redeploy"** again

**OR** simply push a new commit to trigger a new deployment:
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push
```

## Method 2: Via Vercel CLI

### Step 1: Install Vercel CLI (if not already)
```bash
npm i -g vercel
```

### Step 2: Login
```bash
vercel login
```

### Step 3: Link Your Project
```bash
cd /Users/willb/Repos/aboutme
vercel link
```
- Select your existing project when prompted

### Step 4: Add Environment Variables
```bash
# Add DATABASE_URL
vercel env add DATABASE_URL production
# When prompted, paste: postgresql://postgres.dmxqthvbedliccwnouqu:toNwYhfqhXCE3ZPa@aws-0-us-west-2.pooler.supabase.com:5432/postgres

# Add to preview and development too
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Add NODE_ENV
vercel env add NODE_ENV production
# When prompted, paste: production

# Add to preview and development too
vercel env add NODE_ENV preview
vercel env add NODE_ENV development
```

### Step 5: Redeploy
```bash
vercel --prod
```

## Verify Environment Variables Are Set

### Via Dashboard:
1. Go to Settings → Environment Variables
2. You should see both `DATABASE_URL` and `NODE_ENV` listed

### Via CLI:
```bash
vercel env ls
```

## Important Notes

- ⚠️ **Environment variables are only applied on NEW deployments**
- After adding env vars, you MUST redeploy for them to take effect
- The app will fail until you add `DATABASE_URL` (it needs the database connection)
- Make sure to add env vars to all environments (Production, Preview, Development)

## After Adding Environment Variables

1. **Redeploy** your project (see Step 4 above)
2. **Wait for deployment** to complete (2-3 minutes)
3. **Test your app** - it should now connect to the database
4. **Run migrations** if needed (see DEPLOY_TO_VERCEL.md)

## Troubleshooting

### App Still Not Working After Adding Env Vars
- Make sure you **redeployed** after adding variables
- Check deployment logs in Vercel dashboard for errors
- Verify the `DATABASE_URL` is correct (copy-paste from Supabase)
- Make sure you added env vars to **all environments** (Production, Preview, Development)

### Can't See Environment Variables
- Make sure you're in the correct project
- Check you're looking in Settings → Environment Variables
- Refresh the page

