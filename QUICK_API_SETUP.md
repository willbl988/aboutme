# Quick Golf Course API Setup

To use the real GolfCourseAPI instead of mock data, you need to get an API key and configure it.

## Step 1: Get Your API Key

1. Go to **https://golfcourseapi.com**
2. Sign up for a free account (free tier: 300 requests per day)
3. Get your API key from your account dashboard

## Step 2: Add API Key to Local Development

1. Open your `.env` file in the project root
2. Add this line:
   ```env
   GOLF_API_KEY=your_api_key_here
   ```
3. Replace `your_api_key_here` with your actual API key
4. Save the file
5. Restart your development server:
   ```bash
   npm run dev
   ```

## Step 3: Add API Key to Vercel (Production)

1. Go to **https://vercel.com/dashboard**
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Enter:
   - **Key**: `GOLF_API_KEY`
   - **Value**: Your API key from GolfCourseAPI.com
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your application (or push a new commit)

## Step 4: Verify It's Working

1. Go to the Courses page
2. Click **"🔍 Import Course"**
3. Search for "Dallas" (or any city/course name)
4. You should see real courses from the API!

## How It Works

- The system fetches ~2000 courses from the API and caches them for 1 hour
- When you search, it filters through the cached courses
- This provides fast search results without hitting API rate limits
- The cache refreshes automatically after 1 hour

## Troubleshooting

**Still seeing mock data?**
- Check that `GOLF_API_KEY` is set in your `.env` file
- Restart your dev server after adding the key
- Check server logs for API errors

**No results?**
- The API might not have courses matching your search
- Try different search terms (city names work well)
- Check server console for API response details

**API errors?**
- Verify your API key is correct
- Check your API usage limits (free tier: 300 requests/day)
- The system will fall back to mock data if the API fails

