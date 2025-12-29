'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-red-600 via-red-600 to-red-600 bg-clip-text text-transparent mb-6">
              Error
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {error.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={reset}
              className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}

