import { prisma } from './db'
import type { Course, Hole, Round, RoundPlayer, Score } from '@prisma/client'

export interface CourseWithHoles extends Course {
  holes: Hole[]
}

export interface RoundWithDetails extends Round {
  course: CourseWithHoles
  players: (RoundPlayer & {
    scores: Score[]
    mulligans: { holeNumber: number }[]
  })[]
}

export interface Player {
  id: string
  name: string
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
      holes: {
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
      holes: {
        orderBy: { number: 'asc' },
      },
    },
  })
}

export async function createCourse(name: string, holes: HoleData[]): Promise<CourseWithHoles> {
  return prisma.course.create({
    data: {
      name,
      holes: {
        create: holes.map((hole) => ({
          number: hole.number,
          par: hole.par,
          yardage: hole.yardage,
        })),
      },
    },
    include: {
      holes: {
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
      course: {
        include: {
          holes: {
            orderBy: { number: 'asc' },
          },
        },
      },
      players: {
        include: {
          scores: true,
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
      course: {
        include: {
          holes: {
            orderBy: { number: 'asc' },
          },
        },
      },
      players: {
        include: {
          scores: true,
          mulligans: {
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
  players: Player[]
): Promise<RoundWithDetails> {
  // Get course to include in response
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      holes: {
        orderBy: { number: 'asc' },
      },
    },
  })

  if (!course) {
    throw new Error('Course not found')
  }

  // Ensure mulligansAllowed is a valid integer
  const playersData = players.map((player) => {
    let mulligans = 0
    if (player.mulligansAllowed !== undefined && player.mulligansAllowed !== null) {
      mulligans = typeof player.mulligansAllowed === 'number' 
        ? Math.max(0, Math.floor(player.mulligansAllowed))
        : parseInt(String(player.mulligansAllowed), 10) || 0
    }
    return {
      name: player.name,
      mulligansAllowed: mulligans,
    }
  })

  const round = await prisma.round.create({
    data: {
      courseId,
      createdById,
      status: 'active',
      players: {
        create: playersData,
      },
    },
    include: {
      course: {
        include: {
          holes: {
            orderBy: { number: 'asc' },
          },
        },
      },
      players: {
        include: {
          scores: true,
          mulligans: {
            select: {
              holeNumber: true,
            },
          },
        },
      },
    },
  })

  return round
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

