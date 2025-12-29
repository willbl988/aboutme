import { prisma } from './db'
import type { Course, Hole, Round, RoundPlayer, Score } from '@prisma/client'

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

// Helper function to get state variations for a search term
function getStateVariations(term: string): string[] {
  const termLower = term.toLowerCase()
  const variations = new Set<string>([term])
  
  // Check if term is a state name - add abbreviation
  if (STATE_MAPPINGS[termLower]) {
    STATE_MAPPINGS[termLower].forEach(abbr => variations.add(abbr))
  }
  
  // Check if term is a state abbreviation - add full name
  for (const [stateName, abbreviations] of Object.entries(STATE_MAPPINGS)) {
    if (abbreviations.includes(termLower)) {
      variations.add(stateName)
      // Also add individual words for multi-word states
      stateName.split(' ').forEach(word => variations.add(word))
    }
  }
  
  return Array.from(variations)
}

export interface CourseWithHoles extends Course {
  Hole: Hole[]
}

export interface RoundWithDetails extends Round {
  Course: CourseWithHoles
  RoundPlayer: (RoundPlayer & {
    Score: Score[]
    Mulligan: { holeNumber: number }[]
  })[]
}

export interface Player {
  id: string
  name: string
  userId?: string // Optional user account ID
  mulligansAllowed?: number
}

export interface HoleData {
  number: number
  par: number
  yardage?: number
}

export interface CourseData {
  name: string
  address?: string
  city?: string
  state?: string
  country?: string
  phone?: string
  website?: string
  latitude?: number
  longitude?: number
  rating?: number
  slope?: number
}

