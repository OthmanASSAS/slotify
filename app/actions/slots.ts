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
      // Utiliser le même format que le frontend (YYYY-MM-DD) pour la clé
      // Voir: components/calendar/modern/utils.ts -> getAvailabilityKey
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateKey = `${year}-${month}-${day}`
      
      // dbDateKey est identique ici car on veut comparer avec la même logique
      const dbDateKey = dateKey

      const key = `${slot.id}-${dateKey}`

      // Trouver le nombre de réservations pour ce créneau à cette date
      // On compare les dates au format YYYY-MM-DD pour éviter les problèmes d'heure
      const reservation = reservations.find(r => {
        const resDate = new Date(r.reservationDate)
        const resYear = resDate.getFullYear()
        const resMonth = String(resDate.getMonth() + 1).padStart(2, '0')
        const resDay = String(resDate.getDate()).padStart(2, '0')
        const resDateKey = `${resYear}-${resMonth}-${resDay}`
        
        return r.timeSlotId === slot.id && resDateKey === dbDateKey
      })

      const reservationCount = reservation?._count || 0
      const available = Math.max(0, slot.maxCapacity - reservationCount)

      availabilityMap[key] = {
        available,
        capacity: slot.maxCapacity,
      }

      // Debug log
      console.log(`Slot ${slot.id} on ${dateKey}: ${available}/${slot.maxCapacity} (reservations: ${reservationCount})`)
    }
  }

  console.log('Total availability map entries:', Object.keys(availabilityMap).length)
  return availabilityMap
}
