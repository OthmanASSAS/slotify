'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

/**
 * Server Action: Récupérer toutes les réservations (protégé)
 */
export async function getReservations() {
  const session = await auth()
  if (!session) {
    redirect('/admin')
  }

  const reservations = await prisma.reservation.findMany({
    include: {
      allowedEmail: {
        select: {
          email: true,
        },
      },
      timeSlot: {
        select: {
          dayOfWeek: true,
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Sérialiser les dates pour le Client Component
  return reservations.map(reservation => ({
    ...reservation,
    reservationDate: reservation.reservationDate.toISOString(),
    createdAt: reservation.createdAt.toISOString(),
    updatedAt: reservation.updatedAt.toISOString(),
    cancelledAt: reservation.cancelledAt?.toISOString() || null,
  }))
}
