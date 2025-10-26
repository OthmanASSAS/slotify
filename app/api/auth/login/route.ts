import { NextResponse } from 'next/server'
import { adminLoginSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 tentatives max par 15 minutes
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000)

    if (!rateLimit.success) {
      const resetDate = new Date(rateLimit.reset)
      return NextResponse.json(
        {
          error: 'Trop de tentatives de connexion. Réessayez plus tard.',
          retryAfter: resetDate.toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.reset.toString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const body = await req.json()
    const { email, password } = adminLoginSchema.parse(body)

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    })

    if (!admin) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Create session
    await createSession(admin.email)

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.reset.toString(),
        },
      }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
