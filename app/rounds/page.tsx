'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Round {
  id: string
  courseId: string
  mode?: string
  Course: {
    id: string
    name: string
    Hole?: { number: number; par: number; yardage?: number }[]
  }
  RoundPlayer: {
    id: string
    name: string
    Score: {
      holeNumber: number
      score: number
    }[]
  }[]
  createdAt: string
  status: 'active' | 'completed'
}

export default function RoundsPage() {
  const router = useRouter()
  const [rounds, setRounds] = useState<Round[]>([])
  const [loading, setLoading] = useState(true)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [deletingRoundId, setDeletingRoundId] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadRounds()
  }, [showActiveOnly])

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
      loadRounds()
    } catch (error) {
      router.push('/login')
    }
  }

  const loadRounds = async () => {
    try {
      const response = await fetch(`/api/rounds?active=${showActiveOnly}`, {
        credentials: 'include',
      })
      const data = await response.json()
      setRounds(data.rounds || [])
    } catch (error) {
      console.error('Failed to load rounds:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalScore = (round: Round, playerId: string) => {
    const player = round.RoundPlayer?.find(p => p.id === playerId)
    if (!player || !player.Score) return 0
    return player.Score.reduce((sum: number, score: { score: number }) => sum + score.score, 0)
  }

  const handleDeleteRound = async (e: React.MouseEvent, roundId: string, courseName: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete this round at "${courseName}"? This will delete all scores and player data for this round. This action cannot be undone.`)) {
      return
    }

    setDeletingRoundId(roundId)
    try {
      const response = await fetch(`/api/rounds/${roundId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        loadRounds()
      } else {
        const data = await response.json()
        alert(`Failed to delete round: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to delete round:', error)
      alert('Failed to delete round. Please try again.')
    } finally {
      setDeletingRoundId(null)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Rounds
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowActiveOnly(!showActiveOnly)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                showActiveOnly
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50'
              }`}
            >
              {showActiveOnly ? 'Show All Rounds' : 'Show Active Only'}
            </button>
            <Link
              href="/rounds/new"
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base text-center"
            >
              + New Round
            </Link>
          </div>
        </div>

        {rounds.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {showActiveOnly
                ? 'No active rounds. Start a new round to begin tracking scores!'
                : 'No rounds yet. Start your first round!'}
            </p>
            <Link
              href="/rounds/new"
              className="mt-4 inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Start New Round
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <Link
                    href={`/rounds/${round.id}`}
                    className="flex-1"
                  >
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {round.Course.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(round.createdAt).toLocaleDateString()}
                        </p>
                        {round.mode && round.mode !== 'stroke' && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {round.mode === 'scramble' && 'Scramble'}
                            {round.mode === 'bestball' && 'Best Ball'}
                            {round.mode === 'alternate' && 'Alternate Shot'}
                            {round.mode === 'match' && 'Match Play'}
                            {!['scramble', 'bestball', 'alternate', 'match'].includes(round.mode) && round.mode}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        round.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {round.status}
                    </span>
                    <button
                      onClick={(e) => handleDeleteRound(e, round.id, round.Course.name)}
                      disabled={deletingRoundId === round.id}
                      className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete round"
                    >
                      {deletingRoundId === round.id ? 'Deleting...' : '🗑️'}
                    </button>
                  </div>
                </div>

                <Link href={`/rounds/${round.id}`}>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                         {round.RoundPlayer.map((player) => {
                           const total = getTotalScore(round, player.id)
                           return (
                             <div key={player.id} className="text-center">
                               <p className="font-semibold text-gray-900 dark:text-white">
                                 {player.name}
                               </p>
                               <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                 {total || '-'}
                               </p>
                               <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                             </div>
                           )
                         })}
                       </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

