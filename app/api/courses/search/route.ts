import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'
import { searchCourses } from '@/lib/course-api'

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
    const query = searchParams.get('q') || ''
    const location = searchParams.get('location') || undefined
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    console.log(`[Search API] Query: "${query}", Limit: ${limit}`)

    if (!query || query.trim().length === 0) {
      console.log('[Search API] Empty query, returning empty results')
      return NextResponse.json({ courses: [] })
    }

    // Search for courses
    console.log('[Search API] Calling searchCourses...')
    const courses = await searchCourses({
      query: query.trim(),
      location,
      limit,
    })

    console.log(`[Search API] Found ${courses.length} courses`)
    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Failed to search courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

