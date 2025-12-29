import { NextRequest, NextResponse } from 'next/server'
import { getUserBySession } from '@/lib/auth-db'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value
    console.log('Auth check - sessionId from cookie:', sessionId ? 'present' : 'missing')
    
    if (!sessionId) {
      console.log('Auth check - No session cookie found')
      return NextResponse.json({ user: null })
    }

    console.log('Auth check - Looking up session:', sessionId)
    const user = await getUserBySession(sessionId)
    console.log('Auth check - User found:', user ? user.email : 'null')
    
    // If session exists but user not found, session was likely expired or invalid
    if (sessionId && !user) {
      console.log('Auth check - Session ID provided but user not found, clearing cookie')
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

