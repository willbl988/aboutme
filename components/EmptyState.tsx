'use client'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon = '🏌️', title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white/80 dark:bg-green-900/30 backdrop-blur-sm rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-200/50 dark:border-green-800/30">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-touch px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

