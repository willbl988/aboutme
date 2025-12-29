import { NextRequest, NextResponse } from 'next/server'
import { getRounds, createRound } from '@/lib/golf-data-db'
import { getUserBySession } from '@/lib/auth-db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    const rounds = await getRounds(activeOnly)
    return NextResponse.json({ rounds })
  } catch (error) {
    console.error('Failed to get rounds:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getUserBySession(sessionId)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { courseId, players } = await request.json()

    if (!courseId || !players || !Array.isArray(players)) {
      return NextResponse.json(
        { error: 'Course ID and players array are required' },
        { status: 400 }
      )
    }

    const round = await createRound(courseId, user.id, players)
    return NextResponse.json({ round })
  } catch (error: any) {
    console.error('Failed to create round:', error)
    // Return more detailed error message for debugging
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

