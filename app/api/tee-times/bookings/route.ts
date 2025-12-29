import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { getUserBookings } from '@/lib/tee-times'

export async function GET(request: NextRequest) {
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

    const bookings = await getUserBookings(user.id)

    return NextResponse.json({ bookings })
  } catch (error: any) {
    console.error('[Get Bookings] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

