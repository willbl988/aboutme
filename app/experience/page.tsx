export default function Experience() {
  const experiences = [
    {
      title: 'Job Title 1',
      company: 'Company Name',
      period: '2022 - Present',
      description: 'Describe your role, responsibilities, and achievements in this position.',
      achievements: [
        'Key achievement or milestone',
        'Another significant accomplishment',
        'Impact you made',
      ],
    },
    {
      title: 'Job Title 2',
      company: 'Company Name',
      period: '2020 - 2022',
      description: 'Describe your role, responsibilities, and achievements in this position.',
      achievements: [
        'Key achievement or milestone',
        'Another significant accomplishment',
        'Impact you made',
      ],
    },
    {
      title: 'Job Title 3',
      company: 'Company Name',
      period: '2018 - 2020',
      description: 'Describe your role, responsibilities, and achievements in this position.',
      achievements: [
        'Key achievement or milestone',
        'Another significant accomplishment',
        'Impact you made',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Experience
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          My professional journey and the experiences that have shaped my career.
        </p>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border-l-4 border-indigo-600 dark:border-indigo-400"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {exp.title}
                  </h2>
                  <p className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold">
                    {exp.company}
                  </p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium mt-2 md:mt-0">
                  {exp.period}
                </p>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {exp.description}
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                {exp.achievements.map((achievement, achIndex) => (
                  <li key={achIndex}>{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

