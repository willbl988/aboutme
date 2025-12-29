// Golf Course API Integration Service
// Supports multiple API providers - easily configurable
// Currently configured for public/accessible APIs

export interface CourseApiResult {
  id: string
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  website?: string
  holes: CourseHole[]
  totalYardage?: number
  totalPar?: number
  rating?: number
  slope?: number
  latitude?: number
  longitude?: number
}

export interface CourseHole {
  number: number
  par: number
  yardage: number
  handicap?: number
  // Additional detailed information
  mensHandicap?: number
  womensHandicap?: number
  mensYardage?: number
  womensYardage?: number
}

export interface CourseSearchParams {
  query: string
  location?: string
  limit?: number
}

// API Configuration
// You can switch between different providers by setting GOLF_API_PROVIDER
// Options: 'golfcourseapi' | 'golfapiio' | 'custom' | 'mock' | 'multi' (combines multiple sources)
// For multiple sources, use comma-separated: 'golfcourseapi,popular' or 'golfcourseapi,golfapiio,popular'
const API_PROVIDER = (process.env.GOLF_API_PROVIDER || 'golfcourseapi').toLowerCase()
const GOLF_API_KEY = process.env.GOLF_API_KEY || null

// GolfCourseAPI.com - API with authentication
// Documentation: https://golfcourseapi.com
// Authentication: Authorization: Key YOUR_API_KEY
// Correct base URL: https://api.golfcourseapi.com/v1
const GOLFCOURSEAPI_BASE = 'https://api.golfcourseapi.com/v1'

// GolfAPI.io - Alternative API with 42,000+ courses
// Documentation: https://www.golfapi.io/
// Provides: course info, scorecards, pars, stroke indexes, tees, distances, slope/rating, coordinates
// Note: May require API key - check their documentation
const GOLFAPIIO_BASE = 'https://api.golfapi.io' // Update with actual base URL when available
const GOLFAPIIO_KEY = process.env.GOLFAPIIO_KEY || null

// Custom API endpoint (if you have your own)
const CUSTOM_API_BASE = process.env.CUSTOM_GOLF_API_URL || null

// Popular courses database - a curated list of well-known courses
// This serves as a fallback and supplement to API data
const POPULAR_COURSES_DB: CourseApiResult[] = []

// Cache for course data to avoid repeated API calls
// Cache structure: { courses: CourseApiResult[], fetchedAt: number, pagesFetched: number }
let courseCache: {
  courses: CourseApiResult[]
  fetchedAt: number
  pagesFetched: number
} | null = null

const CACHE_DURATION = 1000 * 60 * 60 // 1 hour cache
const TARGET_CACHE_SIZE = 5000 // Target: cache 5000 courses (250 pages) for better coverage - includes more cities

// Convert GolfCourseAPI.com response format
// API returns: { id, club_name, course_name, location: { address, city, state, country, latitude, longitude }, tees: { male: [...], female: [...] } }
function convertGolfCourseAPICourse(apiCourse: any): CourseApiResult | null {
  try {
    // Get holes from tees - prefer male tees, fallback to female, or first available
    let holes: CourseHole[] = []
    let totalYardage = 0
    let totalPar = 0
    let rating: number | undefined
    let slope: number | undefined

    // Try to get holes from male tees first, then female, then any available
    const tees = apiCourse.tees || {}
    const maleTees = tees.male?.[0] || tees.Male?.[0]
    const femaleTees = tees.female?.[0] || tees.Female?.[0]
    // Get first available tee set from any property
    const teesValues = Object.values(tees) as any[]
    const firstTeeArray = teesValues.find((val) => Array.isArray(val) && val.length > 0) as any[] | undefined
    const anyTees = maleTees || femaleTees || firstTeeArray?.[0]

    if (anyTees && anyTees.holes && Array.isArray(anyTees.holes) && anyTees.holes.length > 0) {
      holes = anyTees.holes.map((hole: any, index: number) => ({
        number: index + 1,
        par: hole.par || 4,
        yardage: hole.yardage || 0,
        handicap: hole.handicap,
        mensHandicap: maleTees?.holes?.[index]?.handicap,
        womensHandicap: femaleTees?.holes?.[index]?.handicap,
        mensYardage: maleTees?.holes?.[index]?.yardage,
        womensYardage: femaleTees?.holes?.[index]?.yardage,
      }))

      totalYardage = anyTees.total_yards || holes.reduce((sum, hole) => sum + hole.yardage, 0)
      totalPar = anyTees.par_total || holes.reduce((sum, hole) => sum + hole.par, 0)
      rating = anyTees.course_rating
      slope = anyTees.slope_rating
    } else {
      // If no tees data, create placeholder holes (user can edit after import)
      // Default to 18 holes with standard par 4s
      holes = Array.from({ length: 18 }, (_, i) => ({
        number: i + 1,
        par: 4,
        yardage: 0, // User will need to fill this in
        handicap: i + 1,
      }))
      totalPar = 72
    }

    const location = apiCourse.location || {}

    return {
      id: String(apiCourse.id || Math.random()),
      name: apiCourse.course_name || apiCourse.club_name || 'Unknown Course',
      address: location.address,
      city: location.city,
      state: location.state,
      country: location.country,
      holes,
      totalYardage,
      totalPar,
      rating,
      slope,
      latitude: location.latitude,
      longitude: location.longitude,
    }
  } catch (error) {
    console.error('Error converting GolfCourseAPI course:', error)
    return null
  }
}

