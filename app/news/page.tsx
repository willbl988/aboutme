'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NewsArticle {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  image?: string
}

export default function NewsPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadNews()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      if (!data.user) {
        router.push('/login')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    }
  }

  const loadNews = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/news', {
        credentials: 'include',
        cache: 'no-store',
      })
      
      if (!response.ok) {
        throw new Error('Failed to load news')
      }
      
      const data = await response.json()
      setArticles(data.articles || [])
    } catch (error) {
      console.error('Failed to load news:', error)
      setError('Failed to load news. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading golf news...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Golf News
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Stay up to date with the latest in golf
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {articles.length === 0 && !loading && (
          <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center border border-gray-200/50 dark:border-green-800/30">
            <p className="text-gray-700 dark:text-gray-300 text-lg">
              No news articles available at the moment. Please check back later.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <a
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all border border-gray-200/50 dark:border-green-800/30 hover:scale-105 overflow-hidden"
            >
              {article.image && (
                <div className="w-full h-48 bg-gradient-to-br from-green-400 to-emerald-500 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded-full text-xs font-semibold">
                    {article.source}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {formatDate(article.pubDate)}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                  {article.description}
                </p>
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm group-hover:underline">
                  Read more →
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={loadNews}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            Refresh News
          </button>
        </div>
      </div>
    </div>
  )
}

