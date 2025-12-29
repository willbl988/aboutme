import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { prisma } from '@/lib/db'

// GET - Get current user's team members
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

    // Get or create team for user
    let team = await (prisma as any).team.findUnique({
      where: { ownerId: user.id },
      include: {
        Members: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    // Create team if it doesn't exist
    if (!team) {
      team = await (prisma as any).team.create({
        data: {
          ownerId: user.id,
        },
        include: {
          Members: {
            include: {
              User: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      })
    }

    // Also include users who have added the current user to their teams (bidirectional)
    const usersWhoAddedMe = await (prisma as any).teamMember.findMany({
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
                email: true,
              },
            },
          },
        },
      },
    })

    // Combine members from both directions
    const directMembers = (team?.Members || []).map((m: any) => ({
      id: m.id,
      userId: m.userId,
      name: m.User.name,
      email: m.User.email,
      addedAt: m.createdAt,
    }))

    const reverseMembers = usersWhoAddedMe
      .filter((tm: any) => tm.Team.ownerId !== user.id) // Exclude self
      .map((tm: any) => ({
        id: tm.id,
        userId: tm.Team.ownerId,
        name: tm.Team.Owner.name,
        email: tm.Team.Owner.email,
        addedAt: tm.createdAt,
      }))

    // Merge and deduplicate by userId
    const allMembersMap = new Map<string, typeof directMembers[0]>()
    directMembers.forEach((m: any) => allMembersMap.set(m.userId, m))
    reverseMembers.forEach((m: any) => {
      if (!allMembersMap.has(m.userId)) {
        allMembersMap.set(m.userId, m)
      }
    })

    const members = Array.from(allMembersMap.values())

    console.log('Team GET response:', {
      userId: user.id,
      userName: user.name,
      directMembersCount: directMembers.length,
      reverseMembersCount: reverseMembers.length,
      totalMembersCount: members.length,
      memberIds: members.map(m => ({ userId: m.userId, name: m.name })),
    })

    return NextResponse.json({ team: { id: team.id, members } })
  } catch (error: any) {
    console.error('Failed to get team:', error)
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

// POST - Add member to team
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value
    console.log('[POST /api/team] Session ID present:', sessionId ? 'yes' : 'no')
    
    if (!sessionId) {
      console.log('[POST /api/team] No session cookie found')
      return NextResponse.json({ error: 'Unauthorized - No session found' }, { status: 401 })
    }

    const user = await getUserBySession(sessionId)
    console.log('[POST /api/team] User from session:', user ? `${user.email} (${user.id})` : 'null')
    
    if (!user) {
      console.log('[POST /api/team] Session invalid or expired')
      return NextResponse.json({ error: 'Unauthorized - Session invalid or expired' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Don't allow adding yourself
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot add yourself to team' },
        { status: 400 }
      )
    }

    // Get or create team
    let team = await (prisma as any).team.findUnique({
      where: { ownerId: user.id },
    })

    if (!team) {
      team = await (prisma as any).team.create({
        data: {
          ownerId: user.id,
        },
      })
    }

    // Check if user exists
    const userToAdd = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if already in team (either you added them or they added you)
    const existingMember = await (prisma as any).teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: userId,
        },
      },
    })

    // Also check if they've added you to their team (bidirectional relationship)
    let otherUserTeam = await (prisma as any).team.findUnique({
      where: { ownerId: userId },
    })

    const theyAddedMe = otherUserTeam ? await (prisma as any).teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: otherUserTeam.id,
          userId: user.id,
        },
      },
    }) : null

    if (existingMember || theyAddedMe) {
      return NextResponse.json(
        { error: 'User is already in your team' },
        { status: 400 }
      )
    }

    // Add to team
    const teamMember = await (prisma as any).teamMember.create({
      data: {
        teamId: team.id,
        userId: userId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Also add current user to the other person's team (bidirectional relationship)
    // Reuse otherUserTeam variable - create team if it doesn't exist

    if (!otherUserTeam) {
      // Create team for the other user if it doesn't exist
      otherUserTeam = await (prisma as any).team.create({
        data: {
          ownerId: userId,
        },
      })
    }

    // Check if current user is already in the other person's team
    const existingReverseMember = await (prisma as any).teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: otherUserTeam.id,
          userId: user.id,
        },
      },
    })

    // Add current user to other person's team if not already there
    if (!existingReverseMember) {
      await (prisma as any).teamMember.create({
        data: {
          teamId: otherUserTeam.id,
          userId: user.id,
        },
      })
    }

    return NextResponse.json({
      member: {
        id: teamMember.id,
        userId: teamMember.userId,
        name: teamMember.User.name,
        email: teamMember.User.email,
        addedAt: teamMember.createdAt,
      },
    })
  } catch (error: any) {
    console.error('Failed to add team member:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User is already in your team' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove member from team
export async function DELETE(request: NextRequest) {
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
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Get team
    const team = await (prisma as any).team.findUnique({
      where: { ownerId: user.id },
    })

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      )
    }

    // Remove from team (bidirectional - remove from both sides)
    await (prisma as any).teamMember.delete({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId: userId,
        },
      },
    })

    // Also remove current user from the other person's team
    const otherUserTeam = await (prisma as any).team.findUnique({
      where: { ownerId: userId },
    })

    if (otherUserTeam) {
      try {
        await (prisma as any).teamMember.delete({
          where: {
            teamId_userId: {
              teamId: otherUserTeam.id,
              userId: user.id,
            },
          },
        })
      } catch (error: any) {
        // Ignore if not found (they might have already removed us)
        if (error.code !== 'P2025') {
          throw error
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to remove team member:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Member not found in team' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

