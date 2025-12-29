'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface CourseStat {
  courseName: string
  rounds: number
  totalScore: number
  averageScore: number
  bestScore: number
  worstScore: number
}

interface Statistics {
  totalRounds: number
  totalHoles: number
  courseStats: CourseStat[]
  bestRound: {
    id: string
    courseName: string
    score: number
    date: string
  } | null
  worstRound: {
    id: string
    courseName: string
    score: number
    date: string
  } | null
  recentRounds: Array<{
    id: string
    courseName: string
    date: string
    players: Array<{ name: string; score: number }>
  }>
}

export default function StatisticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

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
      loadStatistics()
    } catch (error) {
      router.push('/login')
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/statistics', {
        credentials: 'include',
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!stats || stats.totalRounds === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-8">
            Statistics
          </h1>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
              No completed rounds yet. Complete a round to see your statistics!
            </p>
            <Link
              href="/rounds/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              Start New Round
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 sm:mb-8">
          Statistics
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Rounds</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.totalRounds}</p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Total Holes Played</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.totalHoles}</p>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Courses Played</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{stats.courseStats.length}</p>
          </div>
        </div>

        {/* Best/Worst Rounds */}
        {(stats.bestRound || stats.worstRound) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.bestRound && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🏆 Best Round</h2>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{stats.bestRound.score}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-1">{stats.bestRound.courseName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {new Date(stats.bestRound.date).toLocaleDateString()}
                </p>
                <Link
                  href={`/rounds/${stats.bestRound.id}`}
                  className="mt-4 inline-block text-green-600 dark:text-green-400 hover:underline text-sm"
                >
                  View Round →
                </Link>
              </div>
            )}
            {stats.worstRound && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Worst Round</h2>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">{stats.worstRound.score}</p>
                <p className="text-gray-600 dark:text-gray-400 mb-1">{stats.worstRound.courseName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {new Date(stats.worstRound.date).toLocaleDateString()}
                </p>
                <Link
                  href={`/rounds/${stats.worstRound.id}`}
                  className="mt-4 inline-block text-green-600 dark:text-green-400 hover:underline text-sm"
                >
                  View Round →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Course Statistics */}
        {stats.courseStats.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Statistics</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Course</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Rounds</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Score</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Best</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Worst</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.courseStats.map((course) => (
                    <tr key={course.courseName} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{course.courseName}</td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">{course.rounds}</td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600 dark:text-green-400">
                        {course.averageScore.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 dark:text-green-400">{course.bestScore}</td>
                      <td className="py-3 px-4 text-right text-red-600 dark:text-red-400">{course.worstScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Rounds */}
        {stats.recentRounds.length > 0 && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Rounds</h2>
            <div className="space-y-4">
              {stats.recentRounds.map((round) => (
                <Link
                  key={round.id}
                  href={`/rounds/${round.id}`}
                  className="block p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{round.courseName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(round.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {round.RoundPlayer.map((player, idx) => (
                        <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">
                          {player.name}: {player.score}
                        </p>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

