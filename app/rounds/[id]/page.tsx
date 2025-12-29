'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Round {
  id: string
  courseId: string
  Course: {
    id: string
    name: string
    Hole: { number: number; par: number; yardage?: number }[]
  }
  RoundPlayer: {
    id: string
    name: string
    mulligansAllowed: number
    Score: {
      holeNumber: number
      score: number
    }[]
    Mulligan: {
      holeNumber: number
    }[]
  }[]
  createdAt: string
  status: 'active' | 'completed'
}

export default function RoundDetailPage() {
  const router = useRouter()
  const params = useParams()
  const roundId = params.id as string

  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])


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
      loadRound()
    } catch (error) {
      router.push('/login')
    }
  }

  const loadRound = async () => {
    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        if (data.round) {
          setRound(data.round)
        } else {
          console.error('Round not found in response')
          router.push('/rounds')
        }
      } else {
        if (response.status === 404) {
          console.error('Round not found')
          router.push('/rounds')
        } else {
          const errorData = await response.json().catch(() => ({}))
          console.error('Failed to load round:', errorData)
          alert(`Failed to load round: ${errorData.error || 'Unknown error'}`)
          router.push('/rounds')
        }
      }
    } catch (error) {
      console.error('Failed to load round:', error)
      alert('An error occurred while loading the round')
      router.push('/rounds')
    } finally {
      setLoading(false)
    }
  }



  const updateScore = async (playerId: string, holeNumber: number, score: number) => {
    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateScore',
          playerId,
          holeNumber,
          score,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRound(data.round)
      }
    } catch (error) {
      console.error('Failed to update score:', error)
    }
  }

  const toggleMulligan = async (playerId: string, holeNumber: number) => {
    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleMulligan',
          playerId,
          holeNumber,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setRound(data.round)
      }
    } catch (error) {
      console.error('Failed to toggle mulligan:', error)
    }
  }

  const hasMulligan = (playerId: string, holeNumber: number): boolean => {
    if (!round) return false
    const player = round.RoundPlayer.find(p => p.id === playerId)
    if (!player || !player.Mulligan) return false
    return player.Mulligan.some(m => m.holeNumber === holeNumber)
  }

  const getMulligansUsed = (playerId: string): number => {
    if (!round) return 0
    const player = round.RoundPlayer.find(p => p.id === playerId)
    if (!player || !player.Mulligan) return 0
    return player.Mulligan.length
  }

  const getMulligansRemaining = (playerId: string): number => {
    if (!round) return 0
    const player = round.RoundPlayer.find(p => p.id === playerId)
    if (!player) return 0
    const used = getMulligansUsed(playerId)
    return Math.max(0, (player.mulligansAllowed || 0) - used)
  }

  const completeRound = async () => {
    if (!confirm('Complete this round? This will finalize all scores.')) return

    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      if (response.ok) {
        const data = await response.json()
        setRound(data.round)
        setPolling(false)
      }
    } catch (error) {
      console.error('Failed to complete round:', error)
    }
  }

  const getPlayerScore = (playerId: string, holeNumber: number): number | null => {
    if (!round) return null
    const player = round.RoundPlayer.find(p => p.id === playerId)
    if (!player) return null
    const score = player.Score.find(s => s.holeNumber === holeNumber)
    return score?.score || null
  }

  const getPlayerTotal = (playerId: string): number => {
    if (!round) return 0
    const player = round.RoundPlayer.find(p => p.id === playerId)
    if (!player) return 0
    return player.Score.reduce((sum, score) => sum + score.score, 0)
  }

  const getHolePar = (holeNumber: number): number => {
    return round?.Course.Hole.find(h => h.number === holeNumber)?.par || 4
  }

  if (loading || !round) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const holes = round?.Course.Hole || Array.from({ length: 18 }, (_, i) => ({ number: i + 1, par: 4 }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              {round.Course.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {new Date(round.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            {round.status === 'active' && (
              <button
                onClick={completeRound}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                Complete Round
              </button>
            )}
            <span
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-center ${
                round.status === 'active'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              {round.status}
            </span>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Total Scores</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {round.RoundPlayer.map((player) => {
              const total = getPlayerTotal(player.id)
              const mulligansUsed = getMulligansUsed(player.id)
              const mulligansRemaining = getMulligansRemaining(player.id)
              return (
                <div key={player.id} className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">{player.name}</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{total || 0}</p>
                  {(player.mulligansAllowed || 0) > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Mulligans: {mulligansUsed}/{player.mulligansAllowed} used
                      {mulligansRemaining > 0 && (
                        <span className="text-green-600 dark:text-green-400"> ({mulligansRemaining} left)</span>
                      )}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Score Entry Table */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Hole</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Par</th>
                {round.RoundPlayer.map((player) => (
                  <th key={player.id} className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    {player.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holes.map((hole) => (
                <tr key={hole.number} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">{hole.number}</td>
                  <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">{hole.par}</td>
                  {round.RoundPlayer.map((player) => {
                    const currentScore = getPlayerScore(player.id, hole.number)
                    const usedMulligan = hasMulligan(player.id, hole.number)
                    const canUseMulligan = (player.mulligansAllowed || 0) > 0 && getMulligansRemaining(player.id) > 0 && !usedMulligan
                    return (
                      <td key={player.id} className="py-4 px-4">
                        <div className="flex flex-col items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="15"
                            value={currentScore || ''}
                            onChange={(e) => {
                              const score = parseInt(e.target.value)
                              if (score > 0) {
                                updateScore(player.id, hole.number, score)
                              }
                            }}
                            disabled={round.status === 'completed'}
                            className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            placeholder="-"
                          />
                          {(player.mulligansAllowed || 0) > 0 && (
                            <button
                              onClick={() => toggleMulligan(player.id, hole.number)}
                              disabled={round.status === 'completed' || (!canUseMulligan && !usedMulligan)}
                              className={`text-xs px-2 py-1 rounded transition-all ${
                                usedMulligan
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-semibold'
                                  : canUseMulligan
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                              title={usedMulligan ? 'Mulligan used - click to remove' : canUseMulligan ? 'Click to use mulligan' : 'No mulligans remaining'}
                            >
                              {usedMulligan ? '✓ Mulligan' : 'Mulligan'}
                            </button>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                <td className="py-4 px-4 text-gray-900 dark:text-white">Total</td>
                <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                  {holes.reduce((sum, h) => sum + h.par, 0)}
                </td>
                {round.RoundPlayer.map((player) => {
                  const total = getPlayerTotal(player.id)
                  return (
                    <td key={player.id} className="py-4 px-4 text-center text-green-600 dark:text-green-400">
                      {total || '-'}
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {round.status === 'active' && (
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>💡 Scores update automatically for all players in real-time</p>
          </div>
        )}
      </div>
    </div>
  )
}

