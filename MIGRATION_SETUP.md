# Migration Setup - Quick Guide

## Step 1: Set MIGRATION_SECRET in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your project (golfbudz)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Key**: `MIGRATION_SECRET`
   - **Value**: `@Willblack123`
   - **Environment**: Select **Production** (and **Preview** if you want)
6. Click **Save**

## Step 2: Wait for Deployment

After the current code push, wait for Vercel to finish deploying (check the Vercel dashboard).

## Step 3: Run the Migration

Once deployed, run this command:

```bash
curl -X POST https://golfbudz.golf/api/admin/migrate \
  -H "Authorization: Bearer @Willblack123"
```

Or test in browser console (on your site):

```javascript
fetch('/api/admin/migrate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer @Willblack123'
  }
})
.then(r => r.json())
.then(console.log)
```

## Step 4: Verify Success

You should see:
```json
{
  "success": true,
  "message": "Migration completed successfully"
}
```

## Step 5: Delete the Endpoint (After Migration)

For security, delete the migration endpoint after migration is complete:
- Delete: `app/api/admin/migrate/route.ts`

---

## Alternative: Check Build Logs

The build command now includes migrations, so you can also:
1. Check the Vercel build logs
2. Look for "Deploying migrations..." in the output
3. Verify it says "Migration completed successfully"

