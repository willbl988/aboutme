# How to Find Your Supabase Connection String

## Step-by-Step Instructions

### 1. Go to Your Supabase Dashboard
- Open: https://supabase.com/dashboard
- You should see your project listed (the one you just created)

### 2. Click on Your Project
- Click on the project name to open it

### 3. Go to Settings
- Look at the **left sidebar**
- Click on the **gear icon (⚙️)** at the bottom - this is "Settings"
- Or click on **"Project Settings"** if you see it

### 4. Click on "Database"
- In the Settings menu, click on **"Database"** (it's in the left submenu)

### 5. Find "Connection string"
- Scroll down on the Database settings page
- Look for a section called **"Connection string"** or **"Connection pooling"**
- You'll see tabs: **"URI"**, **"JDBC"**, **"Golang"**, etc.
- Click on the **"URI"** tab

### 6. Copy the Connection String
- You'll see something like:
  ```
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
  ```
- OR it might look like:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.dmxqthvbedliccwnouqu.supabase.co:5432/postgres
  ```

### 7. Replace [YOUR-PASSWORD]
- The connection string will have `[YOUR-PASSWORD]` placeholder
- Replace it with the **database password** you set when creating the project
- This is the password you entered in Step 2 when creating the project

### Alternative: If You Can't Find It

If you can't find the connection string in Settings, you can construct it manually:

Based on your project URL: `https://dmxqthvbedliccwnouqu.supabase.co`

Your connection string format should be:
```
postgresql://postgres:YOUR_PASSWORD@db.dmxqthvbedliccwnouqu.supabase.co:5432/postgres?schema=public
```

**Replace `YOUR_PASSWORD`** with the password you set when creating the Supabase project.

## Still Can't Find It?

1. **Check if you're logged in** to the correct Supabase account
2. **Make sure the project is fully created** (wait a few minutes if it just finished)
3. **Try refreshing** the page
4. **Look for "Connection info"** or "Database URL" in other sections

## Once You Have It

1. Copy the connection string
2. Open your `.env` file
3. Replace the `DATABASE_URL` line with:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.dmxqthvbedliccwnouqu.supabase.co:5432/postgres?schema=public"
   ```
4. Make sure to replace `YOUR_ACTUAL_PASSWORD` with your real password
5. Save the file
6. Restart your dev server

