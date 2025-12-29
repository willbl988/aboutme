'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import WeatherWidget from './WeatherWidget'

interface User {
  id: string
  email: string
  name: string
}

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
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
    { href: '/tee-times', label: 'Tee Times' },
    { href: '/team', label: 'Team' },
    { href: '/statistics', label: 'Statistics' },
    { href: '/news', label: 'News' },
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
    <nav className="bg-white/80 dark:bg-green-950/80 backdrop-blur-md border-b border-gray-200/50 dark:border-green-800/30 sticky top-0 z-50">
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
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
            {user && (
              <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {user.name}
              </span>
            )}
            <WeatherWidget />
            <button
              onClick={handleLogout}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition whitespace-nowrap"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
