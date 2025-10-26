import { NextResponse } from 'next/server'
import { cancellationSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { canCancel } from '@/lib/booking-utils'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { cancellationCode } = cancellationSchema.parse(body)

    // 1. Find the reservation by cancellation code
    const reservation = await prisma.reservation.findUnique({
      where: { cancellationCode },
      include: {
        timeSlot: true,
        allowedEmail: true,
      },
    })

    if (!reservation) {
      return NextResponse.json(
        { error: 'Code d\'annulation invalide' },
        { status: 404 }
      )
    }

    // 2. Check if already cancelled
    if (reservation.cancelledAt) {
      return NextResponse.json(
        { error: 'Cette réservation a déjà été annulée' },
        { status: 400 }
      )
    }

    // 3. Check if cancellation is allowed (24h before)
    if (!canCancel(reservation.reservationDate)) {
      return NextResponse.json(
        { error: 'Impossible d\'annuler moins de 24h avant le créneau' },
        { status: 400 }
      )
    }

    // 4. Cancel the reservation
    const cancelledReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        cancelledAt: new Date(),
      },
      include: {
        timeSlot: true,
        allowedEmail: true,
      },
    })

    return NextResponse.json({
      success: true,
      reservation: cancelledReservation,
    })
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de la réservation' },
      { status: 500 }
    )
  }
}
