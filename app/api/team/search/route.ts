import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { prisma } from '@/lib/db'

// Search users to add to team (excludes current user and existing team members)
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

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [] })
    }

    // Get team to exclude existing members
    const team = await (prisma as any).team.findUnique({
      where: { ownerId: user.id },
      include: {
        Members: {
          select: {
            userId: true,
          },
        },
      },
    })

    // Also check if users have added the current user to their teams (bidirectional check)
    const usersWhoAddedMe = await (prisma as any).teamMember.findMany({
      where: {
        userId: user.id,
      },
      include: {
        Team: {
          select: {
            ownerId: true,
          },
        },
      },
    })

    const existingMemberIds = new Set<string>()
    
    // Add direct team members
    team?.Members.forEach((m: { userId: string }) => {
      existingMemberIds.add(m.userId)
    })
    
    // Add users who have already added the current user to their teams (bidirectional)
    usersWhoAddedMe.forEach((tm: any) => {
      if (tm.Team.ownerId !== user.id) {
        existingMemberIds.add(tm.Team.ownerId)
      }
    })
    
    // Also exclude the current user
    existingMemberIds.add(user.id)

    // Search users by name or email (case-insensitive)
    // First, let's see all matching users for debugging
    const allMatchingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query.trim(), mode: 'insensitive' } },
          { email: { contains: query.trim(), mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    // Filter out existing members
    const users = allMatchingUsers
      .filter(u => !existingMemberIds.has(u.id))
      .slice(0, 10) // Limit results

    console.log('Team search:', {
      query: query.trim(),
      userId: user.id,
      userName: user.name,
      totalMatches: allMatchingUsers.length,
      matchingUsers: allMatchingUsers.map(u => ({ id: u.id, name: u.name, email: u.email })),
      excludedIds: Array.from(existingMemberIds),
      excludedCount: existingMemberIds.size,
      results: users.length,
      resultUsers: users.map(u => ({ id: u.id, name: u.name, email: u.email })),
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to search users for team:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}