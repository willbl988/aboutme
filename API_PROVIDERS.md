# Golf Course API Providers

This document describes the available golf course API providers and how to configure them.

## Available Providers

### 1. GolfCourseAPI.com (Current - Free Tier)
- **URL**: https://golfcourseapi.com
- **Coverage**: ~30,000 courses worldwide
- **Free Tier**: 300 requests per day
- **Setup**: Requires API key
- **Environment Variable**: `GOLF_API_KEY`

### 2. GolfAPI.io (Alternative - 42,000+ Courses)
- **URL**: https://www.golfapi.io/
- **Coverage**: 42,000+ courses in 100+ countries
- **Features**: 
  - Complete scorecard data
  - Pars and stroke indexes
  - Tees and distances to greens
  - **Slope and course ratings** (USGA data)
  - Coordinates of greens and points of interest
- **Setup**: May require API key (check their documentation)
- **Environment Variable**: `GOLFAPIIO_KEY`
- **Status**: Implementation ready, needs API key and endpoint verification

### 3. Popular Courses Database (Built-in)
- **Coverage**: Curated list of well-known courses
- **Features**: Always available, no API calls needed
- **Includes**: Atlanta area (10 courses), Dallas area (8 courses), major championship courses
- **Setup**: No configuration needed

### 4. USGA Course Rating Database (Not Available)
- **URL**: https://ncrdb.usga.org/
- **Status**: ❌ **No public API available**
- **Note**: This is a web-based lookup tool only, not programmatically accessible

## Other Available APIs (Not Yet Implemented)

### GolfAPI by mScorecard
- **URL**: https://www.golfapi.mscorecard.com/
- **Coverage**: 42,000+ courses
- **Features**: REST API, CSV exports, course data, scorecards, ratings

### TeeRadar
- **URL**: https://teeradar.online/
- **Features**: Golf Course Data API, ratings, reviews, high-resolution photography

### GHIN API by SportsFirst
- **URL**: https://www.sportsfirst.net/sportsapi/ghin-api
- **Features**: Official USGA handicap data, course ratings (requires GHIN integration)

## Configuration

### Using Multiple Providers

Set `GOLF_API_PROVIDER` in your `.env`:

```env
# Use GolfCourseAPI + Popular courses (recommended)
GOLF_API_PROVIDER=golfcourseapi,popular

# Use GolfAPI.io + Popular courses (when API key is available)
GOLF_API_PROVIDER=golfapiio,popular

# Use all three sources
GOLF_API_PROVIDER=golfcourseapi,golfapiio,popular
```

### Environment Variables

```env
# GolfCourseAPI.com
GOLF_API_KEY=your_golfcourseapi_key

# GolfAPI.io (when available)
GOLFAPIIO_KEY=your_golfapiio_key

# Custom API (if you have your own)
CUSTOM_GOLF_API_URL=https://your-api-endpoint.com
```

## Adding a New Provider

To add support for a new API provider:

1. Add the provider case to the `switch` statement in `searchCourses()`
2. Implement a `search[ProviderName]()` function
3. Implement a `convert[ProviderName]Course()` function
4. Update `getCourseById()` to support the new provider
5. Add environment variable configuration
6. Update this documentation

## Current Implementation Status

- ✅ GolfCourseAPI.com - Fully implemented
- ✅ Popular Courses Database - Fully implemented
- 🟡 GolfAPI.io - Structure ready, needs API key and endpoint verification
- ❌ USGA NCRDB - No API available (web-only lookup tool)

## Recommendations

1. **For best coverage**: Use `golfcourseapi,popular` (current setup)
2. **For USGA ratings**: Consider GolfAPI.io when API access is available
3. **For official handicap data**: Consider GHIN API if you need handicap integration

