import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '../../../../lib/auth-db'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value
    
    if (!sessionId) {
      return NextResponse.json({ user: null })
    }

    const user = await getUserBySession(sessionId)
    
    // If session exists but user not found, session was likely expired or invalid
    if (sessionId && !user) {
      // Clear the invalid cookie
      const response = NextResponse.json({ user: null })
      response.cookies.delete('session')
      return response
    }
    
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null })
  }
}

