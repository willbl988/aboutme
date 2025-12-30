'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
}

interface QuickStats {
  totalRounds: number
  bestScore: number | null
  averageScore: number | null
  activeRounds: number
  recentRound: {
    courseName: string
    score: number
    date: string
  } | null
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [timeOfDay, setTimeOfDay] = useState('')

  useEffect(() => {
    checkAuth()
    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000) // Update every minute
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (user) {
      loadQuickStats()
    }
  }, [user])

  const updateTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 17) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')
  }

  const checkAuth = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Auth check failed: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      }
      setLoading(false)
    } catch (error: any) {
      console.error('Auth check error:', error)
      setLoading(false)
      if (error.name === 'AbortError' || error.message?.includes('fetch')) {
        console.log('Network error or timeout, redirecting to login')
      }
    }
  }

  const loadQuickStats = async () => {
    try {
      setStatsLoading(true)
      const [statsRes, roundsRes] = await Promise.all([
        fetch('/api/statistics', { credentials: 'include', cache: 'no-store' }),
        fetch('/api/rounds?active=true', { credentials: 'include', cache: 'no-store' }),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        const roundsData = roundsRes.ok ? await roundsRes.json() : { rounds: [] }
        
        setStats({
          totalRounds: statsData.totalRounds || 0,
          bestScore: statsData.bestRound?.score || null,
          averageScore: statsData.averageScore || null,
          activeRounds: roundsData.rounds?.length || 0,
          recentRound: statsData.recentRounds?.[0] || null,
        })
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  const greeting = timeOfDay === 'morning' ? 'Good morning' : timeOfDay === 'afternoon' ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Welcome Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {greeting}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300">
            Ready to hit the links today?
          </p>
        </div>

        {/* Quick Actions - Prominent CTA */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Start a New Round
                </h2>
                <p className="text-green-50 text-sm sm:text-base">
                  Track your scores in real-time with friends
                </p>
              </div>
              <Link
                href="/rounds/new"
                className="w-full sm:w-auto px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl active:scale-95 text-center"
              >
                ➕ Start Round
              </Link>
            </div>
          </div>
        </div>

        {/* Active Rounds Alert */}
        {stats && stats.activeRounds > 0 && (
          <div className="mb-6 sm:mb-8">
            <Link
              href="/rounds"
              className="block bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">⏱️</span>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900 dark:text-amber-200">
                    {stats.activeRounds} Active Round{stats.activeRounds !== 1 ? 's' : ''} in Progress
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Continue tracking your scores
                  </p>
                </div>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">→</span>
              </div>
            </Link>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-green-800/30">
            <div className="text-2xl sm:text-3xl mb-2">🏌️</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {statsLoading ? '...' : stats?.totalRounds || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
              Total Rounds
            </div>
          </div>

          <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-green-800/30">
            <div className="text-2xl sm:text-3xl mb-2">🎯</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {statsLoading ? '...' : stats?.bestScore ? stats.bestScore : '—'}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
              Best Score
            </div>
          </div>

          <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-green-800/30">
            <div className="text-2xl sm:text-3xl mb-2">📊</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {statsLoading ? '...' : stats?.averageScore ? Math.round(stats.averageScore) : '—'}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
              Avg Score
            </div>
          </div>

          <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200/50 dark:border-green-800/30">
            <div className="text-2xl sm:text-3xl mb-2">⏱️</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {statsLoading ? '...' : stats?.activeRounds || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
              Active Now
            </div>
          </div>
        </div>

        {/* Recent Round & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Recent Round Card */}
          {stats?.recentRound && (
            <div className="lg:col-span-2 bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-green-800/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📝</span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Last Round</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">Course</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {stats.recentRound.courseName}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Score</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.recentRound.score}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">Date</p>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      {new Date(stats.recentRound.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href="/statistics"
                  className="inline-block mt-4 text-green-600 dark:text-green-400 font-semibold hover:underline text-sm"
                >
                  View all rounds →
                </Link>
              </div>
            </div>
          )}

          {/* Quick Links */}
          <div className="space-y-4" data-tutorial="quick-links">
            <Link
              href="/rounds"
              className="block bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-green-800/30 hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">View Rounds</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">See all your rounds</p>
                </div>
              </div>
            </Link>

            <Link
              href="/statistics"
              className="block bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-green-800/30 hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Statistics</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">Track your progress</p>
                </div>
              </div>
            </Link>

            <Link
              href="/news"
              className="block bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200/50 dark:border-green-800/30 hover:shadow-xl transition-all active:scale-95"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📰</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Golf News</h3>
                  <p className="text-xs text-gray-700 dark:text-gray-300">Stay updated</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Empty State for New Users */}
        {!statsLoading && stats && stats.totalRounds === 0 && (
          <div className="mt-8 bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl p-8 sm:p-12 text-center border border-gray-200/50 dark:border-green-800/30">
            <div className="text-6xl mb-4">🏌️⛳</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Start Tracking?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Create your first course or import one from our database, then start your first round!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/courses"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                Browse Courses
              </Link>
              <Link
                href="/rounds/new"
                className="px-6 py-3 bg-white/80 dark:bg-green-900/30 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-green-800/30 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-green-800/50 transition-all active:scale-95"
              >
                Start First Round
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