// Convert custom API response format (adapt as needed)
function convertCustomAPICourse(apiCourse: any): CourseApiResult | null {
  try {
    // Adapt this based on your custom API's response format
    const holes: CourseHole[] = apiCourse.holes?.map((hole: any) => ({
      number: hole.number,
      par: hole.par,
      yardage: hole.yardage || 0,
      handicap: hole.handicap,
    })) || []

    return {
      id: apiCourse.id,
      name: apiCourse.name,
      address: apiCourse.address,
      city: apiCourse.city,
      state: apiCourse.state,
      country: apiCourse.country,
      holes,
      totalYardage: apiCourse.totalYardage,
      totalPar: apiCourse.totalPar,
      rating: apiCourse.rating,
      slope: apiCourse.slope,
    }
  } catch (error) {
    console.error('Error converting custom API course:', error)
    return null
  }
}

export async function searchCourses(params: CourseSearchParams): Promise<CourseApiResult[]> {
  const { query, limit = 10 } = params

  console.log(`[searchCourses] Provider: ${API_PROVIDER}, Query: "${query}", Limit: ${limit}`)
  console.log(`[searchCourses] API Key: ${GOLF_API_KEY ? 'Set ✓' : 'Not set ✗'}`)

  try {
    // Check if using multiple providers
    const providers = API_PROVIDER.includes(',') 
      ? API_PROVIDER.split(',').map(p => p.trim())
      : [API_PROVIDER]

    let allResults: CourseApiResult[] = []
    const seenIds = new Set<string>()

    // Search each provider and combine results
    for (const provider of providers) {
      try {
        let providerResults: CourseApiResult[] = []
        
        switch (provider) {
          case 'golfcourseapi':
            if (!GOLF_API_KEY) {
              console.warn('[searchCourses] ⚠️  GOLF_API_KEY not set - skipping GolfCourseAPI')
            } else {
              providerResults = await searchGolfCourseAPI(query, limit * 2) // Get more to allow for deduplication
            }
            break
          case 'popular':
            const { searchPopularCourses } = await import('./popular-courses')
            providerResults = searchPopularCourses(query, limit * 2)
            console.log(`[searchCourses] Popular courses DB: Found ${providerResults.length} matches`)
            break
          case 'custom':
            if (CUSTOM_API_BASE) {
              providerResults = await searchCustomAPI(query, limit * 2)
            } else {
              console.warn('CUSTOM_GOLF_API_URL not set, skipping custom API')
            }
            break
          case 'mock':
            providerResults = getMockCourses(query, limit * 2)
            break
          default:
            console.warn(`[searchCourses] Unknown provider: ${provider}, skipping`)
        }

        // Deduplicate by name and location
        for (const course of providerResults) {
          const key = `${course.name.toLowerCase()}_${course.city?.toLowerCase()}_${course.state?.toLowerCase()}`
          if (!seenIds.has(key)) {
            seenIds.add(key)
            allResults.push(course)
          }
        }
      } catch (error) {
        console.error(`[searchCourses] Error with provider ${provider}:`, error)
        // Continue with other providers
      }
    }

    // If no results from any provider, fall back to popular courses + mock
    if (allResults.length === 0) {
      console.log('[searchCourses] No results from providers, using popular courses + mock data')
      const { searchPopularCourses } = await import('./popular-courses')
      const popularResults = searchPopularCourses(query, limit)
      const mockResults = getMockCourses(query, limit)
      allResults = [...popularResults, ...mockResults]
      // Deduplicate
      const deduped: CourseApiResult[] = []
      const seen = new Set<string>()
      for (const course of allResults) {
        const key = `${course.name.toLowerCase()}_${course.city?.toLowerCase()}_${course.state?.toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          deduped.push(course)
        }
      }
      allResults = deduped
    }

    // Sort by relevance (prioritize exact matches, then city matches)
    const sorted = allResults.sort((a, b) => {
      const queryLower = query.toLowerCase()
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const aCity = a.city?.toLowerCase() || ''
      const bCity = b.city?.toLowerCase() || ''

      // Exact name match
      if (aName === queryLower && bName !== queryLower) return -1
      if (bName === queryLower && aName !== queryLower) return 1
      
      // City match
      if (aCity.includes(queryLower) && !bCity.includes(queryLower)) return -1
      if (bCity.includes(queryLower) && !aCity.includes(queryLower)) return 1
      
      // Name starts with query
      if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1
      if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1
      
      return 0
    })

    const finalResults = sorted.slice(0, limit)
    console.log(`[searchCourses] Returning ${finalResults.length} results (from ${providers.length} provider(s))`)
    return finalResults
  } catch (error) {
    console.error('Error searching courses:', error)
    console.warn('[searchCourses] Error occurred, falling back to popular courses + mock data')
    const { searchPopularCourses } = await import('./popular-courses')
    const popularResults = searchPopularCourses(query, limit)
    const mockResults = getMockCourses(query, limit)
    return [...popularResults, ...mockResults].slice(0, limit)
  }
}

// Fetch and cache courses from GolfCourseAPI
async function fetchAndCacheCourses(): Promise<CourseApiResult[]> {
  // Check if we have a valid cache
  if (courseCache && Date.now() - courseCache.fetchedAt < CACHE_DURATION) {
    console.log(`Using cached courses: ${courseCache.courses.length} courses`)
    return courseCache.courses
  }

  if (!GOLF_API_KEY) {
    console.warn('GOLF_API_KEY not set for GolfCourseAPI')
    return []
  }

  console.log('Fetching courses from API (this may take a moment)...')
  const perPage = 20
  const pagesToFetch = Math.ceil(TARGET_CACHE_SIZE / perPage) // 100 pages = 2000 courses
  let allCourses: CourseApiResult[] = []
  let totalPages: number | null = null

  console.log(`Starting to fetch ${pagesToFetch} pages (target: ${TARGET_CACHE_SIZE} courses)...`)

  for (let page = 1; page <= pagesToFetch; page++) {
    try {
      const searchUrl = `${GOLFCOURSEAPI_BASE}/courses?page=${page}&per_page=${perPage}`
      
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Key ${GOLF_API_KEY}`,
        },
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error')
        console.error(`[fetchAndCacheCourses] API error on page ${page}: ${response.status} ${response.statusText}`)
        console.error(`[fetchAndCacheCourses] Error details:`, errorText.substring(0, 500))
        if (response.status === 401) {
          console.error('[fetchAndCacheCourses] ⚠️  Authentication failed - check your API key')
        }
        break
      }

      const data = await response.json()
      
      // Get total pages from metadata if available
      if (data.metadata && !totalPages) {
        totalPages = data.metadata.last_page
        console.log(`[fetchAndCacheCourses] API has ${data.metadata.total_records} courses across ${totalPages} pages`)
      }
      
      // Convert API response to our format
      let pageCourses: CourseApiResult[] = []
      if (data.courses && Array.isArray(data.courses)) {
        pageCourses = data.courses.map(convertGolfCourseAPICourse).filter(Boolean) as CourseApiResult[]
        console.log(`[fetchAndCacheCourses] Page ${page}: Converted ${pageCourses.length} courses from ${data.courses.length} API results`)
      } else if (Array.isArray(data)) {
        pageCourses = data.map(convertGolfCourseAPICourse).filter(Boolean) as CourseApiResult[]
        console.log(`[fetchAndCacheCourses] Page ${page}: Converted ${pageCourses.length} courses from array response`)
      } else {
        console.warn(`[fetchAndCacheCourses] Page ${page}: Unexpected response format:`, Object.keys(data))
      }

      if (pageCourses.length === 0) {
        console.log(`[fetchAndCacheCourses] Page ${page}: No courses converted, stopping`)
        break
      }

      allCourses = allCourses.concat(pageCourses)

      // Progress indicator every 50 pages
      if (page % 50 === 0) {
        console.log(`Fetched ${allCourses.length} courses so far...`)
      }

      // If we got fewer courses than requested, we've reached the end
      if (pageCourses.length < perPage) {
        break
      }
    } catch (err) {
      console.warn(`Error fetching page ${page}:`, err)
      break
    }
  }

  // Only cache if we got some courses
  if (allCourses.length > 0) {
    courseCache = {
      courses: allCourses,
      fetchedAt: Date.now(),
      pagesFetched: Math.ceil(allCourses.length / perPage),
    }
    console.log(`Cached ${allCourses.length} courses from ${courseCache.pagesFetched} pages`)
  } else {
    console.warn('No courses fetched - cache not updated')
  }
  
  return allCourses
}

