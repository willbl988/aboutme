'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import type { Wager } from '@/lib/wager-types'
import { calculateWagerResults, calculateNetAmounts } from '@/lib/wager-calculator'

interface Round {
  id: string
  courseId: string
  mode?: string
  wager?: string | null // Legacy field
  wagers?: Wager[] | null // New wagers array
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

  const holes = round?.Course.Hole || Array.from({ length: 18 }, (_, i) => ({ number: i + 1, par: 4 }))

  // Calculate wager results - must be before any conditional returns
  const wagerResults = useMemo(() => {
    if (!round?.wagers || round.wagers.length === 0) return []
    try {
      return calculateWagerResults(
        round.wagers as Wager[],
        round.RoundPlayer,
        holes
      )
    } catch (error) {
      console.error('Error calculating wager results:', error)
      return []
    }
  }, [round?.wagers, round?.RoundPlayer, holes])

  const netAmounts = useMemo(() => {
    if (wagerResults.length === 0) return new Map()
    return calculateNetAmounts(wagerResults)
  }, [wagerResults])

  if (loading || !round) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 sm:gap-0 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
              {round.Course.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                {new Date(round.createdAt).toLocaleDateString()}
              </p>
              {round.mode && round.mode !== 'stroke' && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {round.mode === 'scramble' && 'Scramble'}
                  {round.mode === 'bestball' && 'Best Ball'}
                  {round.mode === 'alternate' && 'Alternate Shot'}
                  {round.mode === 'match' && 'Match Play'}
                  {!['scramble', 'bestball', 'alternate', 'match'].includes(round.mode) && round.mode}
                </span>
              )}
              {(round.wagers && round.wagers.length > 0) && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  💰 {round.wagers.length} wager{round.wagers.length !== 1 ? 's' : ''}
                </span>
              )}
              {!round.wagers && round.wager && (
                <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                  💰 {round.wager}
                </span>
              )}
            </div>
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

        {/* Wager Results - Who Owes Who */}
        {wagerResults.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💰 Wager Results</h2>
            
            {/* Net Amounts Summary */}
            {netAmounts.size > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Net Amounts</h3>
                <div className="space-y-2">
                  {Array.from(netAmounts.values())
                    .sort((a, b) => b.net - a.net)
                    .map((net) => (
                      <div
                        key={net.player}
                        className={`p-3 rounded-lg border ${
                          net.net > 0
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : net.net < 0
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">{net.player}</span>
                          <span
                            className={`text-lg font-bold ${
                              net.net > 0
                                ? 'text-green-600 dark:text-green-400'
                                : net.net < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {net.net > 0 ? '+' : ''}${net.net.toFixed(2)}
                          </span>
                        </div>
                        {net.breakdown.length > 0 && (
                          <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            {net.breakdown.map((item: { to: string; amount: number; reason: string }, idx: number) => (
                              <div key={idx}>
                                {item.amount > 0 ? (
                                  <span>Receives ${item.amount.toFixed(2)} from {item.to}</span>
                                ) : (
                                  <span>Owes ${Math.abs(item.amount).toFixed(2)} to {item.to}</span>
                                )}
                                {item.reason && <span className="ml-2 italic">({item.reason})</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Detailed Wager Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Wager Breakdown</h3>
              <div className="space-y-4">
                {wagerResults.map((result) => (
                  <div
                    key={result.wagerId}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{result.wagerDescription}</h4>
                    {result.transactions.length > 0 ? (
                      <div className="space-y-1 text-sm">
                        {result.transactions.map((transaction, idx) => (
                          <div key={idx} className="text-gray-700 dark:text-gray-300">
                            <span className="font-medium">{transaction.from}</span> owes{' '}
                            <span className="font-medium text-green-600 dark:text-green-400">{transaction.amount}</span> to{' '}
                            <span className="font-medium">{transaction.to}</span>
                            {transaction.reason && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({transaction.reason})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : result.isTie ? (
                      <div className="text-sm">
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">
                          ✓ Tie - No money owed
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          All participants tied with a score of {result.tieScore}. No wager payouts.
                        </p>
                        {result.tieParticipants && result.tieParticipants.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Tied players: {result.tieParticipants.join(', ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">No transactions (incomplete scores)</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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