// Course functions
export async function getCourses(searchQuery?: string): Promise<CourseWithHoles[]> {
  // Trim and validate search query
  const trimmedQuery = searchQuery?.trim()
  const hasQuery = trimmedQuery && trimmedQuery.length > 0

  console.log(`[getCourses] Search query: "${trimmedQuery}", Has query: ${hasQuery}`)

  const where = hasQuery
    ? (() => {
        // Get state variations (e.g., "Alabama" -> ["Alabama", "AL", "al"])
        const stateVariations = getStateVariations(trimmedQuery)
        
        // Build OR conditions including state variations
        const orConditions: any[] = [
          { name: { contains: trimmedQuery, mode: 'insensitive' as const } },
          { city: { contains: trimmedQuery, mode: 'insensitive' as const } },
          { country: { contains: trimmedQuery, mode: 'insensitive' as const } },
          { address: { contains: trimmedQuery, mode: 'insensitive' as const } },
        ]
        
        // Add state conditions for each variation
        stateVariations.forEach(variation => {
          orConditions.push({ state: { contains: variation, mode: 'insensitive' as const } })
        })
        
        return { OR: orConditions }
      })()
    : undefined

  const courses = await prisma.course.findMany({
    where,
    include: {
      Hole: {
        orderBy: { number: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log(`[getCourses] Found ${courses.length} courses`)
  if (hasQuery && courses.length > 0) {
    console.log(`[getCourses] Sample course names:`, courses.slice(0, 3).map(c => c.name))
  }

  return courses
}

export async function getCourse(id: string): Promise<CourseWithHoles | null> {
  return prisma.course.findUnique({
    where: { id },
    include: {
      Hole: {
        orderBy: { number: 'asc' },
      },
    },
  })
}

export async function createCourse(
  name: string,
  holes: HoleData[],
  courseData?: Partial<CourseData>
): Promise<CourseWithHoles> {
  try {
    // Build the data object, only including rating/slope if they're defined
    // This allows the code to work even if the migration hasn't been run yet
    const data: any = {
      name,
      address: courseData?.address,
      city: courseData?.city,
      state: courseData?.state,
      country: courseData?.country,
      phone: courseData?.phone,
      website: courseData?.website,
      latitude: courseData?.latitude,
      longitude: courseData?.longitude,
      Hole: {
        create: holes.map((hole) => ({
          number: hole.number,
          par: hole.par,
          yardage: hole.yardage,
        })),
      },
    }

    // Only add rating/slope if they're defined (and not NaN)
    if (courseData?.rating !== undefined && courseData?.rating !== null && !isNaN(courseData.rating)) {
      data.rating = courseData.rating
    }
    if (courseData?.slope !== undefined && courseData?.slope !== null && !isNaN(courseData.slope)) {
      data.slope = courseData.slope
    }

    return await prisma.course.create({
      data,
      include: {
        Hole: {
          orderBy: { number: 'asc' },
        },
      },
    })
  } catch (error: any) {
    console.error('[createCourse] Error creating course:', error)
    console.error('[createCourse] Error message:', error?.message)
    console.error('[createCourse] Error code:', error?.code)
    
    // If the error is about missing columns (rating/slope), try again without them
    // This can happen if the database migration hasn't been run yet
    const errorMessage = error?.message?.toLowerCase() || ''
    const isColumnError = errorMessage.includes('column') && 
                         (errorMessage.includes('rating') || errorMessage.includes('slope')) ||
                         error?.code === 'P2001' ||
                         error?.code === 'P2011' ||
                         error?.code === 'P2012'
    
    if (isColumnError) {
      console.log('[createCourse] Retrying without rating/slope fields (migration may not be applied)')
      try {
        return await prisma.course.create({
          data: {
            name,
            address: courseData?.address,
            city: courseData?.city,
            state: courseData?.state,
            country: courseData?.country,
            phone: courseData?.phone,
            website: courseData?.website,
            latitude: courseData?.latitude,
            longitude: courseData?.longitude,
            Hole: {
              create: holes.map((hole) => ({
                number: hole.number,
                par: hole.par,
                yardage: hole.yardage,
              })),
            },
          },
          include: {
            Hole: {
              orderBy: { number: 'asc' },
            },
          },
        })
      } catch (retryError: any) {
        console.error('[createCourse] Retry also failed:', retryError)
        throw retryError
      }
    }
    throw error
  }
}

export async function deleteCourse(id: string): Promise<boolean> {
  try {
    // Prisma will cascade delete holes and rounds due to onDelete: Cascade in schema
    await prisma.course.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Failed to delete course:', error)
    return false
  }
}

// Round functions
export async function getRounds(activeOnly: boolean = false): Promise<RoundWithDetails[]> {
  return prisma.round.findMany({
    where: activeOnly ? { status: 'active' } : undefined,
    include: {
      Course: {
        include: {
          Hole: {
            orderBy: { number: 'asc' },
          },
        },
      },
      RoundPlayer: {
        include: {
          Score: true,
          Mulligan: {
            select: {
              holeNumber: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRound(id: string): Promise<RoundWithDetails | null> {
  return prisma.round.findUnique({
    where: { id },
    include: {
      Course: {
        include: {
          Hole: {
            orderBy: { number: 'asc' },
          },
        },
      },
      RoundPlayer: {
        include: {
          Score: true,
          Mulligan: {
            select: {
              holeNumber: true,
            },
          },
        },
      },
    },
  })
}

export async function createRound(
  courseId: string,
  createdById: string,
  players: Player[],
  mode: string = 'stroke',
  wager?: string | null,
  wagers?: any[] | null
): Promise<RoundWithDetails> {
  // Get course to include in response
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      Hole: {
        orderBy: { number: 'asc' },
      },
    },
  })

  if (!course) {
    throw new Error('Course not found')
  }

  // Ensure mulligansAllowed is a valid integer and include userId if present
  const playersData = players.map((player) => {
    let mulligans = 0
    if (player.mulligansAllowed !== undefined && player.mulligansAllowed !== null) {
      mulligans = typeof player.mulligansAllowed === 'number' 
        ? Math.max(0, Math.floor(player.mulligansAllowed))
        : parseInt(String(player.mulligansAllowed), 10) || 0
    }
    const playerData: {
      name: string
      mulligansAllowed: number
      userId?: string
    } = {
      name: player.name,
      mulligansAllowed: mulligans,
    }
    // Only include userId if it's actually present
    if (player.userId) {
      playerData.userId = player.userId
    }
    return playerData
  })

  console.log('Creating round with players:', JSON.stringify(playersData, null, 2))

  try {
    const round = await prisma.round.create({
    data: {
      courseId,
      createdById,
      status: 'active',
      mode: mode || 'stroke',
      wager: wager || null, // Legacy field
      wagers: wagers && wagers.length > 0 ? wagers : undefined, // New wagers array (use undefined instead of null for JSON field)
      RoundPlayer: {
        create: playersData,
      },
    },
    include: {
      Course: {
        include: {
          Hole: {
            orderBy: { number: 'asc' },
          },
        },
      },
      RoundPlayer: {
        include: {
          Score: true,
          Mulligan: {
            select: {
              holeNumber: true,
            },
          },
        },
      },
    },
  })

    console.log('Round created successfully:', round.id)
    return round
  } catch (error: any) {
    console.error('Error creating round:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    throw error
  }
}

export async function updateScore(
  roundId: string,
  playerId: string,
  holeNumber: number,
  score: number
): Promise<boolean> {
  try {
    await prisma.score.upsert({
      where: {
        roundId_playerId_holeNumber: {
          roundId,
          playerId,
          holeNumber,
        },
      },
      update: {
        score,
      },
      create: {
        roundId,
        playerId,
        holeNumber,
        score,
      },
    })
    return true
  } catch (error) {
    console.error('Failed to update score:', error)
    return false
  }
}

export async function completeRound(roundId: string): Promise<boolean> {
  try {
    await prisma.round.update({
      where: { id: roundId },
      data: { status: 'completed' },
    })
    return true
  } catch (error) {
    console.error('Failed to complete round:', error)
    return false
  }
}

export async function deleteRound(id: string): Promise<boolean> {
  try {
    // Prisma will cascade delete players, scores, and mulligans due to onDelete: Cascade in schema
    await prisma.round.delete({
      where: { id },
    })
    return true
  } catch (error) {
    console.error('Failed to delete round:', error)
    return false
  }
}

export async function toggleMulligan(
  roundId: string,
  playerId: string,
  holeNumber: number
): Promise<boolean> {
  try {
    // Check if mulligan already exists
    const existing = await prisma.mulligan.findUnique({
      where: {
        roundId_playerId_holeNumber: {
          roundId,
          playerId,
          holeNumber,
        },
      },
    })

    if (existing) {
      // Remove mulligan
      await prisma.mulligan.delete({
        where: {
          roundId_playerId_holeNumber: {
            roundId,
            playerId,
            holeNumber,
          },
        },
      })
    } else {
      // Add mulligan
      await prisma.mulligan.create({
        data: {
          roundId,
          playerId,
          holeNumber,
        },
      })
    }
    return true
  } catch (error) {
    console.error('Failed to toggle mulligan:', error)
    return false
  }
}

