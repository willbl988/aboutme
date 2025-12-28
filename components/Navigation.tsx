'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
}

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && pathname !== '/login') {
      fetch('/api/auth/me', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user)
          } else if (pathname !== '/login') {
            router.push('/login')
          }
        })
        .catch(() => {
          // Silently fail - let individual pages handle auth
        })
    }
  }, [mounted, pathname, router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
    router.push('/login')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/rounds', label: 'Rounds' },
    { href: '/statistics', label: 'Statistics' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  if (!mounted || pathname === '/login') {
    return null
  }

  return (
    <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Golf Budz
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'border-green-600 dark:border-green-400 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                {user.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              Logout
            </button>
            <div className="sm:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
              >
                <svg
                  className="h-6 w-6"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-green-50 dark:bg-green-950/30 border-green-600 dark:border-green-400 text-green-700 dark:text-green-300'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:border-gray-300 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
