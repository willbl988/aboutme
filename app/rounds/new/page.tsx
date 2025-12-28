'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Course {
  id: string
  name: string
  holes: { number: number; par: number; yardage?: number }[]
}

interface Player {
  id: string
  name: string
}

function NewRoundContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get('courseId')

  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [players, setPlayers] = useState<Player[]>([{ id: '1', name: '' }])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
    setPlayers([...players, { id: String(Date.now()), name: '' }])
  }

  const removePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(p => p.id !== id))
    }
  }

  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(p => (p.id === id ? { ...p, name } : p)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) return

    const validPlayers = players.filter(p => p.name.trim())
    if (validPlayers.length === 0) {
      alert('Please add at least one player')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          courseId: selectedCourse.id,
          players: validPlayers,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/rounds/${data.round.id}`)
      } else {
        alert('Failed to create round')
      }
    } catch (error) {
      console.error('Failed to create round:', error)
      alert('An error occurred')
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
                  {course.name} ({course.holes.length} holes)
                </option>
              ))}
            </select>
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
              {players.map((player, index) => (
                <div key={player.id} className="flex gap-4">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    placeholder={`Player ${index + 1} name`}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  {players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayer(player.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
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

