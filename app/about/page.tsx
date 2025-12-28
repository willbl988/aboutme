export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8">
          About Me
        </h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Welcome! I'm excited to share my story with you.
          </p>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Who I Am
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              This is where you can write about yourself, your background, interests, and what makes you unique.
              Share your journey, your passions, and what drives you every day.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              My Background
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Add information about your education, where you're from, or any other relevant background information
              that helps visitors understand your story.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Interests & Hobbies
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Share what you're passionate about outside of work. Whether it's photography, hiking, reading,
              or anything else that brings you joy.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