// GolfCourseAPI.com implementation
async function searchGolfCourseAPI(query: string, limit: number): Promise<CourseApiResult[]> {
  try {
    if (!GOLF_API_KEY) {
      console.warn('GOLF_API_KEY not set for GolfCourseAPI, using mock data')
      return getMockCourses(query, limit)
    }

    // Fetch courses (uses cache if available)
    const allCourses = await fetchAndCacheCourses()
    
    // If no courses were fetched, return empty array or mock data
    if (!allCourses || allCourses.length === 0) {
      console.warn('[searchGolfCourseAPI] No courses fetched from API, returning empty results')
      console.warn('[searchGolfCourseAPI] This might mean the API key is invalid or the API is down')
      return []
    }

    console.log(`[searchGolfCourseAPI] Searching through ${allCourses.length} cached courses for: "${query}"`)
    
    // Log sample of cities in cache for debugging
    const sampleCities = Array.from(new Set(allCourses.map(c => c.city).filter(Boolean).slice(0, 20)))
    console.log(`[searchGolfCourseAPI] Sample cities in cache:`, sampleCities.join(', '))

    // Client-side filtering: The API's search parameter doesn't work properly
    // So we filter and rank the results ourselves based on the query
    if (query && query.trim().length > 0) {
      const queryLower = query.toLowerCase().trim()
      const searchTerms = queryLower.split(/\s+/)
      
      console.log(`[searchGolfCourseAPI] Search terms:`, searchTerms)
      
      // Score and filter courses based on relevance
      const scoredCourses = allCourses
        .map((course) => {
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

          // Check if any search term matches (changed from all to any for better results)
          const anyTermMatches = searchTerms.some((term) => searchableText.includes(term))
          
          if (!anyTermMatches) {
            return null
          }

          // Calculate relevance score
          let score = 0
          const nameLower = course.name.toLowerCase()
          
          // Exact name match gets highest score
          if (nameLower === queryLower) {
            score = 1000
          } else if (nameLower.startsWith(queryLower)) {
            score = 500
          } else if (nameLower.includes(queryLower)) {
            score = 100
          } else {
            // Partial matches
            const matchingTerms = searchTerms.filter((term) => nameLower.includes(term)).length
            score = matchingTerms * 10
          }

          return { course, score }
        })
        .filter((item): item is { course: CourseApiResult; score: number } => item !== null)
        .sort((a, b) => b.score - a.score) // Sort by relevance (highest first)
        .map((item) => item.course)

      console.log(`[searchGolfCourseAPI] Found ${scoredCourses.length} matching courses for "${query}"`)
      if (scoredCourses.length === 0 && allCourses.length > 0) {
        // Log sample course data for debugging
        console.log(`[searchGolfCourseAPI] Sample courses in cache (first 3):`, allCourses.slice(0, 3).map(c => ({
          name: c.name,
          city: c.city,
          state: c.state,
        })))
      }
      return scoredCourses.slice(0, limit)
    }

    return allCourses.slice(0, limit)
  } catch (error) {
    console.error('GolfCourseAPI error:', error)
    // Return mock data as fallback
    return getMockCourses(query, limit)
  }
}

