import { NextRequest, NextResponse } from 'next/server'
import { getRound, updateScore, completeRound } from '../../../../../lib/golf-data-db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const round = await getRound(params.id)
    if (!round) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      )
    }
    return NextResponse.json({ round })
  } catch (error) {
    console.error('Failed to get round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { action, playerId, holeNumber, score } = body

    if (action === 'updateScore') {
      if (!playerId || !holeNumber || score === undefined) {
        return NextResponse.json(
          { error: 'Player ID, hole number, and score are required' },
          { status: 400 }
        )
      }
      const success = await updateScore(params.id, playerId, holeNumber, score)
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to update score' },
          { status: 500 }
        )
      }
      const round = await getRound(params.id)
      return NextResponse.json({ round })
    }

    if (action === 'complete') {
      const success = await completeRound(params.id)
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to complete round' },
          { status: 500 }
        )
      }
      const round = await getRound(params.id)
      return NextResponse.json({ round })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Failed to update round:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

