'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Course {
  id: string
  name: string
  holes: { number: number; par: number; yardage?: number }[]
  createdAt: string
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: 4,
      yardage: 0,
    })),
  })

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
      // Only load courses if authenticated
      loadCourses()
    } catch (error) {
      console.error('Auth check failed:', error)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          holes: formData.holes,
        }),
      })

      if (response.ok) {
        setShowForm(false)
        setFormData({
          name: '',
          holes: Array.from({ length: 18 }, (_, i) => ({
            number: i + 1,
            par: 4,
            yardage: 0,
          })),
        })
        loadCourses()
      }
    } catch (error) {
      console.error('Failed to create course:', error)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Courses
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            {showForm ? 'Cancel' : '+ Add Course'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Course</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Pebble Beach Golf Links"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Holes Configuration
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
                  {formData.holes.map((hole, index) => (
                    <div key={index} className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Hole {hole.number}
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="6"
                        value={hole.par}
                        onChange={(e) => {
                          const newHoles = [...formData.holes]
                          newHoles[index].par = parseInt(e.target.value) || 4
                          setFormData({ ...formData, holes: newHoles })
                        }}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        placeholder="Par"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Create Course
              </button>
            </form>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
            <p className="text-gray-600 dark:text-gray-400 text-lg">No courses yet. Create your first course to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {course.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {course.holes.length} holes
                </p>
                <Link
                  href={`/rounds/new?courseId=${course.id}`}
                  className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                >
                  Start Round →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

