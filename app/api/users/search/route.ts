import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = request.cookies.get('session')?.value
    if (!sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserBySession(sessionId)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search query
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Get user's team members
    const team = await prisma.team.findUnique({
      where: { ownerId: user.id },
      include: {
        Members: {
          select: {
            userId: true,
          },
        },
      },
    })

    // Only search within team members
    const teamMemberIds = team?.Members.map(m => m.userId) || []

    if (teamMemberIds.length === 0) {
      // No team members, return empty
      return NextResponse.json({ users: [] })
    }

    // Search users by name or email (case-insensitive) but only from team
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query.trim(), mode: 'insensitive' } },
              { email: { contains: query.trim(), mode: 'insensitive' } },
            ],
          },
          {
            id: {
              in: teamMemberIds,
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      take: 10, // Limit results
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to search users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

