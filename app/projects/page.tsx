export default function Projects() {
  const projects = [
    {
      title: 'Project 1',
      description: 'A brief description of your first project. What problem does it solve? What technologies did you use?',
      technologies: ['React', 'TypeScript', 'Tailwind CSS'],
      link: '#',
    },
    {
      title: 'Project 2',
      description: 'A brief description of your second project. Highlight key features and achievements.',
      technologies: ['Next.js', 'Node.js', 'MongoDB'],
      link: '#',
    },
    {
      title: 'Project 3',
      description: 'A brief description of your third project. Showcase your skills and creativity.',
      technologies: ['Python', 'Flask', 'PostgreSQL'],
      link: '#',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Projects
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          A collection of projects I've worked on. Each one represents a learning experience and a step forward.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-200/50 dark:border-gray-700/50 hover:scale-105"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {project.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <a
                href={project.link}
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                View Project →
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

