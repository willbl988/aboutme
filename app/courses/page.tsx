'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Course {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  website?: string
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
  rating?: number
  slope?: number
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'yours' | 'import'>('yours')
  const [apiSearchQuery, setApiSearchQuery] = useState('')
  const [apiSearchResults, setApiSearchResults] = useState<ApiCourse[]>([])
  const [apiSearchLoading, setApiSearchLoading] = useState(false)
  const [apiSearchPage, setApiSearchPage] = useState(1)
  const [apiSearchTotal, setApiSearchTotal] = useState(0)
  const [apiSearchHasMore, setApiSearchHasMore] = useState(false)
  const [apiSearchLoadingMore, setApiSearchLoadingMore] = useState(false)
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
  
  // Use refs to track and cancel in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentSearchQueryRef = useRef<string>('')
  const apiSearchAbortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  // Auto-search when API search query changes (debounced) - only when import tab is active
  useEffect(() => {
    if (activeTab === 'import' && apiSearchQuery.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchApiCourses(1, false)
      }, 500) // Debounce search
      
      return () => clearTimeout(timeoutId)
    } else if (activeTab === 'import' && apiSearchQuery.trim().length === 0) {
      // Clear results when query is empty
      setApiSearchResults([])
      setApiSearchPage(1)
      setApiSearchTotal(0)
      setApiSearchHasMore(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiSearchQuery, activeTab])

  useEffect(() => {
    if (!loading) {
      // Cancel any pending timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Store the current search query to check against when response arrives
      currentSearchQueryRef.current = searchQuery
      
      // Debounce search
      searchTimeoutRef.current = setTimeout(() => {
        loadCourses()
      }, 300)
      
      return () => {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!response.ok) {
        console.error('Auth check failed with status:', response.status)
        setLoading(false)
        router.push('/login')
        return
      }
      
      const data = await response.json()
      if (!data.user) {
        console.log('No user found, redirecting to login')
        setLoading(false)
        router.push('/login')
        return
      }
      // Only load courses if authenticated
      await loadCourses()
    } catch (error) {
      console.error('Auth check failed:', error)
      setLoading(false)
      // On error, still try to redirect to login
      router.push('/login')
    }
  }

  const loadCourses = async () => {
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller for this request
    const controller = new AbortController()
    abortControllerRef.current = controller
    
    // Store the search query at the start of the request
    const queryAtStart = currentSearchQueryRef.current
    
    try {
      setLoading(true)
      const url = queryAtStart && queryAtStart.trim()
        ? `/api/courses?q=${encodeURIComponent(queryAtStart.trim())}`
        : '/api/courses'
      console.log(`[loadCourses] Fetching from: ${url}, searchQuery: "${queryAtStart}"`)
      
      // Add timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort()
          console.error('[loadCourses] Request timed out after 10 seconds')
        }
      }, 10000) // 10 second timeout
      
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      // Check if this request was cancelled (user typed something new)
      if (controller.signal.aborted) {
        console.log('[loadCourses] Request was cancelled (new search started)')
        return
      }
      
      // Check if the search query has changed since we started
      if (currentSearchQueryRef.current !== queryAtStart) {
        console.log('[loadCourses] Search query changed, ignoring stale response')
        return
      }
      
      if (!response.ok) {
        console.error(`[loadCourses] Failed with status: ${response.status}`)
        setCourses([])
        setLoading(false)
        return
      }
      
      const data = await response.json()
      console.log(`[loadCourses] Received ${data.courses?.length || 0} courses`)
      
      // Double-check the query hasn't changed before setting state
      if (currentSearchQueryRef.current === queryAtStart) {
        setCourses(data.courses || [])
      } else {
        console.log('[loadCourses] Search query changed before state update, ignoring results')
      }
    } catch (error: any) {
      // Ignore abort errors (they're expected when cancelling)
      if (error.name === 'AbortError') {
        console.log('[loadCourses] Request was aborted')
        return
      }
      
      console.error('[loadCourses] Failed to load courses:', error)
      
      // Only update state if this is still the current search
      if (currentSearchQueryRef.current === queryAtStart) {
        setCourses([])
      }
    } finally {
      // Only clear loading if this is still the current search
      if (currentSearchQueryRef.current === queryAtStart && !controller.signal.aborted) {
        setLoading(false)
      }
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

  const searchApiCourses = async (page: number = 1, append: boolean = false) => {
    if (!apiSearchQuery.trim()) {
      setApiSearchResults([])
      setApiSearchPage(1)
      setApiSearchTotal(0)
      setApiSearchHasMore(false)
      return
    }

    // If this is a new search (not loading more), cancel previous and reset
    if (!append) {
      if (apiSearchAbortControllerRef.current) {
        apiSearchAbortControllerRef.current.abort()
      }
      setApiSearchPage(1)
      setApiSearchResults([])
    }

    // Create new abort controller for this request
    const controller = new AbortController()
    apiSearchAbortControllerRef.current = controller
    
    // Store the query at the start of the request
    const queryAtStart = apiSearchQuery.trim()

    if (append) {
      setApiSearchLoadingMore(true)
    } else {
      setApiSearchLoading(true)
    }
    
    try {
      const url = `/api/courses/search?q=${encodeURIComponent(queryAtStart)}&limit=20&page=${page}`
      console.log('[searchApiCourses] Fetching from:', url, append ? '(loading more)' : '(new search)')
      
      const response = await fetch(url, {
        credentials: 'include',
        cache: 'no-store',
        signal: controller.signal,
      })

      // Check if this request was cancelled
      if (controller.signal.aborted) {
        console.log('[searchApiCourses] Request was cancelled (new search started)')
        return
      }

      // Check if the search query has changed
      if (apiSearchQuery.trim() !== queryAtStart) {
        console.log('[searchApiCourses] Search query changed, ignoring stale response')
        return
      }
      
      console.log('[searchApiCourses] Response status:', response.status, response.statusText)
      
      if (!response.ok) {
        if (response.status === 404) {
          console.error('[searchApiCourses] 404 - Route not found. Check if /api/courses/search/route.ts exists')
          alert('Search endpoint not found. Please restart the dev server.')
        } else if (response.status === 401) {
          console.error('[searchApiCourses] 401 - Unauthorized')
          alert('Please log in to search courses.')
        } else {
          const errorText = await response.text().catch(() => 'Unable to read error')
          console.error('[searchApiCourses] Error response:', errorText)
          alert(`Search failed: ${response.status} ${response.statusText}`)
        }
        
        // Only update state if this is still the current search
        if (apiSearchQuery.trim() === queryAtStart && !append) {
          setApiSearchResults([])
          setApiSearchTotal(0)
          setApiSearchHasMore(false)
        }
        return
      }
      
      const data = await response.json()
      console.log('[searchApiCourses] Received data:', data)
      
      // Double-check the query hasn't changed before setting state
      if (apiSearchQuery.trim() === queryAtStart) {
        if (append) {
          // Append new results to existing ones
          setApiSearchResults(prev => [...prev, ...(data.courses || [])])
        } else {
          // Replace results with new ones
          setApiSearchResults(data.courses || [])
        }
        setApiSearchPage(data.page || page)
        setApiSearchTotal(data.total || 0)
        setApiSearchHasMore(data.hasMore || false)
      } else {
        console.log('[searchApiCourses] Search query changed before state update, ignoring results')
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error.name === 'AbortError') {
        console.log('[searchApiCourses] Request was aborted')
        return
      }
      
      console.error('[searchApiCourses] Failed to search courses:', error)
      
      // Only show error and update state if this is still the current search
      if (apiSearchQuery.trim() === queryAtStart && !append) {
        alert(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        setApiSearchResults([])
        setApiSearchTotal(0)
        setApiSearchHasMore(false)
      }
    } finally {
      // Only clear loading if this is still the current search
      if (apiSearchQuery.trim() === queryAtStart && !controller.signal.aborted) {
        if (append) {
          setApiSearchLoadingMore(false)
        } else {
          setApiSearchLoading(false)
        }
      }
    }
  }

  const loadMoreApiCourses = () => {
    if (apiSearchHasMore && !apiSearchLoadingMore) {
      searchApiCourses(apiSearchPage + 1, true)
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
          address: apiCourse.address,
          city: apiCourse.city,
          state: apiCourse.state,
          country: apiCourse.country,
          rating: apiCourse.rating,
          slope: apiCourse.slope,
        }),
        credentials: 'include',
      })

      if (response.ok) {
        // Switch to "Your Courses" tab to show the newly imported course
        setActiveTab('yours')
        setApiSearchQuery('')
        setApiSearchResults([])
        setApiSearchPage(1)
        setApiSearchTotal(0)
        setApiSearchHasMore(false)
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
                setShowForm(!showForm)
                setActiveTab('yours')
              }}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto"
            >
              {showForm ? 'Cancel' : '+ Create Course'}
            </button>
          </div>
        </div>

        {/* Create Course Form - Show before tabs when active */}
        {showForm && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Course</h2>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({
                    name: '',
                    holes: Array.from({ length: 18 }, (_, i) => ({
                      number: i + 1,
                      par: 4,
                      yardage: 0,
                    })),
                  })
                  setNumberOfHoles(18)
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
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

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setActiveTab('yours')
                setShowForm(false)
              }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'yours'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📋 Your Courses
            </button>
            <button
              onClick={() => {
                setActiveTab('import')
                setShowForm(false)
              }}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'import'
                  ? 'border-green-600 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              🌐 Import from Database
            </button>
          </div>
        </div>

        {/* Import Tab Content */}
        {activeTab === 'import' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8 border-2 border-blue-200 dark:border-blue-800/50">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🌐</div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import Course from External Database</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Search 30,000+ golf courses from external databases. Imported courses will be added to your course list.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={apiSearchQuery}
                  onChange={(e) => {
                    setApiSearchQuery(e.target.value)
                    // Reset pagination when query changes
                    setApiSearchPage(1)
                    setApiSearchResults([])
                    setApiSearchTotal(0)
                    setApiSearchHasMore(false)
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && searchApiCourses(1, false)}
                  placeholder="Search 30,000+ courses by name, city, or state (e.g., 'Pebble Beach', 'Dallas', 'Alabama')..."
                  className="flex-1 px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-base"
                />
                <button
                  onClick={() => searchApiCourses(1, false)}
                  disabled={apiSearchLoading || !apiSearchQuery.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {apiSearchLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {apiSearchResults.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Showing {apiSearchResults.length} of {apiSearchTotal} course(s)
                    </h3>
                    {apiSearchHasMore && (
                      <button
                        onClick={loadMoreApiCourses}
                        disabled={apiSearchLoadingMore}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {apiSearchLoadingMore ? 'Loading...' : 'Load More'}
                      </button>
                    )}
                  </div>
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
                            {course.holes.length}
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
                  
                  {apiSearchLoadingMore && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  )}
                  
                  {apiSearchHasMore && !apiSearchLoadingMore && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={loadMoreApiCourses}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                      >
                        Load More ({apiSearchTotal - apiSearchResults.length} remaining)
                      </button>
                    </div>
                  )}
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

        {/* Your Courses Tab Content */}
        {activeTab === 'yours' && (
          <>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🔍</span>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Your Courses
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Filter your existing courses by name, city, state, or address
              </p>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your courses by name, city, state, or address..."
                className="w-full md:w-96 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {courses.length === 0 ? (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  {searchQuery ? 'No courses found matching your search.' : 'No courses yet. Create your first course or import one from the database!'}
                </p>
                {!searchQuery && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setShowForm(true)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
                    >
                      + Create Course
                    </button>
                    <button
                      onClick={() => setActiveTab('import')}
                      className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      🌐 Import from Database
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all relative"
                  >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {course.name}
                    </h2>
                    {(course.city || course.state || course.country) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {[course.city, course.state, course.country].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {course.address && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        {course.address}
                      </p>
                    )}
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
                      {((course as any).rating || (course as any).slope) && (
                        <div className="flex flex-wrap gap-3 text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                          {(course as any).rating && (
                            <span className="text-gray-600 dark:text-gray-400">
                              Rating: <span className="font-semibold text-gray-900 dark:text-white">
                                {(course as any).rating.toFixed(1)}
                              </span>
                            </span>
                          )}
                          {(course as any).slope && (
                            <span className="text-gray-600 dark:text-gray-400">
                              Slope: <span className="font-semibold text-gray-900 dark:text-white">
                                {(course as any).slope}
                              </span>
                            </span>
                          )}
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

