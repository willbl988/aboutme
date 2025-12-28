'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Round {
  id: string
  courseId: string
  course: {
    id: string
    name: string
    holes?: { number: number; par: number; yardage?: number }[]
  }
  players: {
    id: string
    name: string
    scores: {
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
  const [showActiveOnly, setShowActiveOnly] = useState(true)

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
    const player = round.players?.find(p => p.id === playerId)
    if (!player || !player.scores) return 0
    return player.scores.reduce((sum: number, score: { score: number }) => sum + score.score, 0)
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
              {showActiveOnly ? 'Active Only' : 'All Rounds'}
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
              <Link
                key={round.id}
                href={`/rounds/${round.id}`}
                className="block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {round.course.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(round.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      round.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {round.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {round.players.map((player) => {
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

