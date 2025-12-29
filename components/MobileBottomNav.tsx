'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/courses', label: 'Courses', icon: '🏌️' },
  { href: '/rounds', label: 'Rounds', icon: '📊' },
  { href: '/team', label: 'Team', icon: '👥' },
  { href: '/statistics', label: 'Stats', icon: '📈' },
  { href: '/news', label: 'News', icon: '📰' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  // Don't show on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-green-950/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-green-800/30 z-50 sm:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] rounded-lg transition-all ${
                active
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className={`text-xs font-medium ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 dark:bg-green-400 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

