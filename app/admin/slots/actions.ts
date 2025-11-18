'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const slotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxCapacity: z.number().min(1).max(100),
})

/**
 * Server Action: Récupérer tous les créneaux (protégé)
 */
export async function getSlots() {
  const session = await auth()
  if (!session) {
    redirect('/admin')
  }

  const slots = await prisma.timeSlot.findMany({
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })

  return slots
}

/**
 * Server Action: Créer des créneaux horaires (protégé)
 * Découpe automatiquement la plage en créneaux d'1h
 */
export async function createSlot(formData: FormData) {
  const session = await auth()
  if (!session) {
    throw new Error('Non autorisé')
  }

  const data = {
    dayOfWeek: parseInt(formData.get('dayOfWeek') as string),
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    maxCapacity: parseInt(formData.get('maxCapacity') as string),
  }

  const validated = slotSchema.parse(data)

  // Parser les heures et minutes
  const [startHour, startMinutes] = validated.startTime.split(':').map(Number)
  const [endHour, endMinutes] = validated.endTime.split(':').map(Number)

  // Convertir en minutes totales pour faciliter les calculs
  const startTotalMinutes = startHour * 60 + startMinutes
  const endTotalMinutes = endHour * 60 + endMinutes

  if (endTotalMinutes <= startTotalMinutes) {
    throw new Error('L\'heure de fin doit être après l\'heure de début')
  }

  // Vérifier que les minutes sont 00 ou 30
  if ((startMinutes !== 0 && startMinutes !== 30) || (endMinutes !== 0 && endMinutes !== 30)) {
    throw new Error('Seules les heures pleines (:00) ou demi-heures (:30) sont autorisées')
  }

  // Générer les créneaux
  const slots = []
  let currentMinutes = startTotalMinutes

  while (currentMinutes < endTotalMinutes) {
    const currentHour = Math.floor(currentMinutes / 60)
    const currentMin = currentMinutes % 60

    // Calculer la prochaine heure pleine
    const nextHourMinutes = (Math.floor(currentMinutes / 60) + 1) * 60

    // Si on peut faire un créneau d'1h complet
    if (nextHourMinutes <= endTotalMinutes && currentMin === 0) {
      const slotStartTime = `${currentHour.toString().padStart(2, '0')}:00`
      const slotEndTime = `${(currentHour + 1).toString().padStart(2, '0')}:00`

      slots.push({
        dayOfWeek: validated.dayOfWeek,
        startTime: slotStartTime,
        endTime: slotEndTime,
        maxCapacity: validated.maxCapacity,
        isActive: true,
      })

      currentMinutes = nextHourMinutes
    } else {
      // Sinon, créer un créneau jusqu'à la prochaine heure pleine ou jusqu'à la fin
      const endSlotMinutes = Math.min(nextHourMinutes, endTotalMinutes)
      const endSlotHour = Math.floor(endSlotMinutes / 60)
      const endSlotMin = endSlotMinutes % 60

      const slotStartTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`
      const slotEndTime = `${endSlotHour.toString().padStart(2, '0')}:${endSlotMin.toString().padStart(2, '0')}`

      slots.push({
        dayOfWeek: validated.dayOfWeek,
        startTime: slotStartTime,
        endTime: slotEndTime,
        maxCapacity: validated.maxCapacity,
        isActive: true,
      })

      currentMinutes = endSlotMinutes
    }
  }

  // Vérifier qu'aucun créneau n'existe déjà
  for (const slot of slots) {
    const existing = await prisma.timeSlot.findFirst({
      where: {
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
      },
    })

    if (existing) {
      throw new Error(`Le créneau ${slot.startTime}-${slot.endTime} existe déjà`)
    }
  }

  // Créer tous les créneaux
  await prisma.timeSlot.createMany({
    data: slots,
  })

  revalidatePath('/admin/slots')
  return { success: true }
}

/**
 * Server Action: Supprimer un créneau (protégé)
 */
export async function deleteSlot(id: string) {
  const session = await auth()
  if (!session) {
    throw new Error('Non autorisé')
  }

  await prisma.timeSlot.delete({
    where: { id },
  })

  revalidatePath('/admin/slots')
  return { success: true }
}

/**
 * Server Action: Activer/désactiver un créneau (protégé)
 */
export async function toggleSlotActive(id: string, isActive: boolean) {
  const session = await auth()
  if (!session) {
    throw new Error('Non autorisé')
  }

  await prisma.timeSlot.update({
    where: { id },
    data: { isActive: !isActive },
  })

  revalidatePath('/admin/slots')
  return { success: true }
}
