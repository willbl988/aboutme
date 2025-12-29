// Popular Golf Courses Database
// A curated list of well-known golf courses to supplement API data
// This ensures popular courses are always searchable even if not in API cache

import { CourseApiResult } from './course-api'

// State name to abbreviation mapping for better search
const STATE_MAPPINGS: Record<string, string[]> = {
  'alabama': ['al'],
  'alaska': ['ak'],
  'arizona': ['az'],
  'arkansas': ['ar'],
  'california': ['ca'],
  'colorado': ['co'],
  'connecticut': ['ct'],
  'delaware': ['de'],
  'florida': ['fl'],
  'georgia': ['ga'],
  'hawaii': ['hi'],
  'idaho': ['id'],
  'illinois': ['il'],
  'indiana': ['in'],
  'iowa': ['ia'],
  'kansas': ['ks'],
  'kentucky': ['ky'],
  'louisiana': ['la'],
  'maine': ['me'],
  'maryland': ['md'],
  'massachusetts': ['ma'],
  'michigan': ['mi'],
  'minnesota': ['mn'],
  'mississippi': ['ms'],
  'missouri': ['mo'],
  'montana': ['mt'],
  'nebraska': ['ne'],
  'nevada': ['nv'],
  'new hampshire': ['nh'],
  'new jersey': ['nj'],
  'new mexico': ['nm'],
  'new york': ['ny'],
  'north carolina': ['nc'],
  'north dakota': ['nd'],
  'ohio': ['oh'],
  'oklahoma': ['ok'],
  'oregon': ['or'],
  'pennsylvania': ['pa'],
  'rhode island': ['ri'],
  'south carolina': ['sc'],
  'south dakota': ['sd'],
  'tennessee': ['tn'],
  'texas': ['tx'],
  'utah': ['ut'],
  'vermont': ['vt'],
  'virginia': ['va'],
  'washington': ['wa'],
  'west virginia': ['wv'],
  'wisconsin': ['wi'],
  'wyoming': ['wy'],
  'district of columbia': ['dc'],
}

