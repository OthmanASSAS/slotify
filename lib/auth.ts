import { compare, hash } from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const SESSION_COOKIE_NAME = 'admin_session'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

/**
 * Create a simple session (stores admin email in cookie)
 * In production, use a more secure session management system
 */
export async function createSession(adminEmail: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, adminEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

/**
 * Get the current admin session
 */
export async function getSession(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

/**
 * Check if the current user is authenticated as admin
 */
export async function isAuthenticated(): Promise<boolean> {
  const email = await getSession()
  if (!email) return false

  const admin = await prisma.admin.findUnique({
    where: { email },
  })

  return admin !== null
}

/**
 * Destroy the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
