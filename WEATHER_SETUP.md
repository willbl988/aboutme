# Weather Widget Setup

The weather widget displays the current weather at the user's location in the navigation bar, next to the logout button.

## Features

- 🌤️ **Real-time Weather**: Shows current temperature and conditions
- 📍 **Location-based**: Uses browser geolocation to get user's location
- 🔄 **Refreshable**: Click the weather icon to refresh
- 📱 **Mobile-friendly**: Shows icon only on mobile, icon + temperature on desktop
- 🎨 **Beautiful Icons**: Weather condition emojis (☀️, ⛅, 🌧️, ❄️, etc.)

## Setup

### Option 1: OpenWeatherMap (Recommended - Free)

1. **Sign up for a free account** at [OpenWeatherMap](https://openweathermap.org/api)
   - Free tier: 60 calls/minute, 1,000,000 calls/month
   - No credit card required

2. **Get your API key**:
   - Go to [API Keys](https://home.openweathermap.org/api_keys)
   - Create a new API key (or use the default one)

3. **Add to environment variables**:
   
   **Local (.env):**
   ```env
   WEATHER_API_KEY=your_api_key_here
   # OR
   OPENWEATHER_API_KEY=your_api_key_here
   ```

   **Vercel:**
   - Go to your project settings
   - Add environment variable: `WEATHER_API_KEY` or `OPENWEATHER_API_KEY`
   - Set the value to your API key

### Option 2: Without API Key (Mock Data)

If no API key is set, the widget will:
- Show mock weather data (72°F, Partly Cloudy)
- Still work for testing purposes
- Display a fallback icon

## How It Works

1. **User grants location permission** (browser will prompt)
2. **Widget gets coordinates** from browser geolocation
3. **Fetches weather** from OpenWeatherMap API (or returns mock data)
4. **Displays weather icon and temperature** in navigation bar

## Privacy

- Location data is only used to fetch weather
- No location data is stored or sent to our servers
- Weather API calls are made server-side (API key stays secure)
- User can deny location permission (widget will show fallback)

## Troubleshooting

### Weather not showing?
- Check browser console for errors
- Ensure location permission is granted
- Verify API key is set correctly
- Check API key quota hasn't been exceeded

### Location permission denied?
- Widget will show a fallback icon (🌤️)
- User can click to retry
- Browser settings may need to be updated

### API errors?
- Widget falls back to mock data automatically
- Check API key is valid
- Verify OpenWeatherMap service is available

## Customization

The weather widget can be customized in `components/WeatherWidget.tsx`:
- Change emoji icons
- Adjust temperature display format
- Modify refresh behavior
- Add more weather details (humidity, wind speed, etc.)

