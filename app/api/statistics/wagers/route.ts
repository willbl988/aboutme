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

    // Get all completed rounds with wagers created by this user (limit to recent 200 for performance)
    const rounds = await prisma.round.findMany({
      where: {
        createdById: user.id,
        status: 'completed',
        wagers: {
          not: null as any,
        },
      },
      take: 200, // Limit to recent 200 rounds for performance
      include: {
        Course: {
          select: {
            id: true,
            name: true,
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
            Score: {
              orderBy: { holeNumber: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
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
          // Add other wager types
          if (wager.config.holeValue) {
            totalBet += parseFloat(wager.config.holeValue.replace(/[^0-9.]/g, '') || '0') * 18
          }
          if (wager.config.pointValue) {
            totalBet += parseFloat(wager.config.pointValue.replace(/[^0-9.]/g, '') || '0') * 50 // Estimate
          }
          if (wager.config.matchValue) {
            totalBet += parseFloat(wager.config.matchValue.replace(/[^0-9.]/g, '') || '0')
          }
          if (wager.config.teamValue) {
            totalBet += parseFloat(wager.config.teamValue.replace(/[^0-9.]/g, '') || '0')
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

    // Find best and worst rounds
    let bestRound: any = null
    let worstRound: any = null
    let bestNet = -Infinity
    let worstNet = Infinity

    rounds.forEach((round) => {
      if (!round.wagers || !Array.isArray(round.wagers)) return

      const wagerResults = calculateWagerResults(
        round.wagers as any[],
        round.RoundPlayer,
        round.Course.Hole
      )

      const netAmounts = calculateNetAmounts(wagerResults)
      const userNet = netAmounts.get(user.name)

      if (userNet) {
        if (userNet.net > bestNet) {
          bestNet = userNet.net
          bestRound = {
            roundId: round.id,
            courseName: round.Course.name,
            date: round.createdAt.toISOString(),
            netAmount: userNet.net,
          }
        }
        if (userNet.net < worstNet) {
          worstNet = userNet.net
          worstRound = {
            roundId: round.id,
            courseName: round.Course.name,
            date: round.createdAt.toISOString(),
            netAmount: userNet.net,
          }
        }
      }
    })

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = new Map<string, { rounds: number; netAmount: number }>()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    rounds.forEach((round) => {
      if (round.createdAt < sixMonthsAgo) return

      const monthKey = round.createdAt.toISOString().substring(0, 7) // YYYY-MM
      const wagerResults = calculateWagerResults(
        round.wagers as any[],
        round.RoundPlayer,
        round.Course.Hole
      )
      const netAmounts = calculateNetAmounts(wagerResults)
      const userNet = netAmounts.get(user.name)?.net || 0

      if (!monthlyTrends.has(monthKey)) {
        monthlyTrends.set(monthKey, { rounds: 0, netAmount: 0 })
      }
      const monthData = monthlyTrends.get(monthKey)!
      monthData.rounds++
      monthData.netAmount += userNet
    })

    const monthlyTrendsArray = Array.from(monthlyTrends.entries())
      .map(([month, data]) => ({
        month,
        rounds: data.rounds,
        netAmount: data.netAmount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    return NextResponse.json({
      totalRounds: rounds.length,
      totalBet,
      totalWon,
      totalLost,
      netAmount,
      bestRound: bestRound && bestNet > -Infinity ? bestRound : null,
      worstRound: worstRound && worstNet < Infinity ? worstRound : null,
      monthlyTrends: monthlyTrendsArray,
    })
  } catch (error) {
    console.error('Failed to get wager statistics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

