'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import WagerManager from '@/components/WagerManager'
import type { Wager } from '@/lib/wager-types'

interface Course {
  id: string
  name: string
  Hole: { number: number; par: number; yardage?: number }[]
}

interface Player {
  id: string
  name: string
  userId?: string // Optional user account ID
  mulligansAllowed?: number
  mulligansEnabled?: boolean
}

function NewRoundContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('courseId')

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [players, setPlayers] = useState<Player[]>([{ id: '1', name: '', mulligansEnabled: false }])
  const [gameMode, setGameMode] = useState<string>('stroke')
  const [wager, setWager] = useState<string>('') // Legacy field for backwards compatibility
  const [wagers, setWagers] = useState<Wager[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userSearchResults, setUserSearchResults] = useState<Map<string, Array<{ id: string; name: string; email: string }>>>(new Map())
  const [activeSearchPlayerId, setActiveSearchPlayerId] = useState<string | null>(null)
  const searchTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useEffect(() => {
    checkAuth()
    loadCourses()
  }, [])

  useEffect(() => {
    if (courseIdParam && courses.length > 0) {
      const course = courses.find(c => c.id === courseIdParam)
      if (course) {
        setSelectedCourse(course)
      }
    }
  }, [courseIdParam, courses])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      const data = await response.json()
      if (!data.user) {
        router.push('/login')
        return
      }
      loadCourses()
    } catch (error) {
      router.push('/login')
    }
  }

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses', {
        credentials: 'include',
      })
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const addPlayer = () => {
    // If first player has mulligans enabled, new players should also have them enabled
    const firstPlayerMulligansEnabled = players.length > 0 ? players[0].mulligansEnabled : false
    setPlayers([...players, { 
      id: String(Date.now()), 
      name: '', 
      mulligansEnabled: firstPlayerMulligansEnabled,
      mulligansAllowed: firstPlayerMulligansEnabled ? (players[0]?.mulligansAllowed || 0) : 0
    }])
  }

  const removePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id))
    }
  }

  const searchUsers = async (query: string, playerId: string) => {
    // Clear existing timeout for this player
    const existingTimeout = searchTimeoutRef.current.get(playerId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    if (!query || query.trim().length < 2) {
      setUserSearchResults(prev => {
        const newMap = new Map(prev)
        newMap.delete(playerId)
        return newMap
      })
      return
    }

    // Debounce search
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query.trim())}`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setUserSearchResults(prev => {
            const newMap = new Map(prev)
            newMap.set(playerId, data.users || [])
            return newMap
          })
        }
      } catch (error) {
        console.error('Failed to search users:', error)
      }
    }, 300) // 300ms debounce

    searchTimeoutRef.current.set(playerId, timeout)
  }

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => (p.id === id ? { ...p, name, userId: undefined } : p)))
    // Trigger user search
    searchUsers(name, id)
    // Clear search results if name is cleared
    if (!name.trim()) {
      setUserSearchResults(prev => {
        const newMap = new Map(prev)
        newMap.delete(id)
        return newMap
      })
    }
  }

  const selectUser = (playerId: string, user: { id: string; name: string; email: string }) => {
    setPlayers(players.map(p => 
      p.id === playerId 
        ? { ...p, name: user.name, userId: user.id } 
        : p
    ))
    setUserSearchResults(prev => {
      const newMap = new Map(prev)
      newMap.delete(playerId)
      return newMap
    })
    setActiveSearchPlayerId(null)
  }

  const updatePlayerMulligans = (id: string, value: string) => {
    // Allow empty string while typing, parse to number when valid
    const numValue = value === '' ? 0 : parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 18) {
      setPlayers(players.map(p => (p.id === id ? { ...p, mulligansAllowed: numValue } : p)))
    } else if (value === '') {
      // Allow empty string temporarily while typing
      setPlayers(players.map(p => (p.id === id ? { ...p, mulligansAllowed: 0 } : p)))
    }
  }

  const toggleMulligans = (id: string) => {
    const playerIndex = players.findIndex(p => p.id === id)
    const isFirstPlayer = playerIndex === 0
    const currentPlayer = players[playerIndex]
    const newEnabledState = !currentPlayer.mulligansEnabled

    setPlayers(players.map((p, index) => {
      // If first player is enabling mulligans, enable for all players
      if (isFirstPlayer && newEnabledState) {
        return {
          ...p,
          mulligansEnabled: true,
          mulligansAllowed: p.mulligansAllowed || 0
        }
      }
      // If first player is disabling mulligans, disable for all players
      if (isFirstPlayer && !newEnabledState) {
        return {
          ...p,
          mulligansEnabled: false,
          mulligansAllowed: 0
        }
      }
      // For other players, just toggle their own state
      if (p.id === id) {
        return {
          ...p,
          mulligansEnabled: newEnabledState,
          mulligansAllowed: newEnabledState ? (p.mulligansAllowed || 0) : 0
        }
      }
      return p
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return

    const validPlayers = players.filter(p => p.name.trim()).map(p => ({
      name: p.name,
      userId: p.userId, // Include userId if linked to user account
      mulligansAllowed: p.mulligansEnabled ? (p.mulligansAllowed || 0) : 0
    }))
    if (validPlayers.length === 0) {
      alert('Please add at least one player')
      return
    }

    setSubmitting(true)
    try {
      console.log('Creating round with:', {
        courseId: selectedCourse.id,
        players: validPlayers,
        mode: gameMode,
        wager: wager.trim() || null,
        wagers: wagers.length > 0 ? wagers : null,
      })

      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId: selectedCourse.id,
          players: validPlayers,
          mode: gameMode,
          wager: wager.trim() || null,
          wagers: wagers.length > 0 ? wagers : null,
        }),
      })

      console.log('Response status:', response.status, response.statusText)

      // Parse response body once
      const responseData = await response.json().catch((err) => {
        console.error('Failed to parse response:', err)
        return { error: 'Failed to parse server response' }
      })
      
      console.log('Response data:', responseData)
      
      if (response.ok && responseData) {
        if (responseData.round && responseData.round.id) {
          const roundId = responseData.round.id
          console.log('Round created successfully, redirecting to:', roundId)
          // Use window.location for more reliable navigation
          window.location.href = `/rounds/${roundId}`
        } else {
          console.error('Round created but no ID in response:', responseData)
          alert('Round created but failed to redirect. Please check your rounds list.')
          router.push('/rounds')
        }
      } else {
        console.error('Failed to create round - full error:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
        })
        alert(`Failed to create round: ${responseData.details || responseData.error || 'Unknown error'}\n\nCheck the browser console for more details.`)
      }
    } catch (error) {
      console.error('Failed to create round - exception:', error)
      alert('An error occurred while creating the round. Check the browser console for details.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-8">
          New Round
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Select Course
            </label>
            <select
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = courses.find(c => c.id === e.target.value)
                setSelectedCourse(course || null)
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.Hole.length} holes)
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Game Mode
            </label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="stroke">Stroke Play (Standard)</option>
              <option value="scramble">Scramble</option>
              <option value="bestball">Best Ball</option>
              <option value="alternate">Alternate Shot</option>
              <option value="match">Match Play</option>
            </select>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {gameMode === 'stroke' && 'Each player plays their own ball, total score counts'}
              {gameMode === 'scramble' && 'All players hit, choose best shot, all play from there'}
              {gameMode === 'bestball' && 'Each player plays their own ball, best score per hole counts'}
              {gameMode === 'alternate' && 'Players alternate shots on each hole'}
              {gameMode === 'match' && 'Hole-by-hole competition, win/lose/tie each hole'}
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <WagerManager
              wagers={wagers}
              players={players.filter(p => p.name.trim()).map(p => p.name)}
              onChange={setWagers}
            />
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Players
              </label>
              <button
                type="button"
                onClick={addPlayer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
              >
                + Add Player
              </button>
            </div>

            <div className="space-y-4">
              {players.map((player, index) => {
                const searchResults = userSearchResults.get(player.id) || []
                const showResults = activeSearchPlayerId === player.id && searchResults.length > 0 && !player.userId
                
                return (
                <div key={player.id} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) => updatePlayerName(player.id, e.target.value)}
                        onFocus={() => setActiveSearchPlayerId(player.id)}
                        onBlur={() => {
                          // Delay to allow clicking on results
                          setTimeout(() => setActiveSearchPlayerId(null), 200)
                        }}
                        placeholder={`Player ${index + 1} name`}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      {player.userId && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 dark:text-green-400 font-medium">
                          ✓ Linked
                        </span>
                      )}
                      {showResults && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {searchResults.map((user) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => selectUser(player.id, user)}
                              className="w-full text-left px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition text-sm"
                            >
                              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap flex items-center gap-2">
                      <span>Mulligans:</span>
                      <button
                        type="button"
                        onClick={() => toggleMulligans(player.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                          player.mulligansEnabled
                            ? 'bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            player.mulligansEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </label>
                    {player.mulligansEnabled && (
                      <input
                        type="number"
                        min="0"
                        max="18"
                        value={player.mulligansAllowed ?? ''}
                        onChange={(e) => updatePlayerMulligans(player.id, e.target.value)}
                        onFocus={(e) => {
                          // Select all text when focused to make it easier to replace
                          e.target.select()
                        }}
                        className="w-20 sm:w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    )}
                  </div>
                    {players.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePlayer(player.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm sm:text-base w-full sm:w-auto"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedCourse || submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Start Round'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewRoundPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <NewRoundContent />
    </Suspense>
  )
}

