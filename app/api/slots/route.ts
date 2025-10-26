import { NextResponse } from 'next/server'
import { timeSlotSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'

// GET - Get all time slots (public)
export async function GET() {
  try {
    const slots = await prisma.timeSlot.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    })

    return NextResponse.json(slots)
  } catch (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des créneaux' },
      { status: 500 }
    )
  }
}

// POST - Create a new time slot (admin only)
export async function POST(req: Request) {
  try {
    // Check authentication
    const authenticated = await isAuthenticated()
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = timeSlotSchema.parse(body)

    // Verify that endTime is after startTime
    if (data.startTime >= data.endTime) {
      return NextResponse.json(
        { error: 'L\'heure de fin doit être après l\'heure de début' },
        { status: 400 }
      )
    }

    // Check for conflicts with existing slots
    const existingSlot = await prisma.timeSlot.findUnique({
      where: {
        dayOfWeek_startTime_endTime: {
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      },
    })

    if (existingSlot) {
      return NextResponse.json(
        { error: 'Ce créneau existe déjà' },
        { status: 400 }
      )
    }

    const slot = await prisma.timeSlot.create({
      data,
    })

    return NextResponse.json(slot)
  } catch (error) {
    console.error('Error creating slot:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du créneau' },
      { status: 500 }
    )
  }
}
