import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserBySession(sessionId)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all completed rounds for the user
    const rounds = await prisma.round.findMany({
      where: {
        createdById: user.id,
        status: 'completed',
      },
      include: {
        Course: {
          include: {
            Hole: {
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

    // Calculate statistics
    const totalRounds = rounds.length
    const totalHoles = rounds.reduce((sum, round) => sum + (round.Course.Hole.length || 18), 0)
    
    // Calculate average scores per course
    const courseStats: Record<string, { rounds: number; totalScore: number; averageScore: number; bestScore: number; worstScore: number }> = {}
    
    rounds.forEach((round) => {
      const courseName = round.Course.name
      
      // Initialize course stats if not exists
      if (!courseStats[courseName]) {
        courseStats[courseName] = {
          rounds: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: Infinity,
          worstScore: 0,
        }
      }
      
      // Count this round once per course
      // Get the best player score for this round (or average if multiple players)
      const playerScores = round.players
        .filter(p => p.scores.length > 0)
        .map(p => p.scores.reduce((sum, score) => sum + score.score, 0))
      
      if (playerScores.length > 0) {
        // Use the lowest score (best round) for this course
        const roundScore = Math.min(...playerScores)
        courseStats[courseName].rounds++
        courseStats[courseName].totalScore += roundScore
        courseStats[courseName].bestScore = Math.min(courseStats[courseName].bestScore, roundScore)
        courseStats[courseName].worstScore = Math.max(courseStats[courseName].worstScore, roundScore)
      }
    })

    // Calculate averages
    Object.keys(courseStats).forEach((courseName) => {
      const stats = courseStats[courseName]
      if (stats.rounds > 0) {
        stats.averageScore = stats.totalScore / stats.rounds
      }
    })

    // Get best and worst rounds overall (for the user's rounds)
    let bestRound: any = null
    let worstRound: any = null
    let bestScore = Infinity
    let worstScore = 0

    rounds.forEach((round) => {
      round.players.forEach((player) => {
        const totalScore = player.scores.reduce((sum, score) => sum + score.score, 0)
        if (player.scores.length > 0) {
          if (totalScore < bestScore && totalScore > 0) {
            bestScore = totalScore
            bestRound = {
              id: round.id,
              courseName: round.Course.name,
              score: totalScore,
              date: round.createdAt,
            }
          }
          if (totalScore > worstScore) {
            worstScore = totalScore
            worstRound = {
              id: round.id,
              courseName: round.Course.name,
              score: totalScore,
              date: round.createdAt,
            }
          }
        }
      })
    })

    return NextResponse.json({
      totalRounds,
      totalHoles,
      courseStats: Object.entries(courseStats).map(([courseName, stats]) => ({
        courseName,
        ...stats,
      })),
      bestRound,
      worstRound,
      recentRounds: rounds.slice(0, 5).map((round) => ({
        id: round.id,
        courseName: round.Course.name,
        date: round.createdAt,
        players: round.players.map((p) => ({
          name: p.name,
          score: p.scores.reduce((sum, s) => sum + s.score, 0),
        })),
      })),
    })
  } catch (error) {
    console.error('Failed to get statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

