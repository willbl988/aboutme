import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { prisma } from '@/lib/db'
import { calculateWagerResults, calculateNetAmounts } from '@/lib/wager-calculator'

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
      return NextResponse.json({
        totalBet: 0,
        totalWon: 0,
        totalLost: 0,
        netAmount: 0,
        memberStats: [],
      })
    }

    // Initialize member stats map
    const memberStatsMap = new Map<string, { name: string; bet: number; won: number; lost: number; net: number }>()
    allMembers.forEach(member => {
      memberStatsMap.set(member.userId, {
        name: member.name,
        bet: 0,
        won: 0,
        lost: 0,
        net: 0,
      })
    })

    // Get all completed rounds with wagers for team members
    const rounds = await prisma.round.findMany({
      where: {
        createdById: {
          in: teamMemberIds,
        },
        status: 'completed',
        wagers: {
          not: null as any,
        },
      },
      include: {
        Course: {
          select: {
            Hole: {
              orderBy: { number: 'asc' },
            },
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

    let totalBet = 0

    // Calculate wager statistics for each round
    rounds.forEach(round => {
      if (!round.wagers || !Array.isArray(round.wagers)) return

      // Filter RoundPlayer to only team members
      const teamRoundPlayers = round.RoundPlayer.filter((rp: any) => 
        teamMemberIds.includes(rp.userId || '')
      )

      const wagerResults = calculateWagerResults(
        round.wagers as any[],
        teamRoundPlayers,
        round.Course.Hole
      )

      const netAmounts = calculateNetAmounts(wagerResults)

      // Calculate total bet amount
      round.wagers.forEach((wager: any) => {
        if (wager.amount) {
          const amount = parseFloat(wager.amount.replace(/[^0-9.]/g, '') || '0')
          totalBet += amount
        }
        if (wager.config) {
          if (wager.config.skinValue) {
            const skinValue = parseFloat(wager.config.skinValue.replace(/[^0-9.]/g, '') || '0')
            totalBet += skinValue * 18 // Max possible skins
          }
          if (wager.config.frontValue) {
            totalBet += parseFloat(wager.config.frontValue.replace(/[^0-9.]/g, '') || '0')
          }
          if (wager.config.backValue) {
            totalBet += parseFloat(wager.config.backValue.replace(/[^0-9.]/g, '') || '0')
          }
          if (wager.config.overallValue) {
            totalBet += parseFloat(wager.config.overallValue.replace(/[^0-9.]/g, '') || '0')
          }
        }
      })

      // Update member stats
      netAmounts.forEach((net, playerName) => {
        const member = Array.from(memberStatsMap.values()).find(m => m.name === playerName)
        if (member) {
          if (net.net > 0) {
            member.won += net.net
          } else if (net.net < 0) {
            member.lost += Math.abs(net.net)
          }
          member.net += net.net
        }
      })
    })

    const memberStats = Array.from(memberStatsMap.values())
    const totalWon = memberStats.reduce((sum, m) => sum + m.won, 0)
    const totalLost = memberStats.reduce((sum, m) => sum + m.lost, 0)
    const netAmount = totalWon - totalLost

    return NextResponse.json({
      totalBet,
      totalWon,
      totalLost,
      netAmount,
      memberStats: memberStats.sort((a, b) => b.net - a.net),
    })
  } catch (error: any) {
    console.error('Failed to get team wager statistics:', error)
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

