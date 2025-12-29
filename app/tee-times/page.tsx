'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface TeeTime {
  id: string
  courseId: string
  courseName: string
  courseAddress?: string
  courseCity?: string
  courseState?: string
  courseLatitude?: number
  courseLongitude?: number
  date: string
  time: string
  players: number
  availableSpots: number
  price?: number
  distance?: number
}

interface Booking {
  id: string
  courseName: string
  courseAddress?: string
  courseCity?: string
  courseState?: string
  date: string
  time: string
  players: number
  playerNames: string[]
  price?: number
  status: string
  createdAt: string
}

export default function TeeTimesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'search' | 'nearby'>('search')
  const [teeTimes, setTeeTimes] = useState<TeeTime[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [players, setPlayers] = useState(1)
  const [radius, setRadius] = useState(25)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [bookingTeeTimeId, setBookingTeeTimeId] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedTeeTime, setSelectedTeeTime] = useState<TeeTime | null>(null)
  const [bookingPlayers, setBookingPlayers] = useState(1)
  const [playerNames, setPlayerNames] = useState<string[]>([''])
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<'search' | 'bookings'>('search')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    checkAuth()
    loadMyBookings()
  }, [])

  useEffect(() => {
    if (searchType === 'nearby' && userLocation) {
      searchNearby()
    }
  }, [searchType, userLocation, selectedDate, players, radius])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!response.ok || !(await response.json()).user) {
        router.push('/login')
        return
      }
      setLoading(false)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser. Please use a modern browser.')
      return
    }

    setLocationError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
        setSearchType('nearby')
        setLocationError(null)
      },
      (error) => {
        console.error('Geolocation error:', error)
        let errorMessage = 'Unable to get your location.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services in your browser settings and try again.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device settings.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = 'Unable to get your location. Please enable location services and try again.'
            break
        }
        
        setLocationError(errorMessage)
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
      }
    )
  }

  const searchTeeTimes = async () => {
    if (searchType === 'nearby' && !userLocation) {
      getLocation()
      return
    }

    setSearchLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('q', searchQuery)
      if (userLocation) {
        params.append('lat', userLocation.lat.toString())
        params.append('lon', userLocation.lon.toString())
        params.append('radius', radius.toString())
      }
      if (selectedDate) params.append('date', selectedDate)
      params.append('players', players.toString())

      const response = await fetch(`/api/tee-times/search?${params.toString()}`, {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to search tee times')
      }

      const data = await response.json()
      setTeeTimes(data.teeTimes || [])
    } catch (error) {
      console.error('Failed to search tee times:', error)
      alert('Failed to search tee times. Please try again.')
    } finally {
      setSearchLoading(false)
    }
  }

  const searchNearby = () => {
    if (!userLocation) {
      getLocation()
      return
    }
    searchTeeTimes()
  }

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchType === 'search' && searchQuery.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchTeeTimes()
      }, 500)
    } else if (searchType === 'search' && searchQuery.trim().length === 0) {
      setTeeTimes([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, searchType])

  const loadMyBookings = async () => {
    try {
      const response = await fetch('/api/tee-times/bookings', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (response.ok) {
        const data = await response.json()
        setMyBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Failed to load bookings:', error)
    }
  }

  const handleBookTeeTime = (teeTime: TeeTime) => {
    setSelectedTeeTime(teeTime)
    setBookingPlayers(1)
    setPlayerNames([''])
    setShowBookingModal(true)
  }

  const confirmBooking = async () => {
    if (!selectedTeeTime) return

    if (bookingPlayers < 1 || bookingPlayers > selectedTeeTime.availableSpots) {
      alert(`Please select between 1 and ${selectedTeeTime.availableSpots} players.`)
      return
    }

    setBookingTeeTimeId(selectedTeeTime.id)
    try {
      const response = await fetch('/api/tee-times/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teeTimeId: selectedTeeTime.id,
          players: bookingPlayers,
          playerNames: playerNames.filter(name => name.trim()),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to book tee time')
        return
      }

      alert('Tee time booked successfully!')
      setShowBookingModal(false)
      setSelectedTeeTime(null)
      searchTeeTimes()
      loadMyBookings()
    } catch (error) {
      console.error('Failed to book tee time:', error)
      alert('Failed to book tee time. Please try again.')
    } finally {
      setBookingTeeTimeId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 30)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-8">
          Book Tee Times
        </h1>

        {/* Tab Navigation */}
        <div className="mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-1 sm:gap-2 border-b-2 border-gray-200 dark:border-green-800/30 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-3 font-semibold transition-all border-b-2 whitespace-nowrap text-base sm:text-base min-h-[48px] flex items-center ${
                activeTab === 'search'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <span className="hidden sm:inline">🔍 </span>Search
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-shrink-0 px-4 sm:px-6 py-3 sm:py-3 font-semibold transition-all border-b-2 whitespace-nowrap text-base sm:text-base min-h-[48px] flex items-center ${
                activeTab === 'bookings'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
              }`}
            >
              <span className="hidden sm:inline">📅 </span>My Bookings
            </button>
          </div>
        </div>

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Controls */}
            <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSearchType('search')
                      setSearchQuery('')
                      setTeeTimes([])
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      searchType === 'search'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-white/50 dark:bg-green-800/30 text-gray-700 dark:text-gray-300 border-2 border-green-200 dark:border-green-700'
                    }`}
                  >
                    Search
                  </button>
                  <button
                    onClick={() => {
                      setSearchType('nearby')
                      if (!userLocation) {
                        getLocation()
                      } else {
                        searchNearby()
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      searchType === 'nearby'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-white/50 dark:bg-green-800/30 text-gray-700 dark:text-gray-300 border-2 border-green-200 dark:border-green-700'
                    }`}
                  >
                    📍 Nearby
                  </button>
                </div>

                {searchType === 'search' && (
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by course name, city, or state..."
                    className="flex-1 px-4 py-2 border-2 border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-green-900/20 text-gray-900 dark:text-white"
                  />
                )}

                {searchType === 'nearby' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Within</span>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(parseInt(e.target.value))}
                      className="px-3 py-2 border-2 border-green-200 dark:border-green-700 rounded-lg bg-white dark:bg-green-900/20 text-gray-900 dark:text-white"
                    >
                      <option value={10}>10 miles</option>
                      <option value={25}>25 miles</option>
                      <option value={50}>50 miles</option>
                      <option value={100}>100 miles</option>
                    </select>
                    {!userLocation && (
                      <button
                        onClick={getLocation}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        Get Location
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={today}
                    max={maxDateStr}
                    className="w-full px-4 py-2 border-2 border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-green-900/20 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Players
                  </label>
                  <select
                    value={players}
                    onChange={(e) => setPlayers(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border-2 border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-green-900/20 text-gray-900 dark:text-white"
                  >
                    <option value={1}>1 player</option>
                    <option value={2}>2 players</option>
                    <option value={3}>3 players</option>
                    <option value={4}>4 players</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={searchTeeTimes}
                    disabled={searchLoading || (searchType === 'search' && !searchQuery.trim())}
                    className="w-full px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {locationError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📍</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                        {locationError}
                      </p>
                      <div className="text-xs text-red-700 dark:text-red-400 mb-3">
                        <p className="mb-1"><strong>To enable location:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Click the lock icon in your browser's address bar</li>
                          <li>Select "Allow" for location permissions</li>
                          <li>Or check your device/browser settings</li>
                        </ul>
                      </div>
                      <button
                        onClick={getLocation}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {searchType === 'nearby' && userLocation && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
                  ✓ Location found: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                </div>
              )}
            </div>

            {/* Results */}
            {searchLoading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            )}

            {!searchLoading && teeTimes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Found {teeTimes.length} tee time{teeTimes.length !== 1 ? 's' : ''}
                </h2>
                {teeTimes.map((teeTime) => (
                  <div
                    key={teeTime.id}
                    className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {teeTime.courseName}
                        </h3>
                        {(teeTime.courseCity || teeTime.courseState) && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {[teeTime.courseCity, teeTime.courseState].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {teeTime.courseAddress && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                            {teeTime.courseAddress}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            📅 <span className="font-semibold">{new Date(teeTime.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            🕐 <span className="font-semibold">{teeTime.time}</span>
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            👥 <span className="font-semibold">{teeTime.availableSpots} spot{teeTime.availableSpots !== 1 ? 's' : ''} available</span>
                          </span>
                          {teeTime.distance && (
                            <span className="text-gray-700 dark:text-gray-300">
                              📍 <span className="font-semibold">{teeTime.distance.toFixed(1)} miles away</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {teeTime.price && (
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            ${teeTime.price.toFixed(2)}
                          </div>
                        )}
                        <button
                          onClick={() => handleBookTeeTime(teeTime)}
                          disabled={teeTime.availableSpots < players}
                          className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searchLoading && teeTimes.length === 0 && (searchQuery || searchType === 'nearby') && (
              <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-green-800/30">
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  No tee times found. Try adjusting your search criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              My Bookings ({myBookings.length})
            </h2>
            {myBookings.length === 0 ? (
              <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-green-800/30">
                <p className="text-gray-700 dark:text-gray-300 text-lg">
                  You don't have any bookings yet. Search for tee times to get started!
                </p>
              </div>
            ) : (
              myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-green-800/30"
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {booking.courseName}
                      </h3>
                      {(booking.courseCity || booking.courseState) && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {[booking.courseCity, booking.courseState].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <span className="text-gray-700 dark:text-gray-300">
                          📅 <span className="font-semibold">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          🕐 <span className="font-semibold">{booking.time}</span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          👥 <span className="font-semibold">{booking.players} player{booking.players !== 1 ? 's' : ''}</span>
                        </span>
                        {booking.playerNames.length > 0 && (
                          <span className="text-gray-700 dark:text-gray-300">
                            Players: {booking.playerNames.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    {booking.price && (
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${booking.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedTeeTime && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-green-900/30 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200/50 dark:border-green-800/30">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Book Tee Time
              </h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Course</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTeeTime.courseName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date & Time</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {new Date(selectedTeeTime.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTeeTime.time}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Number of Players
                  </label>
                  <select
                    value={bookingPlayers}
                    onChange={(e) => {
                      const num = parseInt(e.target.value)
                      setBookingPlayers(num)
                      setPlayerNames(Array.from({ length: num }, (_, i) => playerNames[i] || ''))
                    }}
                    className="w-full px-4 py-2 border-2 border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-green-900/20 text-gray-900 dark:text-white"
                  >
                    {Array.from({ length: selectedTeeTime.availableSpots }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} player{i + 1 !== 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                {bookingPlayers > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Player Names (optional)
                    </label>
                    {Array.from({ length: bookingPlayers }, (_, i) => (
                      <input
                        key={i}
                        type="text"
                        value={playerNames[i] || ''}
                        onChange={(e) => {
                          const newNames = [...playerNames]
                          newNames[i] = e.target.value
                          setPlayerNames(newNames)
                        }}
                        placeholder={`Player ${i + 1} name`}
                        className="w-full px-4 py-2 border-2 border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-green-900/20 text-gray-900 dark:text-white mb-2"
                      />
                    ))}
                  </div>
                )}
                {selectedTeeTime.price && (
                  <div className="pt-4 border-t border-gray-200 dark:border-green-800/30">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Total Price</span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${(selectedTeeTime.price * bookingPlayers).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBookingModal(false)
                    setSelectedTeeTime(null)
                  }}
                  className="flex-1 px-4 py-2 bg-white/80 dark:bg-green-800/30 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-white dark:hover:bg-green-800/50 border-2 border-green-200 dark:border-green-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBooking}
                  disabled={bookingTeeTimeId === selectedTeeTime.id}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bookingTeeTimeId === selectedTeeTime.id ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

