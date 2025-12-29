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

    // Get all completed rounds with wagers created by this user
    const rounds = await prisma.round.findMany({
      where: {
        createdById: user.id,
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
    let totalWon = 0
    let totalLost = 0

    // Calculate wager statistics for each round
    rounds.forEach(round => {
      if (!round.wagers || !Array.isArray(round.wagers)) return

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

      const wagerResults = calculateWagerResults(
        round.wagers as any[],
        round.RoundPlayer,
        round.Course.Hole
      )

      const netAmounts = calculateNetAmounts(wagerResults)

      // Find user's net amount
      const userNet = netAmounts.get(user.name)
      if (userNet) {
        if (userNet.net > 0) {
          totalWon += userNet.net
        } else if (userNet.net < 0) {
          totalLost += Math.abs(userNet.net)
        }
      }
    })

    const netAmount = totalWon - totalLost

    return NextResponse.json({
      totalBet,
      totalWon,
      totalLost,
      netAmount,
    })
  } catch (error) {
    console.error('Failed to get wager statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

