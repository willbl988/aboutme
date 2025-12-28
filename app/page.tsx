'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
}

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!response.ok) {
        throw new Error('Auth check failed')
      }
      
      const data = await response.json()
      if (data.user) {
        setUser(data.user)
      } else {
        // No user found - redirect to login
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // On error, still try to redirect to login
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render content if no user (redirecting to login)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6">
            Golf Budz
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Welcome back, {user?.name}! Track your golf rounds and scores in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            href="/courses"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200/50 dark:border-gray-700/50 hover:scale-105"
          >
            <div className="text-4xl mb-4">🏌️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Courses
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Manage golf courses and their hole configurations.
            </p>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              View courses →
            </span>
          </Link>

          <Link
            href="/rounds"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200/50 dark:border-gray-700/50 hover:scale-105"
          >
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Active Rounds
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              View and manage your active golf rounds.
            </p>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              View rounds →
            </span>
          </Link>

          <Link
            href="/rounds/new"
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200/50 dark:border-gray-700/50 hover:scale-105"
          >
            <div className="text-4xl mb-4">➕</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              New Round
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Start a new round and track scores for multiple players.
            </p>
            <span className="text-green-600 dark:text-green-400 font-semibold">
              Start round →
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}
