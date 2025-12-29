'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  condition: string
  icon: string
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getWeather()
  }, [])

  const getWeather = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get user's location
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser')
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Fetch weather from our API
          const response = await fetch(
            `/api/weather?lat=${latitude}&lon=${longitude}`,
            {
              credentials: 'include',
              cache: 'no-store',
            }
          )

          if (!response.ok) {
            throw new Error('Failed to fetch weather')
          }

          const data = await response.json()
          setWeather({
            temp: Math.round(data.temp),
            condition: data.condition,
            icon: data.icon,
          })
          setLoading(false)
          setError(null)
        },
        (error) => {
          console.error('Geolocation error:', error)
          let errorMessage = 'Location access denied'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Enable location in browser settings to see weather.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
          }
          
          setError(errorMessage)
          setLoading(false)
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
        }
      )
    } catch (error: any) {
      console.error('Weather fetch error:', error)
      setError(error.message || 'Failed to load weather')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2">
        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <button
        onClick={getWeather}
        className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition whitespace-nowrap"
        title="Click to refresh weather"
      >
        <span className="text-base sm:text-lg lg:text-xl">🌤️</span>
      </button>
    )
  }

  // Weather icon mapping
  const getWeatherEmoji = (icon: string) => {
    const iconMap: Record<string, string> = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️',
    }
    return iconMap[icon] || '🌤️'
  }

  return (
    <button
      onClick={getWeather}
      className="flex items-center gap-1 px-1.5 sm:px-2 py-1.5 sm:py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition group whitespace-nowrap"
      title={`${weather.condition}, ${weather.temp}°F - Click to refresh`}
    >
      <span className="text-base sm:text-lg lg:text-xl">{getWeatherEmoji(weather.icon)}</span>
      <span className="text-xs sm:text-sm lg:text-base font-medium">
        {weather.temp}°
      </span>
    </button>
  )
}

