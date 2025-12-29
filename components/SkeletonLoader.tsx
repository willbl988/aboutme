'use client'

interface SkeletonLoaderProps {
  lines?: number
  className?: string
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`skeleton bg-white/80 dark:bg-green-900/30 rounded-2xl p-6 ${className}`}>
      <div className="skeleton h-6 w-3/4 mb-4 bg-gray-300 dark:bg-green-800/30"></div>
      <div className="skeleton h-4 w-full mb-2 bg-gray-300 dark:bg-green-800/30"></div>
      <div className="skeleton h-4 w-5/6 bg-gray-300 dark:bg-green-800/30"></div>
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-4 mb-2 bg-gray-300 dark:bg-green-800/30 ${
            i === lines - 1 ? 'w-5/6' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

