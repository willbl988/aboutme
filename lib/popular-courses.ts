// Popular Golf Courses Database
// A curated list of well-known golf courses to supplement API data
// This ensures popular courses are always searchable even if not in API cache

import { CourseApiResult } from './course-api'

export const POPULAR_COURSES: CourseApiResult[] = [
  // Atlanta Area Courses
  {
    id: 'popular-atlanta-national',
    name: 'Atlanta National Golf Club',
    city: 'Milton',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [420, 550, 410, 180, 450, 420, 560, 200, 440, 430, 170, 540, 410, 400, 420, 160, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
  },
  {
    id: 'popular-east-lake',
    name: 'East Lake Golf Club',
    city: 'Atlanta',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [445, 440, 200, 525, 450, 190, 465, 520, 435, 425, 195, 410, 550, 420, 400, 180, 440, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7340,
    totalPar: 72,
  },
  {
    id: 'popular-atlanta-athletic',
    name: 'Atlanta Athletic Club',
    city: 'Johns Creek',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [430, 420, 200, 540, 440, 410, 190, 550, 450, 420, 180, 430, 560, 400, 420, 170, 440, 530][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
  },
  {
    id: 'popular-sugarloaf',
    name: 'Sugarloaf Golf Club',
    city: 'Duluth',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [410, 540, 420, 190, 440, 400, 550, 200, 430, 410, 170, 530, 400, 420, 410, 160, 510, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7000,
    totalPar: 72,
  },
  // Dallas Area Courses
  {
    id: 'popular-dallas-national',
    name: 'Dallas National Golf Club',
    city: 'Dallas',
    state: 'TX',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [420, 550, 410, 180, 450, 420, 560, 200, 440, 430, 170, 540, 410, 400, 420, 160, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
  },
  {
    id: 'popular-tpc-four-seasons',
    name: 'TPC Four Seasons Las Colinas',
    city: 'Irving',
    state: 'TX',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [410, 420, 180, 540, 430, 400, 200, 550, 440, 410, 170, 420, 560, 390, 410, 160, 430, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7100,
    totalPar: 72,
  },
  // Major Championship Courses
  {
    id: 'popular-augusta',
    name: 'Augusta National Golf Club',
    city: 'Augusta',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 5, 3, 4, 4][i] || 4,
      yardage: [445, 575, 350, 240, 495, 180, 450, 570, 460, 495, 505, 155, 510, 440, 530, 170, 440, 465][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7475,
    totalPar: 72,
  },
  {
    id: 'popular-pebble-beach',
    name: 'Pebble Beach Golf Links',
    city: 'Pebble Beach',
    state: 'CA',
    country: 'USA',
    address: '1700 17-Mile Drive',
    holes: [
      { number: 1, par: 4, yardage: 380, handicap: 11 },
      { number: 2, par: 5, yardage: 516, handicap: 1 },
      { number: 3, par: 4, yardage: 404, handicap: 7 },
      { number: 4, par: 4, yardage: 331, handicap: 15 },
      { number: 5, par: 3, yardage: 195, handicap: 17 },
      { number: 6, par: 5, yardage: 523, handicap: 3 },
      { number: 7, par: 3, yardage: 109, handicap: 18 },
      { number: 8, par: 4, yardage: 428, handicap: 5 },
      { number: 9, par: 4, yardage: 462, handicap: 9 },
      { number: 10, par: 4, yardage: 446, handicap: 6 },
      { number: 11, par: 4, yardage: 390, handicap: 12 },
      { number: 12, par: 3, yardage: 202, handicap: 16 },
      { number: 13, par: 4, yardage: 445, handicap: 4 },
      { number: 14, par: 5, yardage: 580, handicap: 2 },
      { number: 15, par: 4, yardage: 397, handicap: 8 },
      { number: 16, par: 4, yardage: 403, handicap: 10 },
      { number: 17, par: 3, yardage: 178, handicap: 14 },
      { number: 18, par: 5, yardage: 543, handicap: 13 },
    ],
    totalYardage: 6820,
    totalPar: 72,
    rating: 75.5,
    slope: 142,
  },
  {
    id: 'popular-st-andrews',
    name: 'St. Andrews Links - Old Course',
    city: 'St. Andrews',
    state: 'Fife',
    country: 'Scotland',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 3, 4, 4, 5, 4, 3, 4, 4][i] || 4,
      yardage: [376, 453, 397, 463, 568, 412, 371, 175, 352, 386, 174, 348, 465, 618, 455, 423, 495, 357][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6721,
    totalPar: 72,
  },
  {
    id: 'popular-pinehurst',
    name: 'Pinehurst No. 2',
    city: 'Pinehurst',
    state: 'NC',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 4, 4, 5, 3, 4, 4, 3, 4, 4, 4, 5, 4, 3, 4, 3, 4][i] || 4,
      yardage: [402, 507, 387, 528, 617, 219, 424, 502, 191, 617, 483, 484, 605, 473, 202, 528, 191, 451][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7588,
    totalPar: 70,
  },
  {
    id: 'popular-whistling-straits',
    name: 'Whistling Straits',
    city: 'Haven',
    state: 'WI',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 3, 4, 4, 4, 3, 4, 4, 4, 5, 4, 3, 4, 4, 5, 3, 4][i] || 4,
      yardage: [408, 593, 181, 493, 494, 355, 221, 507, 449, 361, 618, 404, 181, 513, 518, 569, 223, 500][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7790,
    totalPar: 72,
  },
]

// Search popular courses database
export function searchPopularCourses(query: string, limit: number = 20): CourseApiResult[] {
  if (!query || query.trim().length === 0) {
    return POPULAR_COURSES.slice(0, limit)
  }

  const queryLower = query.toLowerCase().trim()
  const searchTerms = queryLower.split(/\s+/)

  const filtered = POPULAR_COURSES.filter((course) => {
    const searchableText = [
      course.name,
      course.city,
      course.state,
      course.country,
      course.address,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchTerms.some((term) => searchableText.includes(term))
  })

  // Score and sort by relevance
  const scored = filtered.map((course) => {
    let score = 0
    const nameLower = course.name.toLowerCase()
    const cityLower = course.city?.toLowerCase() || ''
    const stateLower = course.state?.toLowerCase() || ''

    if (nameLower === queryLower) score = 1000
    else if (nameLower.startsWith(queryLower)) score = 500
    else if (nameLower.includes(queryLower)) score = 100
    else if (cityLower.includes(queryLower)) score = 200
    else if (stateLower.includes(queryLower)) score = 150
    else {
      const matchingTerms = searchTerms.filter((term) => 
        nameLower.includes(term) || cityLower.includes(term) || stateLower.includes(term)
      ).length
      score = matchingTerms * 10
    }

    return { course, score }
  })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.course)

  return scored.slice(0, limit)
}

