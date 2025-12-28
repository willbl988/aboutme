import { NextRequest, NextResponse } from 'next/server'
import { login, createSession } from '@/lib/auth-db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await login(email, password)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const sessionId = await createSession(user.id)

    const response = NextResponse.json({ success: true, user })
    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    // Provide more helpful error messages
    if (error.code === 'P1001' || error.message?.includes('Can\'t reach database')) {
      return NextResponse.json(
        { error: 'Database connection failed. Please check your DATABASE_URL in .env file.' },
        { status: 500 }
      )
    }
    if (error.code === 'P2025' || error.message?.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Database not initialized. Please run: npm run db:migrate' },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

