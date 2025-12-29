import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { bookTeeTime } from '@/lib/tee-times'

export async function POST(request: NextRequest) {
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

    const { teeTimeId, players, playerNames } = await request.json()

    if (!teeTimeId) {
      return NextResponse.json(
        { error: 'Tee time ID is required' },
        { status: 400 }
      )
    }

    if (!players || players < 1) {
      return NextResponse.json(
        { error: 'Number of players must be at least 1' },
        { status: 400 }
      )
    }

    console.log(`[Book Tee Time] User: ${user.email}, TeeTime: ${teeTimeId}, Players: ${players}`)

    const result = await bookTeeTime(teeTimeId, user.id, players, playerNames || [])

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to book tee time' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      bookingId: result.bookingId,
    })
  } catch (error: any) {
    console.error('[Book Tee Time] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

