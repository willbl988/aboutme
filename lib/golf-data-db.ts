import { prisma } from './db'
import type { Course, Hole, Round, RoundPlayer, Score } from '@prisma/client'

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

// Course functions
export async function getCourses(): Promise<CourseWithHoles[]> {
  return prisma.course.findMany({
    include: {
      Hole: {
        orderBy: { number: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
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

export async function createCourse(name: string, holes: HoleData[]): Promise<CourseWithHoles> {
  return prisma.course.create({
    data: {
      name,
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

