import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '../../../../lib/auth-db'

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get('session')?.value
    if (sessionId) {
      await deleteSession(sessionId)
    }

    const response = NextResponse.json({ success: true })
    response.cookies.delete('session')
    return response
  } catch (error) {
    console.error('Logout error:', error)
    const response = NextResponse.json({ success: true })
    response.cookies.delete('session')
    return response
  }
}

