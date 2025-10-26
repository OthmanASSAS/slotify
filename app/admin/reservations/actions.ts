'use server'

import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'

/**
 * Server Action: Récupérer toutes les réservations (protégé)
 */
export async function getReservations() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
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

  return reservations
}
