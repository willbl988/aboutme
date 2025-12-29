import { NextRequest, NextResponse } from 'next/server'
import { getCourses, createCourse } from '@/lib/golf-data-db'

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
    const { name, holes, address, city, state, country, phone, website, latitude, longitude } = await request.json()

    if (!name || !holes || !Array.isArray(holes)) {
      return NextResponse.json(
        { error: 'Name and holes array are required' },
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
    }

    const course = await createCourse(name, holes, courseData)
    return NextResponse.json({ course })
  } catch (error) {
    console.error('Failed to create course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

