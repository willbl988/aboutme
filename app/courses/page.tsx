'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Course {
  id: string
  name: string
  Hole: { number: number; par: number; yardage?: number }[]
  createdAt: string
}

interface ApiCourse {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  holes: Array<{ number: number; par: number; yardage: number }>
  totalYardage?: number
  totalPar?: number
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showApiSearch, setShowApiSearch] = useState(false)
  const [apiSearchQuery, setApiSearchQuery] = useState('')
  const [apiSearchResults, setApiSearchResults] = useState<ApiCourse[]>([])
  const [apiSearchLoading, setApiSearchLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [numberOfHoles, setNumberOfHoles] = useState<9 | 18>(18)
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null)
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
        setNumberOfHoles(18) // Reset to default
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

  const searchApiCourses = async () => {
    if (!apiSearchQuery.trim()) return

    setApiSearchLoading(true)
    try {
      const response = await fetch(`/api/courses/search?q=${encodeURIComponent(apiSearchQuery)}`, {
        credentials: 'include',
      })
      const data = await response.json()
      setApiSearchResults(data.courses || [])
    } catch (error) {
      console.error('Failed to search courses:', error)
      setApiSearchResults([])
    } finally {
      setApiSearchLoading(false)
    }
  }

  const importCourse = async (apiCourse: ApiCourse) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: apiCourse.name,
          holes: apiCourse.holes.map((hole) => ({
            number: hole.number,
            par: hole.par,
            yardage: hole.yardage,
          })),
        }),
        credentials: 'include',
      })

      if (response.ok) {
        setShowApiSearch(false)
        setApiSearchQuery('')
        setApiSearchResults([])
        loadCourses()
      }
    } catch (error) {
      console.error('Failed to import course:', error)
    }
  }

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Are you sure you want to delete "${courseName}"? This will also delete all rounds associated with this course. This action cannot be undone.`)) {
      return
    }

    setDeletingCourseId(courseId)
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        loadCourses()
      } else {
        const data = await response.json()
        alert(`Failed to delete course: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
      alert('Failed to delete course. Please try again.')
    } finally {
      setDeletingCourseId(null)
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
            Courses
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => {
                setShowApiSearch(!showApiSearch)
                setShowForm(false)
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm sm:text-base w-full sm:w-auto"
            >
              {showApiSearch ? 'Cancel' : '🔍 Search Courses'}
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm)
                setShowApiSearch(false)
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
            >
              {showForm ? 'Cancel' : '+ Add Course'}
            </button>
          </div>
        </div>

        {showApiSearch && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search Courses</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={apiSearchQuery}
                  onChange={(e) => setApiSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchApiCourses()}
                  placeholder="Search by course name, city, or location..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={searchApiCourses}
                  disabled={apiSearchLoading || !apiSearchQuery.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {apiSearchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {apiSearchResults.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Found {apiSearchResults.length} course(s)
                  </h3>
                  {apiSearchResults.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {course.name}
                          </h4>
                          {(course.city || course.state) && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {[course.city, course.state, course.country].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => importCourse(course)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all text-sm"
                        >
                          Import
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Holes:</span>
                          <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                            {course.Hole.length}
                          </span>
                        </div>
                        {course.totalPar && course.totalPar > 0 ? (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Par:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {course.totalPar}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Par:</span>
                            <span className="ml-2 font-semibold text-gray-500 dark:text-gray-500">
                              N/A
                            </span>
                          </div>
                        )}
                        {course.totalYardage && course.totalYardage > 0 ? (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Yardage:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {course.totalYardage.toLocaleString()} yds
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Yardage:</span>
                            <span className="ml-2 font-semibold text-gray-500 dark:text-gray-500">
                              N/A
                            </span>
                          </div>
                        )}
                      </div>
                      {(!course.totalYardage || course.totalYardage === 0) && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                          ⚠️ This course may not have complete hole details. You can edit after importing.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {apiSearchQuery && !apiSearchLoading && apiSearchResults.length === 0 && (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  No courses found. Try a different search term.
                </p>
              )}
            </div>
          </div>
        )}

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Number of Holes
                </label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (numberOfHoles !== 9) {
                        setNumberOfHoles(9)
                        setFormData({
                          ...formData,
                          holes: Array.from({ length: 9 }, (_, i) => ({
                            number: i + 1,
                            par: 4,
                            yardage: 0,
                          })),
                        })
                      }
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      numberOfHoles === 9
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    9 Holes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (numberOfHoles !== 18) {
                        setNumberOfHoles(18)
                        setFormData({
                          ...formData,
                          holes: Array.from({ length: 18 }, (_, i) => ({
                            number: i + 1,
                            par: 4,
                            yardage: 0,
                          })),
                        })
                      }
                    }}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      numberOfHoles === 18
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    18 Holes
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Holes Configuration
                </label>
                <div className={`grid gap-4 ${numberOfHoles === 9 ? 'grid-cols-3 md:grid-cols-6 lg:grid-cols-9' : 'grid-cols-3 md:grid-cols-6 lg:grid-cols-9'}`}>
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
          <>
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full md:w-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            {courses.filter((course) =>
              course.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-gray-600 dark:text-gray-400 text-lg">No courses found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter((course) =>
                    course.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((course) => (
                    <div
                      key={course.id}
                      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all relative"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {course.name}
                      </h2>
                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600 dark:text-gray-300">
                          {course.Hole.length} holes
                        </p>
                        {course.Hole.length > 0 && course.Hole[0].yardage && (
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Par: <span className="font-semibold text-gray-900 dark:text-white">
                                {course.Hole.reduce((sum, hole) => sum + hole.par, 0)}
                              </span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Total: <span className="font-semibold text-gray-900 dark:text-white">
                                {course.Hole.reduce((sum, hole) => sum + (hole.yardage || 0), 0).toLocaleString()} yds
                              </span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/rounds/new?courseId=${course.id}`}
                          className="text-green-600 dark:text-green-400 font-semibold hover:underline"
                        >
                          Start Round →
                        </Link>
                        <button
                          onClick={() => handleDeleteCourse(course.id, course.name)}
                          disabled={deletingCourseId === course.id}
                          className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-semibold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingCourseId === course.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