// GolfAPI.io implementation
// Documentation: https://www.golfapi.io/
// Provides comprehensive course data including USGA ratings
async function searchGolfAPIIO(query: string, limit: number): Promise<CourseApiResult[]> {
  // Note: GolfAPI.io may require API key and have different endpoint structure
  // This is a placeholder implementation - update with actual API details when available
  console.log(`[searchGolfAPIIO] Searching for: "${query}"`)
  
  try {
    // Placeholder - update with actual GolfAPI.io endpoint when API key is obtained
    // Example structure (update based on actual API documentation):
    const searchUrl = `${GOLFAPIIO_BASE}/courses/search?q=${encodeURIComponent(query)}&limit=${limit}`
    const headers: HeadersInit = {
      'Accept': 'application/json',
    }

    if (GOLFAPIIO_KEY) {
      headers['Authorization'] = `Bearer ${GOLFAPIIO_KEY}`
      headers['X-API-Key'] = GOLFAPIIO_KEY
    }

    const response = await fetch(searchUrl, { headers })

    if (!response.ok) {
      console.warn(`[searchGolfAPIIO] API request failed: ${response.status}`)
      return []
    }

    const data = await response.json()
    
    // Convert GolfAPI.io response format to our format
    // Update this based on actual API response structure
    if (Array.isArray(data)) {
      return data.map(convertGolfAPIIOCourse).filter(Boolean) as CourseApiResult[]
    } else if (data.courses && Array.isArray(data.courses)) {
      return data.courses.map(convertGolfAPIIOCourse).filter(Boolean) as CourseApiResult[]
    }

    return []
  } catch (error) {
    console.error('[searchGolfAPIIO] Error:', error)
    return []
  }
}

