import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { searchTeeTimes } from '@/lib/tee-times'

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

    // Get search parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || undefined
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined
    const lon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : undefined
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : undefined
    const date = searchParams.get('date') || undefined
    const minDate = searchParams.get('minDate') || undefined
    const maxDate = searchParams.get('maxDate') || undefined
    const players = searchParams.get('players') ? parseInt(searchParams.get('players')!, 10) : undefined

    console.log(`[Tee Times Search] Query: "${query}", Lat: ${lat}, Lon: ${lon}, Date: ${date}`)

    const results = await searchTeeTimes({
      query,
      lat,
      lon,
      radius,
      date,
      minDate,
      maxDate,
      players,
    })

    console.log(`[Tee Times Search] Found ${results.length} tee times`)

    return NextResponse.json({ teeTimes: results })
  } catch (error: any) {
    console.error('[Tee Times Search] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    )
  }
}

