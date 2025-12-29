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

    // Get team
    const team = await prisma.team.findUnique({
      where: { ownerId: user.id },
      include: {
        Members: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Also get users who have added the current user (bidirectional)
    const usersWhoAddedMe = await prisma.teamMember.findMany({
      where: {
        userId: user.id,
      },
      include: {
        Team: {
          include: {
            Owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Combine team members from both directions
    const directMembers = team?.Members.map(m => ({ userId: m.userId, name: m.User.name })) || []
    const reverseMembers = usersWhoAddedMe
      .filter(tm => tm.Team.ownerId !== user.id)
      .map(tm => ({ userId: tm.Team.ownerId, name: tm.Team.Owner.name }))
    
    // Deduplicate
    const allMembersMap = new Map<string, { userId: string; name: string }>()
    directMembers.forEach(m => allMembersMap.set(m.userId, m))
    reverseMembers.forEach(m => allMembersMap.set(m.userId, m))
    
    const uniqueMembers = Array.from(allMembersMap.values())
    const teamMemberIds = uniqueMembers.map(m => m.userId)

    if (teamMemberIds.length === 0) {
      return NextResponse.json({
        statistics: {
          totalMembers: 0,
          totalRounds: 0,
          averageScore: 0,
          bestScore: null,
          mostPlayedCourse: null,
          roundsThisMonth: 0,
          memberStats: [],
        },
      })
    }

    // Get all rounds for team members
    const rounds = await prisma.round.findMany({
      where: {
        createdById: {
          in: teamMemberIds,
        },
        status: 'completed',
      },
      include: {
        Course: {
          select: {
            name: true,
          },
        },
        RoundPlayer: {
          include: {
            Score: true,
          },
        },
      },
    })

    // Calculate statistics
    const totalRounds = rounds.length
    const roundsThisMonth = rounds.filter(
      r => new Date(r.createdAt).getMonth() === new Date().getMonth() &&
           new Date(r.createdAt).getFullYear() === new Date().getFullYear()
    ).length

    // Calculate scores
    const allScores: number[] = []
    rounds.forEach(round => {
      round.RoundPlayer.forEach(player => {
        const total = player.Score.reduce((sum, score) => sum + score.score, 0)
        if (total > 0) {
          allScores.push(total)
        }
      })
    })

    const averageScore = allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0

    const bestScore = allScores.length > 0 ? Math.min(...allScores) : null

    // Most played course
    const courseCounts: Record<string, { name: string; count: number }> = {}
    rounds.forEach(round => {
      const courseName = round.Course.name
      if (!courseCounts[courseName]) {
        courseCounts[courseName] = { name: courseName, count: 0 }
      }
      courseCounts[courseName].count++
    })

    const mostPlayedCourse = Object.values(courseCounts).sort((a, b) => b.count - a.count)[0] || null

    // Member statistics
    const memberStats = await Promise.all(
      uniqueMembers.map(async (member) => {
        const memberRounds = rounds.filter(r => r.createdById === member.userId)
        const memberScores: number[] = []
        
        memberRounds.forEach(round => {
          const player = round.RoundPlayer.find(p => p.userId === member.userId)
          if (player) {
            const total = player.Score.reduce((sum, score) => sum + score.score, 0)
            if (total > 0) {
              memberScores.push(total)
            }
          }
        })

        const avgScore = memberScores.length > 0
          ? Math.round(memberScores.reduce((a, b) => a + b, 0) / memberScores.length)
          : 0

        const best = memberScores.length > 0 ? Math.min(...memberScores) : null

        return {
          userId: member.userId,
          name: member.name,
          roundsPlayed: memberRounds.length,
          averageScore: avgScore,
          bestScore: best,
        }
      })
    )

    const stats = {
      totalMembers: uniqueMembers.length,
      totalRounds,
      averageScore,
      bestScore,
      mostPlayedCourse: mostPlayedCourse?.name || null,
      roundsThisMonth,
      memberStats: memberStats.sort((a, b) => b.roundsPlayed - a.roundsPlayed),
    }

    console.log('Team statistics response:', {
      userId: user.id,
      userName: user.name,
      teamMemberIds,
      uniqueMembersCount: uniqueMembers.length,
      roundsCount: rounds.length,
      stats,
    })

    return NextResponse.json({
      statistics: stats,
    })
  } catch (error: any) {
    console.error('Failed to get team statistics:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    })
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    )
  }
}

