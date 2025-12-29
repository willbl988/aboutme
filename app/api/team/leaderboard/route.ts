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
    
    const allMembers = Array.from(allMembersMap.values())
    const teamMemberIds = allMembers.map(m => m.userId)

    if (teamMemberIds.length === 0) {
      return NextResponse.json({ leaderboards: [] })
    }

    // Get all completed rounds for team members
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
          where: {
            userId: {
              in: teamMemberIds,
            },
          },
          include: {
            User: {
              select: {
                id: true,
                name: true,
              },
            },
            Score: true,
          },
        },
      },
    })

    // Build leaderboard data
    const leaderboards = [
      {
        title: 'Best Score',
        type: 'best_score',
        entries: calculateBestScoreLeaderboard(allMembers, rounds),
      },
      {
        title: 'Most Rounds',
        type: 'most_rounds',
        entries: calculateMostRoundsLeaderboard(allMembers, rounds),
      },
      {
        title: 'Average Score',
        type: 'average_score',
        entries: calculateAverageScoreLeaderboard(allMembers, rounds),
      },
      {
        title: 'Rounds This Month',
        type: 'rounds_this_month',
        entries: calculateRoundsThisMonthLeaderboard(allMembers, rounds),
      },
    ]

    console.log('Team leaderboard response:', {
      userId: user.id,
      userName: user.name,
      teamMemberIds,
      allMembersCount: allMembers.length,
      roundsCount: rounds.length,
      leaderboardsCount: leaderboards.length,
    })

    return NextResponse.json({ leaderboards })
  } catch (error: any) {
    console.error('Failed to get team leaderboard:', error)
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

function calculateBestScoreLeaderboard(
  members: Array<{ userId: string; name: string }>,
  rounds: any[]
): Array<{ userId: string; name: string; value: number; display: string }> {
  const scores: Record<string, { name: string; best: number | null }> = {}

  members.forEach(member => {
    scores[member.userId] = { name: member.name, best: null }
  })

  rounds.forEach(round => {
    round.RoundPlayer.forEach((player: any) => {
      if (player.userId && scores[player.userId]) {
        const total = player.Score.reduce((sum: number, s: any) => sum + s.score, 0)
        if (total > 0) {
          if (scores[player.userId].best === null || total < scores[player.userId].best!) {
            scores[player.userId].best = total
          }
        }
      }
    })
  })

  return Object.entries(scores)
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      value: data.best || 999,
      display: data.best ? `${data.best}` : 'No rounds',
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 10)
}

function calculateMostRoundsLeaderboard(
  members: Array<{ userId: string; name: string }>,
  rounds: any[]
): Array<{ userId: string; name: string; value: number; display: string }> {
  const counts: Record<string, { name: string; count: number }> = {}

  members.forEach(member => {
    counts[member.userId] = { name: member.name, count: 0 }
  })

  rounds.forEach(round => {
    if (round.createdById && counts[round.createdById]) {
      counts[round.createdById].count++
    }
  })

  return Object.entries(counts)
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      value: data.count,
      display: `${data.count} round${data.count !== 1 ? 's' : ''}`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

function calculateAverageScoreLeaderboard(
  members: Array<{ userId: string; name: string }>,
  rounds: any[]
): Array<{ userId: string; name: string; value: number; display: string }> {
  const scores: Record<string, { name: string; scores: number[] }> = {}

  members.forEach(member => {
    scores[member.userId] = { name: member.name, scores: [] }
  })

  rounds.forEach(round => {
    round.RoundPlayer.forEach((player: any) => {
      if (player.userId && scores[player.userId]) {
        const total = player.Score.reduce((sum: number, s: any) => sum + s.score, 0)
        if (total > 0) {
          scores[player.userId].scores.push(total)
        }
      }
    })
  })

  return Object.entries(scores)
    .map(([userId, data]) => {
      const avg = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0
      return {
        userId,
        name: data.name,
        value: avg || 999,
        display: avg > 0 ? `${avg}` : 'No rounds',
      }
    })
    .sort((a, b) => a.value - b.value)
    .slice(0, 10)
}

function calculateRoundsThisMonthLeaderboard(
  members: Array<{ userId: string; name: string }>,
  rounds: any[]
): Array<{ userId: string; name: string; value: number; display: string }> {
  const now = new Date()
  const thisMonth = now.getMonth()
  const thisYear = now.getFullYear()

  const counts: Record<string, { name: string; count: number }> = {}

  members.forEach(member => {
    counts[member.userId] = { name: member.name, count: 0 }
  })

  rounds.forEach(round => {
    const roundDate = new Date(round.createdAt)
    if (
      roundDate.getMonth() === thisMonth &&
      roundDate.getFullYear() === thisYear &&
      round.createdById &&
      counts[round.createdById]
    ) {
      counts[round.createdById].count++
    }
  })

  return Object.entries(counts)
    .map(([userId, data]) => ({
      userId,
      name: data.name,
      value: data.count,
      display: `${data.count} round${data.count !== 1 ? 's' : ''}`,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10)
}