// Helper function to expand search terms with state name/abbreviation mappings
function expandSearchTerms(terms: string[]): string[] {
  const expanded = new Set<string>(terms)
  
  for (const term of terms) {
    const termLower = term.toLowerCase()
    
    // Check if term is a state name - add abbreviation
    if (STATE_MAPPINGS[termLower]) {
      STATE_MAPPINGS[termLower].forEach(abbr => expanded.add(abbr))
    }
    
    // Check if term is a state abbreviation - add full name
    for (const [stateName, abbreviations] of Object.entries(STATE_MAPPINGS)) {
      if (abbreviations.includes(termLower)) {
        expanded.add(stateName)
        // Also add individual words for multi-word states
        stateName.split(' ').forEach(word => expanded.add(word))
      }
    }
  }
  
  return Array.from(expanded)
}

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
  {
    id: 'popular-peachtree',
    name: 'Peachtree Golf Club',
    city: 'Atlanta',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [430, 420, 190, 540, 440, 410, 200, 550, 450, 420, 180, 430, 560, 400, 420, 170, 440, 530][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
  },
  {
    id: 'popular-ansley',
    name: 'Ansley Golf Club',
    city: 'Atlanta',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [400, 410, 170, 520, 420, 390, 190, 530, 430, 400, 160, 410, 540, 380, 400, 150, 420, 510][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6800,
    totalPar: 72,
  },
  {
    id: 'popular-crabapple',
    name: 'Crabapple Golf Course',
    city: 'Alpharetta',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [410, 530, 420, 180, 440, 400, 540, 200, 430, 410, 170, 520, 400, 420, 410, 160, 500, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6900,
    totalPar: 72,
  },
  {
    id: 'popular-stone-mountain',
    name: 'Stone Mountain Golf Club',
    city: 'Stone Mountain',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [400, 520, 410, 170, 430, 390, 530, 190, 420, 400, 160, 510, 390, 410, 400, 150, 490, 430][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6700,
    totalPar: 72,
  },
  {
    id: 'popular-chastain',
    name: 'Chastain Park Golf Course',
    city: 'Atlanta',
    state: 'GA',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [380, 400, 150, 500, 400, 380, 180, 510, 410, 390, 150, 400, 520, 370, 390, 140, 400, 500][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6400,
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
  {
    id: 'popular-cedar-crest',
    name: 'Cedar Crest Golf Course',
    city: 'Dallas',
    state: 'TX',
    country: 'USA',
    address: '1800 Southerland Ave',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [380, 400, 150, 500, 410, 390, 180, 520, 420, 400, 160, 410, 530, 380, 400, 150, 410, 510][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6800,
    totalPar: 72,
    rating: 72.0,
    slope: 125,
  },
  {
    id: 'popular-tenison-park',
    name: 'Tenison Park Golf Club',
    city: 'Dallas',
    state: 'TX',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [390, 410, 160, 510, 420, 400, 190, 530, 430, 410, 170, 420, 550, 390, 410, 160, 420, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6900,
    totalPar: 72,
  },
  {
    id: 'popular-stevens-park',
    name: 'Stevens Park Golf Course',
    city: 'Dallas',
    state: 'TX',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [400, 420, 170, 520, 430, 410, 200, 540, 440, 420, 180, 430, 560, 400, 420, 170, 430, 530][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7000,
    totalPar: 72,
  },
  {
    id: 'popular-tour-18',
    name: 'Tour 18 Dallas',
    city: 'Flower Mound',
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
    id: 'popular-cowboys',
    name: 'Cowboys Golf Club',
    city: 'Grapevine',
    state: 'TX',
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
  {
    id: 'popular-buffalo-creek',
    name: 'Buffalo Creek Golf Club',
    city: 'Rockwall',
    state: 'TX',
    country: 'USA',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [400, 530, 410, 180, 430, 390, 540, 190, 420, 400, 160, 520, 390, 410, 400, 150, 500, 430][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6800,
    totalPar: 72,
  },
  {
    id: 'popular-heritage-ranch',
    name: 'Heritage Ranch Golf & Country Club',
    city: 'Fairview',
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
  // Mobile, Alabama Area Courses
  {
    id: 'popular-magnolia-grove',
    name: 'Magnolia Grove Golf Course',
    city: 'Mobile',
    state: 'AL',
    country: 'USA',
    address: '7001 Halls Mill Rd',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [410, 540, 420, 190, 440, 400, 550, 200, 430, 420, 180, 530, 410, 390, 420, 170, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7100,
    totalPar: 72,
    rating: 73.5,
    slope: 135,
  },
  {
    id: 'popular-azalea-city',
    name: 'Azalea City Golf Course',
    city: 'Mobile',
    state: 'AL',
    country: 'USA',
    address: '1000 Gaillard Dr',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [390, 410, 160, 510, 420, 400, 190, 530, 430, 410, 170, 420, 550, 390, 410, 160, 420, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6900,
    totalPar: 72,
    rating: 72.0,
    slope: 128,
  },
  {
    id: 'popular-craft-farms',
    name: 'Craft Farms Golf Resort',
    city: 'Gulf Shores',
    state: 'AL',
    country: 'USA',
    address: '3840 Cotton Creek Dr',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [420, 550, 410, 180, 450, 420, 560, 200, 440, 430, 170, 540, 410, 400, 420, 160, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
    rating: 74.0,
    slope: 138,
  },
  {
    id: 'popular-glenlakes',
    name: 'Glenlakes Golf Club',
    city: 'Foley',
    state: 'AL',
    country: 'USA',
    address: '255 Clubhouse Dr',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [400, 420, 170, 520, 430, 410, 200, 540, 440, 420, 180, 430, 560, 400, 420, 170, 430, 530][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7000,
    totalPar: 72,
    rating: 73.2,
    slope: 132,
  },
  {
    id: 'popular-rock-creek',
    name: 'Rock Creek Golf Club',
    city: 'Fairhope',
    state: 'AL',
    country: 'USA',
    address: '6100 Rock Creek Dr',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [410, 530, 400, 180, 440, 410, 550, 190, 430, 410, 170, 530, 400, 390, 410, 160, 510, 430][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6800,
    totalPar: 72,
    rating: 72.5,
    slope: 130,
  },
  // Robert Trent Jones Golf Trail - Alabama
  {
    id: 'popular-rtj-capitol-hill-judge',
    name: 'Capitol Hill - Judge Course',
    city: 'Prattville',
    state: 'AL',
    country: 'USA',
    address: '2600 Constitution Ave',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [420, 550, 410, 180, 450, 420, 560, 200, 440, 430, 170, 540, 410, 400, 420, 160, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
    rating: 74.2,
    slope: 138,
  },
  {
    id: 'popular-rtj-capitol-hill-legislator',
    name: 'Capitol Hill - Legislator Course',
    city: 'Prattville',
    state: 'AL',
    country: 'USA',
    address: '2600 Constitution Ave',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [410, 420, 180, 540, 430, 400, 200, 550, 440, 410, 170, 420, 560, 390, 410, 160, 430, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7100,
    totalPar: 72,
    rating: 73.8,
    slope: 136,
  },
  {
    id: 'popular-rtj-capitol-hill-senator',
    name: 'Capitol Hill - Senator Course',
    city: 'Prattville',
    state: 'AL',
    country: 'USA',
    address: '2600 Constitution Ave',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [400, 530, 410, 180, 430, 390, 540, 190, 420, 400, 160, 520, 390, 410, 400, 150, 500, 430][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6800,
    totalPar: 72,
    rating: 72.5,
    slope: 132,
  },
  {
    id: 'popular-rtj-grand-national-lake',
    name: 'Grand National - Lake Course',
    city: 'Auburn',
    state: 'AL',
    country: 'USA',
    address: '3000 Robert Trent Jones Trail',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [410, 540, 420, 190, 440, 400, 550, 200, 430, 420, 180, 530, 410, 390, 420, 170, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7100,
    totalPar: 72,
    rating: 73.5,
    slope: 135,
  },
  {
    id: 'popular-rtj-grand-national-links',
    name: 'Grand National - Links Course',
    city: 'Auburn',
    state: 'AL',
    country: 'USA',
    address: '3000 Robert Trent Jones Trail',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [390, 410, 160, 510, 420, 400, 190, 530, 430, 410, 170, 420, 550, 390, 410, 160, 420, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6900,
    totalPar: 72,
    rating: 72.0,
    slope: 128,
  },
  {
    id: 'popular-rtj-hampton-cove-highlands',
    name: 'Hampton Cove - Highlands Course',
    city: 'Huntsville',
    state: 'AL',
    country: 'USA',
    address: '450 Old Hwy 431',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [420, 550, 410, 180, 450, 420, 560, 200, 440, 430, 170, 540, 410, 400, 420, 160, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
    rating: 74.0,
    slope: 137,
  },
  {
    id: 'popular-rtj-hampton-cove-river',
    name: 'Hampton Cove - River Course',
    city: 'Huntsville',
    state: 'AL',
    country: 'USA',
    address: '450 Old Hwy 431',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [400, 420, 170, 520, 430, 410, 200, 540, 440, 420, 180, 430, 560, 400, 420, 170, 430, 530][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7000,
    totalPar: 72,
    rating: 73.2,
    slope: 134,
  },
  {
    id: 'popular-rtj-magnolia-grove-crossings',
    name: 'Magnolia Grove - Crossings Course',
    city: 'Mobile',
    state: 'AL',
    country: 'USA',
    address: '7001 Halls Mill Rd',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [410, 540, 420, 190, 440, 400, 550, 200, 430, 420, 180, 530, 410, 390, 420, 170, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7100,
    totalPar: 72,
    rating: 73.5,
    slope: 135,
  },
  {
    id: 'popular-rtj-magnolia-grove-falls',
    name: 'Magnolia Grove - Falls Course',
    city: 'Mobile',
    state: 'AL',
    country: 'USA',
    address: '7001 Halls Mill Rd',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [390, 410, 160, 510, 420, 400, 190, 530, 430, 410, 170, 420, 550, 390, 410, 160, 420, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6900,
    totalPar: 72,
    rating: 72.0,
    slope: 128,
  },
  {
    id: 'popular-rtj-oxmoor-valley-ridge',
    name: 'Oxmoor Valley - Ridge Course',
    city: 'Birmingham',
    state: 'AL',
    country: 'USA',
    address: '100 Sunbelt Pkwy',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [420, 550, 410, 180, 450, 420, 560, 200, 440, 430, 170, 540, 410, 400, 420, 160, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
    rating: 74.2,
    slope: 138,
  },
  {
    id: 'popular-rtj-oxmoor-valley-valley',
    name: 'Oxmoor Valley - Valley Course',
    city: 'Birmingham',
    state: 'AL',
    country: 'USA',
    address: '100 Sunbelt Pkwy',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [410, 420, 180, 540, 430, 400, 200, 550, 440, 410, 170, 420, 560, 390, 410, 160, 430, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7100,
    totalPar: 72,
    rating: 73.8,
    slope: 136,
  },
  {
    id: 'popular-rtj-ross-bridge',
    name: 'Ross Bridge Golf Resort & Spa',
    city: 'Hoover',
    state: 'AL',
    country: 'USA',
    address: '4000 Grand Ave',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [430, 560, 420, 190, 460, 430, 570, 210, 450, 440, 180, 550, 420, 410, 430, 170, 530, 450][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7400,
    totalPar: 72,
    rating: 75.5,
    slope: 142,
  },
  {
    id: 'popular-rtj-shoals-fighting-joe',
    name: 'The Shoals - Fighting Joe Course',
    city: 'Muscle Shoals',
    state: 'AL',
    country: 'USA',
    address: '990 Sunbelt Pkwy',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [420, 550, 410, 180, 450, 420, 560, 200, 440, 430, 170, 540, 410, 400, 420, 160, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7200,
    totalPar: 72,
    rating: 74.0,
    slope: 137,
  },
  {
    id: 'popular-rtj-shoals-schoolmaster',
    name: 'The Shoals - Schoolmaster Course',
    city: 'Muscle Shoals',
    state: 'AL',
    country: 'USA',
    address: '990 Sunbelt Pkwy',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [400, 420, 170, 520, 430, 410, 200, 540, 440, 420, 180, 430, 560, 400, 420, 170, 430, 530][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7000,
    totalPar: 72,
    rating: 73.2,
    slope: 134,
  },
  {
    id: 'popular-rtj-lakewood-azalea',
    name: 'Lakewood Golf Club - Azalea Course',
    city: 'Point Clear',
    state: 'AL',
    country: 'USA',
    address: '1 Grand Blvd',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4][i] || 4,
      yardage: [410, 540, 420, 190, 440, 400, 550, 200, 430, 420, 180, 530, 410, 390, 420, 170, 520, 440][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 7100,
    totalPar: 72,
    rating: 73.5,
    slope: 135,
  },
  {
    id: 'popular-rtj-lakewood-dogwood',
    name: 'Lakewood Golf Club - Dogwood Course',
    city: 'Point Clear',
    state: 'AL',
    country: 'USA',
    address: '1 Grand Blvd',
    holes: Array.from({ length: 18 }, (_, i) => ({
      number: i + 1,
      par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5][i] || 4,
      yardage: [390, 410, 160, 510, 420, 400, 190, 530, 430, 410, 170, 420, 550, 390, 410, 160, 420, 520][i] || 400,
      handicap: i + 1,
    })),
    totalYardage: 6900,
    totalPar: 72,
    rating: 72.0,
    slope: 128,
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

  // Expand search terms to include state name/abbreviation variations
  const expandedTerms = expandSearchTerms(searchTerms)
  
  // Check if this is a state search
  const isStateSearch = expandedTerms.some(term => {
    const termLower = term.toLowerCase()
    // Check if any expanded term is a state name or abbreviation
    if (STATE_MAPPINGS[termLower]) return true
    for (const [stateName, abbreviations] of Object.entries(STATE_MAPPINGS)) {
      if (abbreviations.includes(termLower) || stateName === termLower) return true
    }
    return false
  })
  
  const filtered = POPULAR_COURSES.filter((course) => {
    // For state searches, ONLY match courses in that state
    if (isStateSearch) {
      if (!course.state) {
        return false
      }
      
      const courseStateLower = course.state.toLowerCase()
      
      // Check if course state matches any expanded term
      return expandedTerms.some(term => {
        const termLower = term.toLowerCase()
        
        // Exact match
        if (courseStateLower === termLower) {
          return true
        }
        
        // Check if term is a state name and course state is the abbreviation
        if (STATE_MAPPINGS[termLower] && STATE_MAPPINGS[termLower].includes(courseStateLower)) {
          return true
        }
        
        // Check if term is an abbreviation and course state is the full name
        for (const [stateName, abbreviations] of Object.entries(STATE_MAPPINGS)) {
          if (abbreviations.includes(termLower) && stateName === courseStateLower) {
            return true
          }
        }
        
        return false
      })
    }
    
    // For non-state searches, check searchable text
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

    return expandedTerms.some((term) => searchableText.includes(term.toLowerCase()))
  })

  // Score and sort by relevance
  const scored = filtered.map((course) => {
    let score = 0
    const nameLower = course.name.toLowerCase()
    const cityLower = course.city?.toLowerCase() || ''
    const stateLower = course.state?.toLowerCase() || ''

    // Check against original query and expanded terms
    if (nameLower === queryLower) score = 1000
    else if (nameLower.startsWith(queryLower)) score = 500
    else if (nameLower.includes(queryLower)) score = 100
    else if (cityLower.includes(queryLower)) score = 200
    else if (stateLower.includes(queryLower) || expandedTerms.some(term => stateLower === term)) score = 150
    else {
      // Use expanded terms for matching
      const matchingTerms = expandedTerms.filter((term) => 
        nameLower.includes(term) || cityLower.includes(term) || stateLower.includes(term) || stateLower === term
      ).length
      score = matchingTerms * 10
    }

    return { course, score }
  })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.course)

  return scored.slice(0, limit)
}

