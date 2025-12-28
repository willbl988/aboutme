# Golf Course API Setup Guide

This guide will help you set up golf course API integration to access real golf course data with detailed hole information.

## Available API Providers

The system supports multiple API providers. You can switch between them using the `GOLF_API_PROVIDER` environment variable.

### Option 1: GolfCourseAPI.com (Recommended - Free Tier Available)

**Default provider** - Requires API key (free tier available).

- Free tier: 300 requests per day
- ~30,000 golf courses worldwide
- Detailed hole information
- Sign up at https://golfcourseapi.com to get your API key

### Option 2: Custom API

Use your own golf course API endpoint.

1. Set `GOLF_API_PROVIDER=custom` in your `.env`
2. Set `CUSTOM_GOLF_API_URL` to your API endpoint
3. Optionally set `GOLF_API_KEY` if your API requires authentication

## Step 2: Add Your API Key

### Using GolfCourseAPI.com (Default)

1. **Get your API key** from GolfCourseAPI.com (you should have received it via email)
2. **Add to your `.env` file**:

```env
GOLF_API_KEY=your_api_key_here
```

3. **Restart your development server**:
```bash
npm run dev
```

**Note**: The API key format should be used as-is (e.g., `6JMG6DO7JHSTWZ4YG3V2447MZI`)

### Using a Custom API

If you want to use your own API:

1. Open your `.env` file in the root directory
2. Add these variables:

```env
GOLF_API_PROVIDER=custom
CUSTOM_GOLF_API_URL=https://your-api-endpoint.com
GOLF_API_KEY=your_api_key_here  # Optional, if your API requires auth
```

3. Restart your development server:
```bash
npm run dev
```

### Production (Vercel)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add your API key:
   - **Key**: `GOLF_API_KEY`
   - **Value**: Your API key from GolfCourseAPI.com
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. Redeploy your application (or push a new commit)

**For custom API** (if not using GolfCourseAPI.com):
   - **Key**: `GOLF_API_PROVIDER`, **Value**: `custom`
   - **Key**: `CUSTOM_GOLF_API_URL`, **Value**: Your API endpoint

## Step 3: Test the Integration

1. Go to your Courses page
2. Click **"Search Courses"**
3. Search for a golf course (e.g., "Pebble Beach" or any course name)
4. You should see course data with detailed hole information!

**Note**: If the API doesn't return results, the system will automatically fall back to mock data for testing.

## What Data You'll Get

With the golf course API, you'll receive:
- ✅ Course name, address, location
- ✅ Detailed hole-by-hole information:
  - Par for each hole
  - Yardage for each hole
  - Handicap ratings
  - Course rating and slope (if available)
- ✅ Phone, website, and contact information (if available)
- ✅ GPS coordinates (latitude/longitude, if available)

## Fallback Behavior

If the API key is not set, the system will:
- Use mock/demo data for testing
- Show a warning in the console
- Still allow you to test the UI functionality

## Troubleshooting

### API requests failing
- The system automatically falls back to mock data if the API fails
- Check server logs for specific error messages
- Verify your API endpoint URL is correct (if using custom API)
- Check that your API key is correct (if using custom API with authentication)

### No results returned
- Try different search terms
- Some courses may not be in the database
- The system will show mock data if no real results are found
- Check server console for API response details

### Using Mock Data
- If you see mock courses (Pebble Beach, Augusta National), the API isn't working
- This is normal if the API endpoint is incorrect or unavailable
- Mock data allows you to test the UI even without a working API

## Switching API Providers

To switch providers, set `GOLF_API_PROVIDER` in your `.env`:

```env
# Use GolfCourseAPI.com (default, no key needed)
GOLF_API_PROVIDER=golfcourseapi

# Use your custom API
GOLF_API_PROVIDER=custom
CUSTOM_GOLF_API_URL=https://your-api.com

# Use mock data only (for testing)
GOLF_API_PROVIDER=mock
```

## Need Help?

- GolfCourseAPI.com: https://golfcourseapi.com
- Check the server logs for detailed error messages
- The code includes fallback mock data for testing
- You can easily add support for other APIs by updating `lib/course-api.ts`

