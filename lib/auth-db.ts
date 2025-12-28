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
  const session = await prisma.session.findUnique({
    where: { sessionId },
    include: { user: true },
  })

  if (!session) {
    return null
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: { sessionId },
    })
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  }
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

  await prisma.session.create({
    data: {
      sessionId,
      userId,
      expiresAt,
    },
  })

  return sessionId
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

