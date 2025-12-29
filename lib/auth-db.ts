import { prisma } from './db'
import * as bcrypt from 'bcryptjs'
import type { User } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  name: string
}

// Hash password helper
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hashSync(password, 10)
}

// Verify password helper
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compareSync(password, hashedPassword)
}

export async function login(email: string, password: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}

export async function register(email: string, name: string, password: string): Promise<AuthUser> {
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}

export async function getUserBySession(sessionId: string): Promise<AuthUser | null> {
  try {
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      console.log('getUserBySession - Invalid sessionId:', sessionId)
      return null
    }

    const trimmedSessionId = sessionId.trim()
    console.log('getUserBySession - Looking up session:', trimmedSessionId, 'length:', trimmedSessionId.length)
    
    // Try to find the session using findUnique
    // Note: The relation name is "User" (capital U) as defined in the schema
    const session = await prisma.session.findUnique({
      where: { 
        sessionId: trimmedSessionId
      },
      include: { User: true },
    })

    if (!session) {
      console.log('getUserBySession - Session not found in database for sessionId:', sessionId)
      return null
    }

    console.log('getUserBySession - Session found, expiresAt:', session.expiresAt, 'now:', new Date())

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      console.log('getUserBySession - Session expired, deleting')
      await prisma.session.delete({
        where: { sessionId: sessionId.trim() },
      })
      return null
    }

    console.log('getUserBySession - Returning user:', session.User.email)
    return {
      id: session.User.id,
      email: session.User.email,
      name: session.User.name,
    }
  } catch (error: any) {
    console.error('getUserBySession - Error:', error)
    console.error('getUserBySession - Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
    })
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  try {
    const session = await prisma.session.create({
      data: {
        sessionId,
        userId,
        expiresAt,
      },
    })
    console.log('Session created successfully:', session.id)
    return sessionId
  } catch (error: any) {
    console.error('Failed to create session:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
    })
    throw error
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionId },
  })
}

// Clean up expired sessions (call this periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}

