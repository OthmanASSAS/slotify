import { NextResponse } from 'next/server'
import { reservationSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import {
  getAvailableSlots,
  generateCancellationCode,
  hasExistingReservation,
  getDayOfWeek,
} from '@/lib/booking-utils'

// GET - Get all reservations (for admin)
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        allowedEmail: true,
        timeSlot: true,
      },
      orderBy: {
        reservationDate: 'desc',
      },
    })

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des réservations' },
      { status: 500 }
    )
  }
}

// POST - Create a new reservation
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, timeSlotId, reservationDate } = reservationSchema.parse(body)

    const date = new Date(reservationDate)

    // 1. Check if email is allowed
    const allowedEmail = await prisma.allowedEmail.findUnique({
      where: { email },
    })

    if (!allowedEmail) {
      return NextResponse.json(
        { error: 'Email non autorisé à effectuer des réservations' },
        { status: 403 }
      )
    }

    // 2. Get the time slot and verify it exists and is active
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    })

    if (!timeSlot || !timeSlot.isActive) {
      return NextResponse.json(
        { error: 'Créneau horaire invalide ou inactif' },
        { status: 400 }
      )
    }

    // 3. Verify the day of week matches
    const dayOfWeek = getDayOfWeek(date)
    if (timeSlot.dayOfWeek !== dayOfWeek) {
      return NextResponse.json(
        { error: 'Le jour de la semaine ne correspond pas au créneau' },
        { status: 400 }
      )
    }

    // 4. Check if reservation date+time is in the past
    const slotDateTime = new Date(date)
    const [hours, minutes] = timeSlot.startTime.split(':').map(Number)
    slotDateTime.setHours(hours, minutes, 0, 0)

    if (slotDateTime < new Date()) {
      return NextResponse.json(
        { error: 'Impossible de réserver un créneau passé' },
        { status: 400 }
      )
    }

    // 5. Check if user already has a reservation for this slot
    const alreadyReserved = await hasExistingReservation(email, timeSlotId, date)
    if (alreadyReserved) {
      return NextResponse.json(
        { error: 'Vous avez déjà une réservation pour ce créneau' },
        { status: 400 }
      )
    }

    // 6. Check available slots
    const availableSlots = await getAvailableSlots(date, timeSlotId)
    if (availableSlots <= 0) {
      return NextResponse.json(
        { error: 'Aucune place disponible pour ce créneau' },
        { status: 400 }
      )
    }

    // 7. Create the reservation
    const cancellationCode = generateCancellationCode()
    const reservation = await prisma.reservation.create({
      data: {
        allowedEmailId: allowedEmail.id,
        timeSlotId,
        reservationDate: date,
        cancellationCode,
      },
      include: {
        timeSlot: true,
        allowedEmail: true,
      },
    })

    return NextResponse.json({
      success: true,
      reservation,
      cancellationCode,
    })
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la réservation' },
      { status: 500 }
    )
  }
}
