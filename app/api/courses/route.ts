import { NextRequest, NextResponse } from 'next/server'
import { getCourses, createCourse } from '../../../../lib/golf-data-db'

export async function GET() {
  try {
    const courses = await getCourses()
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
    const { name, holes } = await request.json()

    if (!name || !holes || !Array.isArray(holes)) {
      return NextResponse.json(
        { error: 'Name and holes array are required' },
        { status: 400 }
      )
    }

    const course = await createCourse(name, holes)
    return NextResponse.json({ course })
  } catch (error) {
    console.error('Failed to create course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

