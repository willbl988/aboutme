import { NextRequest, NextResponse } from 'next/server'

// OpenWeatherMap API (free tier: 60 calls/minute, 1,000,000 calls/month)
// Get your free API key at: https://openweathermap.org/api
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    if (!WEATHER_API_KEY) {
      // Return mock weather data if API key is not set
      console.warn('WEATHER_API_KEY not set, returning mock weather data')
      return NextResponse.json({
        temp: 72,
        condition: 'Partly Cloudy',
        icon: '02d',
        feelsLike: 70,
        humidity: 65,
        windSpeed: 5,
      })
    }

    // Fetch weather from OpenWeatherMap
    const url = `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind?.speed || 0),
    })
  } catch (error: any) {
    console.error('Weather API error:', error)
    
    // Return mock data on error
    return NextResponse.json({
      temp: 72,
      condition: 'Partly Cloudy',
      icon: '02d',
      feelsLike: 70,
      humidity: 65,
      windSpeed: 5,
    })
  }
}

