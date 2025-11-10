'use server'

import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

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

/**
 * Server Action: Récupérer la disponibilité pour une semaine complète
 * Plus efficace que de faire plusieurs requêtes individuelles
 */
export async function getWeekAvailability(weekDates: Date[]) {
  const slots = await prisma.timeSlot.findMany({
    where: { isActive: true },
    select: {
      id: true,
      dayOfWeek: true,
      startTime: true,
      maxCapacity: true,
    },
  })

  // Récupérer toutes les réservations de la semaine en une seule requête
  const weekStart = startOfDay(weekDates[0])
  const weekEnd = endOfDay(weekDates[weekDates.length - 1])

  const reservations = await prisma.reservation.groupBy({
    by: ['timeSlotId', 'reservationDate'],
    where: {
      reservationDate: {
        gte: weekStart,
        lte: weekEnd,
      },
      cancelledAt: null, // Seulement les réservations actives
    },
    _count: true,
  })

  // Créer une map pour un accès rapide
  const availabilityMap: Record<string, { available: number; capacity: number }> = {}

  for (const date of weekDates) {
    const dayOfWeek = date.getDay()
    const daySlots = slots.filter(s => s.dayOfWeek === dayOfWeek)

    for (const slot of daySlots) {
      const dateKey = startOfDay(date).toISOString()
      const key = `${slot.id}-${dateKey}`

      // Trouver le nombre de réservations pour ce créneau à cette date
      const reservation = reservations.find(
        r =>
          r.timeSlotId === slot.id &&
          startOfDay(new Date(r.reservationDate)).toISOString() === dateKey
      )

      const reservationCount = reservation?._count || 0
      const available = Math.max(0, slot.maxCapacity - reservationCount)

      availabilityMap[key] = {
        available,
        capacity: slot.maxCapacity,
      }
    }
  }

  return availabilityMap
}
