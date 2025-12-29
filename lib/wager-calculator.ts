// Wager calculation utilities

import type { Wager } from './wager-types'

export interface PlayerScore {
  playerId: string
  playerName: string
  scores: { [holeNumber: number]: number }
  total: number
  front9: number
  back9: number
}

export interface WagerResult {
  wagerId: string
  wagerDescription: string
  transactions: Array<{
    from: string // Player name
    to: string // Player name
    amount: string // Amount owed
    reason?: string // Why they owe (e.g., "Won hole 5", "Lowest score")
  }>
}

export function calculateWagerResults(
  wagers: Wager[],
  players: Array<{ id: string; name: string; Score: Array<{ holeNumber: number; score: number }> }>,
  holes: Array<{ number: number; par: number }>
): WagerResult[] {
  const results: WagerResult[] = []

  // Build player score map
  const playerScores: Map<string, PlayerScore> = new Map()
  players.forEach((player) => {
    const scores: { [holeNumber: number]: number } = {}
    let total = 0
    let front9 = 0
    let back9 = 0

    player.Score.forEach((s) => {
      scores[s.holeNumber] = s.score
      total += s.score
      if (s.holeNumber <= 9) {
        front9 += s.score
      } else {
        back9 += s.score
      }
    })

    playerScores.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      scores,
      total,
      front9,
      back9,
    })
  })

  wagers.forEach((wager) => {
    const transactions: WagerResult['transactions'] = []

    // Get participants (if none specified, include all players)
    const participantIds = wager.participants && wager.participants.length > 0
      ? players.filter(p => wager.participants!.includes(p.name)).map(p => p.id)
      : players.map(p => p.id)

    const participantScores = participantIds
      .map(id => playerScores.get(id))
      .filter((ps): ps is PlayerScore => ps !== undefined)

    if (participantScores.length === 0) return

    switch (wager.type) {
      case 'main':
      case 'custom': {
        // Lowest total score wins
        const sorted = [...participantScores].sort((a, b) => a.total - b.total)
        const winner = sorted[0]
        const amount = parseFloat(wager.amount?.replace(/[^0-9.]/g, '') || '0')

        if (amount > 0 && winner) {
          // Losers pay winner
          sorted.slice(1).forEach((loser) => {
            transactions.push({
              from: loser.playerName,
              to: winner.playerName,
              amount: `$${amount.toFixed(2)}`,
              reason: `${winner.playerName} won with ${winner.total} (${loser.playerName} had ${loser.total})`,
            })
          })
        }
        break
      }

      case 'skins': {
        const skinValue = parseFloat(wager.config?.skinValue?.replace(/[^0-9.]/g, '') || '0')
        if (skinValue <= 0) break

        // Calculate skins for each hole
        holes.forEach((hole) => {
          const holeScores = participantScores
            .map(ps => ({
              player: ps,
              score: ps.scores[hole.number] || null,
            }))
            .filter(hs => hs.score !== null) as Array<{ player: PlayerScore; score: number }>

          if (holeScores.length === 0) return

          // Find lowest score
          const minScore = Math.min(...holeScores.map(hs => hs.score))
          const winners = holeScores.filter(hs => hs.score === minScore)

          // If only one winner, they get the skin
          if (winners.length === 1) {
            const winner = winners[0].player
            // All other participants pay
            holeScores
              .filter(hs => hs.player.playerId !== winner.playerId)
              .forEach((loser) => {
                transactions.push({
                  from: loser.player.playerName,
                  to: winner.playerName,
                  amount: `$${skinValue.toFixed(2)}`,
                  reason: `Won hole ${hole.number} (${winner.playerName}: ${minScore}, ${loser.player.playerName}: ${loser.score})`,
                })
              })
          }
          // If tie, skin carries over (no transaction)
        })
        break
      }

      case 'nassau': {
        const frontValue = parseFloat(wager.config?.frontValue?.replace(/[^0-9.]/g, '') || '0')
        const backValue = parseFloat(wager.config?.backValue?.replace(/[^0-9.]/g, '') || '0')
        const overallValue = parseFloat(wager.config?.overallValue?.replace(/[^0-9.]/g, '') || '0')

        // Front 9
        if (frontValue > 0) {
          const sorted = [...participantScores].sort((a, b) => a.front9 - b.front9)
          const winner = sorted[0]
          sorted.slice(1).forEach((loser) => {
            transactions.push({
              from: loser.playerName,
              to: winner.playerName,
              amount: `$${frontValue.toFixed(2)}`,
              reason: `Front 9: ${winner.playerName} won with ${winner.front9} (${loser.playerName} had ${loser.front9})`,
            })
          })
        }

        // Back 9
        if (backValue > 0) {
          const sorted = [...participantScores].sort((a, b) => a.back9 - b.back9)
          const winner = sorted[0]
          sorted.slice(1).forEach((loser) => {
            transactions.push({
              from: loser.playerName,
              to: winner.playerName,
              amount: `$${backValue.toFixed(2)}`,
              reason: `Back 9: ${winner.playerName} won with ${winner.back9} (${loser.playerName} had ${loser.back9})`,
            })
          })
        }

        // Overall
        if (overallValue > 0) {
          const sorted = [...participantScores].sort((a, b) => a.total - b.total)
          const winner = sorted[0]
          sorted.slice(1).forEach((loser) => {
            transactions.push({
              from: loser.playerName,
              to: winner.playerName,
              amount: `$${overallValue.toFixed(2)}`,
              reason: `Overall: ${winner.playerName} won with ${winner.total} (${loser.playerName} had ${loser.total})`,
            })
          })
        }
        break
      }

      case 'side': {
        // Side bets are harder to auto-calculate
        // For now, we'll just show the wager but not calculate automatically
        // Users can manually track these
        break
      }
    }

    if (transactions.length > 0) {
      results.push({
        wagerId: wager.id,
        wagerDescription: wager.description,
        transactions,
      })
    }
  })

  return results
}

// Calculate net amounts owed between players
export interface NetAmount {
  player: string
  net: number // Positive = they receive money, Negative = they owe money
  breakdown: Array<{
    to: string
    amount: number
    reason: string
  }>
}

export function calculateNetAmounts(wagerResults: WagerResult[]): Map<string, NetAmount> {
  const netMap = new Map<string, NetAmount>()

  wagerResults.forEach((result) => {
    result.transactions.forEach((transaction) => {
      // From player owes money
      if (!netMap.has(transaction.from)) {
        netMap.set(transaction.from, {
          player: transaction.from,
          net: 0,
          breakdown: [],
        })
      }
      const fromPlayer = netMap.get(transaction.from)!
      const amount = parseFloat(transaction.amount.replace(/[^0-9.]/g, ''))
      fromPlayer.net -= amount
      fromPlayer.breakdown.push({
        to: transaction.to,
        amount: -amount,
        reason: transaction.reason || '',
      })

      // To player receives money
      if (!netMap.has(transaction.to)) {
        netMap.set(transaction.to, {
          player: transaction.to,
          net: 0,
          breakdown: [],
        })
      }
      const toPlayer = netMap.get(transaction.to)!
      toPlayer.net += amount
      toPlayer.breakdown.push({
        to: transaction.from,
        amount: amount,
        reason: transaction.reason || '',
      })
    })
  })

  return netMap
}

