import { NextResponse } from 'next/server'
import { allowedEmailSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'

// GET - Get all allowed emails (admin only)
export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const emails = await prisma.allowedEmail.findMany({
      orderBy: {
        addedAt: 'desc',
      },
    })

    return NextResponse.json(emails)
  } catch (error) {
    console.error('Error fetching emails:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des emails' },
      { status: 500 }
    )
  }
}

// POST - Add a new allowed email (admin only)
export async function POST(req: Request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { email } = allowedEmailSchema.parse(body)

    // Check if email already exists
    const existing = await prisma.allowedEmail.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Cet email est déjà autorisé' },
        { status: 400 }
      )
    }

    const allowedEmail = await prisma.allowedEmail.create({
      data: { email },
    })

    return NextResponse.json(allowedEmail)
  } catch (error) {
    console.error('Error creating allowed email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de l\'email' },
      { status: 500 }
    )
  }
}

// DELETE - Remove an allowed email (admin only)
export async function DELETE(req: Request) {
  try {
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID manquant' },
        { status: 400 }
      )
    }

    await prisma.allowedEmail.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting allowed email:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'email' },
      { status: 500 }
    )
  }
}
