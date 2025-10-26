'use server'

import { prisma } from '@/lib/prisma'

/**
 * Server Action: Récupérer tous les créneaux actifs (public)
 */
export async function getPublicSlots() {
  const slots = await prisma.timeSlot.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' },
    ],
  })

  return slots
}
