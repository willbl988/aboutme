import { NextRequest, NextResponse } from 'next/server'
import { getRounds, createRound } from '@/lib/golf-data-db'
import { getUserBySession } from '@/lib/auth-db'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = request.cookies.get('session')?.value
    if (!sessionId) {
      console.log('[GET /api/rounds] No session cookie found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getUserBySession(sessionId)
    if (!user) {
      console.log('[GET /api/rounds] Invalid session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    try {
      console.log(`[GET /api/rounds] Fetching rounds (activeOnly: ${activeOnly}) for user: ${user.id}`)
      const rounds = await getRounds(activeOnly, user.id)
      console.log(`[GET /api/rounds] Returning ${rounds.length} rounds`)
      
      return NextResponse.json({ rounds })
    } catch (dbError: any) {
      console.error('[GET /api/rounds] Database error:', dbError)
      // Check for common database connection errors
      if (dbError?.code === 'P1001' || dbError?.message?.includes('connect') || dbError?.message?.includes('timeout')) {
        console.error('[GET /api/rounds] Database connection error detected')
        return NextResponse.json(
          { 
            error: 'Database connection error',
            message: 'Unable to connect to database. Please try again later.',
          },
          { status: 503 }
        )
      }
      throw dbError // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('[GET /api/rounds] Failed to get rounds:', error)
    console.error('[GET /api/rounds] Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
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

    const { courseId, players, mode, wager, wagers } = await request.json()

    if (!courseId || !players || !Array.isArray(players)) {
      return NextResponse.json(
        { error: 'Course ID and players array are required' },
        { status: 400 }
      )
    }

    const round = await createRound(courseId, user.id, players, mode || 'stroke', wager || null, wagers || null)
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

