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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

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
    const directMemberIds = team?.Members.map((m: any) => m.userId) || []
    const reverseMemberIds = usersWhoAddedMe
      .filter((tm: any) => tm.Team.ownerId !== user.id)
      .map((tm: any) => tm.Team.ownerId)
    
    const teamMemberIds = Array.from(new Set([...directMemberIds, ...reverseMemberIds]))

    if (teamMemberIds.length === 0) {
      return NextResponse.json({ activities: [] })
    }

    // Build member name map
    const memberMap = new Map<string, string>()
    team?.Members.forEach((m: any) => memberMap.set(m.userId, m.User.name))
    usersWhoAddedMe
      .filter((tm: any) => tm.Team.ownerId !== user.id)
      .forEach((tm: any) => memberMap.set(tm.Team.ownerId, tm.Team.Owner.name))

    // Get recent rounds
    const rounds = await prisma.round.findMany({
      where: {
        createdById: {
          in: teamMemberIds,
        },
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
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    // Build activity feed
    const activities = rounds.map(round => {
      const creatorName = memberMap.get(round.createdById) || 'Unknown'
      const players = round.RoundPlayer.map(p => {
        const total = p.Score.reduce((sum, s) => sum + s.score, 0)
        return {
          name: p.User?.name || p.name,
          score: total > 0 ? total : null,
        }
      })

      return {
        id: round.id,
        type: round.status === 'completed' ? 'round_completed' : 'round_created',
        userName: creatorName,
        courseName: round.Course.name,
        status: round.status,
        mode: round.mode,
        players,
        createdAt: round.createdAt,
      }
    })

    return NextResponse.json({ activities })
  } catch (error: any) {
    console.error('Failed to get team activity:', error)
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

