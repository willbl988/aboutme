import { NextRequest, NextResponse } from 'next/server'
import { getCourses, createCourse } from '@/lib/golf-data-db'
import { getUserBySession } from '@/lib/auth-db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchQuery = searchParams.get('q') || undefined
    console.log(`[GET /api/courses] Search query from params: "${searchQuery}"`)
    
    const courses = await getCourses(searchQuery)
    console.log(`[GET /api/courses] Returning ${courses.length} courses`)
    
    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Failed to get courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const sessionId = request.cookies.get('session')?.value
    if (!sessionId) {
      console.log('[POST /api/courses] No session cookie found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getUserBySession(sessionId)
    if (!user) {
      console.log('[POST /api/courses] Invalid session')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('[POST /api/courses] Creating course for user:', user.email)
    const { name, holes, address, city, state, country, phone, website, latitude, longitude, rating, slope } = await request.json()

    console.log('[POST /api/courses] Course data:', {
      name,
      holesCount: holes?.length,
      address,
      city,
      state,
    })

    if (!name || !holes || !Array.isArray(holes)) {
      console.log('[POST /api/courses] Validation failed - missing name or holes')
      return NextResponse.json(
        { error: 'Name and holes array are required' },
        { status: 400 }
      )
    }

    if (holes.length === 0) {
      console.log('[POST /api/courses] Validation failed - empty holes array')
      return NextResponse.json(
        { error: 'At least one hole is required' },
        { status: 400 }
      )
    }

    const courseData = {
      address,
      city,
      state,
      country,
      phone,
      website,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      rating: rating ? parseFloat(rating) : undefined,
      slope: slope ? parseInt(String(slope)) : undefined,
    }

    console.log('[POST /api/courses] Calling createCourse...')
    const course = await createCourse(name, holes, courseData)
    console.log('[POST /api/courses] Course created successfully:', course.id)
    
    return NextResponse.json({ course })
  } catch (error: any) {
    console.error('[POST /api/courses] Failed to create course:', error)
    console.error('[POST /api/courses] Error details:', {
      message: error?.message,
      stack: error?.stack,
    })
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