// Convert GolfAPI.io course format to our format
function convertGolfAPIIOCourse(apiCourse: any): CourseApiResult | null {
  try {
    // Update this based on actual GolfAPI.io response structure
    // Expected fields: name, city, state, country, holes, rating, slope, etc.
    if (!apiCourse.name) {
      return null
    }

    const holes: CourseApiResult['holes'] = apiCourse.holes || apiCourse.scorecard || []
    
    return {
      id: apiCourse.id || `golfapiio-${apiCourse.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: apiCourse.name || apiCourse.course_name || '',
      address: apiCourse.address,
      city: apiCourse.city,
      state: apiCourse.state,
      country: apiCourse.country || 'USA',
      phone: apiCourse.phone,
      website: apiCourse.website,
      holes: holes.map((hole: any) => ({
        number: hole.number || hole.hole_number || 0,
        par: hole.par || 4,
        yardage: hole.yardage || hole.length || 0,
        handicap: hole.handicap || hole.stroke_index,
        mensHandicap: hole.mens_handicap,
        womensHandicap: hole.womens_handicap,
        mensYardage: hole.mens_yardage,
        womensYardage: hole.womens_yardage,
      })),
      totalYardage: apiCourse.total_yardage || apiCourse.yardage,
      totalPar: apiCourse.total_par || apiCourse.par,
      rating: apiCourse.rating || apiCourse.course_rating,
      slope: apiCourse.slope || apiCourse.slope_rating,
      latitude: apiCourse.latitude || apiCourse.lat,
      longitude: apiCourse.longitude || apiCourse.lng,
    }
  } catch (error) {
    console.error('Error converting GolfAPI.io course:', error)
    return null
  }
}

// Custom API implementation (for your own API endpoint)
async function searchCustomAPI(query: string, limit: number): Promise<CourseApiResult[]> {
  if (!CUSTOM_API_BASE) {
    return getMockCourses(query, limit)
  }

  try {
    const searchUrl = `${CUSTOM_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
    const headers: HeadersInit = {
      'Accept': 'application/json',
    }

    if (GOLF_API_KEY) {
      headers['Authorization'] = `Bearer ${GOLF_API_KEY}`
      headers['X-API-Key'] = GOLF_API_KEY
    }

    const response = await fetch(searchUrl, { headers })

    if (!response.ok) {
      console.warn('Custom API search failed, using mock data')
      return getMockCourses(query, limit)
    }

    const data = await response.json()
    
    // Adapt based on your API's response format
    if (Array.isArray(data)) {
      return data.map(convertCustomAPICourse).filter(Boolean) as CourseApiResult[]
    } else if (data.courses && Array.isArray(data.courses)) {
      return data.courses.map(convertCustomAPICourse).filter(Boolean) as CourseApiResult[]
    }

    return getMockCourses(query, limit)
  } catch (error) {
    console.error('Custom API error:', error)
    return getMockCourses(query, limit)
  }
}


// Fallback mock data when API key is not available
function getMockCourses(query: string, limit: number): CourseApiResult[] {
  const mockCourses: CourseApiResult[] = [
    {
      id: 'mock-1',
      name: 'Pebble Beach Golf Links',
      address: '1700 17-Mile Drive',
      city: 'Pebble Beach',
      state: 'CA',
      country: 'USA',
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
      id: 'mock-2',
      name: 'Augusta National Golf Club',
      address: '2604 Washington Rd',
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
      rating: 76.2,
      slope: 148,
    },
    {
      id: 'mock-3',
      name: 'Dallas National Golf Club',
      address: '1515 Dallas National Dr',
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
      rating: 74.5,
      slope: 140,
    },
    {
      id: 'mock-4',
      name: 'TPC Four Seasons Las Colinas',
      address: '4150 N MacArthur Blvd',
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
      rating: 73.8,
      slope: 138,
    },
    {
      id: 'mock-5',
      name: 'Cedar Crest Golf Course',
      address: '1800 Southerland Ave',
      city: 'Dallas',
      state: 'TX',
      country: 'USA',
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
  ]

  const filtered = mockCourses.filter((course) =>
    course.name.toLowerCase().includes(query.toLowerCase()) ||
    course.city?.toLowerCase().includes(query.toLowerCase()) ||
    course.state?.toLowerCase().includes(query.toLowerCase())
  )

  return filtered.slice(0, limit)
}

export async function getCourseById(id: string): Promise<CourseApiResult | null> {
  try {
    switch (API_PROVIDER) {
      case 'golfcourseapi':
        if (!GOLF_API_KEY) {
          console.warn('GOLF_API_KEY not set for GolfCourseAPI')
          return null
        }
        const url = `${GOLFCOURSEAPI_BASE}/courses/${id}`
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Key ${GOLF_API_KEY}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          // API might return { course: {...} } or just the course object
          const course = data.course || data
          return convertGolfCourseAPICourse(course)
        }
        return null
      case 'custom':
        if (CUSTOM_API_BASE) {
          const customUrl = `${CUSTOM_API_BASE}/courses/${id}`
          const headers: HeadersInit = { 'Accept': 'application/json' }
          if (GOLF_API_KEY) {
            headers['Authorization'] = `Bearer ${GOLF_API_KEY}`
          }
          const customResponse = await fetch(customUrl, { headers })
          if (customResponse.ok) {
            const data = await customResponse.json()
            return convertCustomAPICourse(data)
          }
        }
        return null
      default:
        return null
    }
  } catch (error) {
    console.error('Error fetching course:', error)
    return null
  }
}

// Helper function to convert API result to our database format
export function convertApiCourseToHoleData(apiCourse: CourseApiResult) {
  return apiCourse.holes.map((hole) => ({
    number: hole.number,
    par: hole.par,
    yardage: hole.yardage,
  }))
}

