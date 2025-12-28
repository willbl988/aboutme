// Simple authentication utility
// In production, replace with proper database-backed auth

export interface User {
  id: string
  email: string
  name: string
}

// Simple in-memory store for demo (replace with database in production)
const users: User[] = [
  { id: '1', email: 'demo@example.com', name: 'Demo User' },
]

// Use a global Map to persist sessions across module reloads
// In production, replace with database-backed sessions
declare global {
  // eslint-disable-next-line no-var
  var __sessions: Map<string, User> | undefined
}

const sessions: Map<string, User> = globalThis.__sessions || new Map<string, User>()

// Preserve sessions across hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.__sessions = sessions
}

export function login(email: string, password: string): User | null {
  // Simple demo login - in production, verify password hash
  const user = users.find(u => u.email === email)
  if (user && password === 'demo') {
    return user
  }
  return null
}

export function register(email: string, name: string, password: string): User {
  const newUser: User = {
    id: String(users.length + 1),
    email,
    name,
  }
  users.push(newUser)
  return newUser
}

export function getUserBySession(sessionId: string): User | null {
  return sessions.get(sessionId) || null
}

export function createSession(user: User): string {
  const sessionId = `session_${Date.now()}_${Math.random()}`
  sessions.set(sessionId, user)
  return sessionId
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

