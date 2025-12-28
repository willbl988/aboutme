export default function Blog() {
  const blogPosts = [
    {
      title: 'My First Blog Post',
      date: 'December 15, 2024',
      excerpt: 'This is a sample blog post. Write about your thoughts, experiences, or anything you find interesting.',
      category: 'Personal',
      readTime: '5 min read',
    },
    {
      title: 'Learning New Technologies',
      date: 'December 10, 2024',
      excerpt: 'Share your journey of learning new technologies, frameworks, or tools. What challenges did you face?',
      category: 'Technology',
      readTime: '7 min read',
    },
    {
      title: 'Reflections on 2024',
      date: 'December 1, 2024',
      excerpt: 'A reflection on the year, what you learned, and what you\'re looking forward to in the future.',
      category: 'Reflection',
      readTime: '6 min read',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Blog
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          Thoughts, experiences, and insights from my journey.
        </p>

        <div className="space-y-8">
          {blogPosts.map((post, index) => (
            <article
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition p-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                  {post.category}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  {post.readTime}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {post.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {post.date}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                {post.excerpt}
              </p>
              <a
                href="#"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                Read more →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            More blog posts coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}

