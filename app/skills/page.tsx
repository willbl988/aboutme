export default function Skills() {
  const skillCategories = [
    {
      category: 'Programming Languages',
      skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
    },
    {
      category: 'Frontend',
      skills: ['React', 'Next.js', 'Vue.js', 'HTML5', 'CSS3', 'Tailwind CSS'],
    },
    {
      category: 'Backend',
      skills: ['Node.js', 'Express', 'Django', 'Flask', 'REST APIs'],
    },
    {
      category: 'Databases',
      skills: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis'],
    },
    {
      category: 'Tools & Technologies',
      skills: ['Git', 'Docker', 'AWS', 'CI/CD', 'Linux'],
    },
    {
      category: 'Other Skills',
      skills: ['Agile', 'Scrum', 'Problem Solving', 'Team Leadership'],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Skills
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          A comprehensive overview of my technical skills and competencies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {skillCategories.map((category, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-200/50 dark:border-gray-700/50"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {category.category}
              </h2>
              <div className="flex flex-wrap gap-3">
                {category.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-indigo-200/50 dark:border-indigo-800/30">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Always Learning
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            I believe in continuous learning and staying up-to-date with the latest technologies and best practices.
            The tech industry evolves rapidly, and I'm committed to growing alongside it.
          </p>
        </div>
      </div>
    </div>
  )
}

