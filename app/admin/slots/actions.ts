'use server'

import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
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
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/admin')
  }

  const slots = await prisma.timeSlot.findMany({
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  })

  return slots
}

/**
 * Server Action: Créer un créneau (protégé)
 */
export async function createSlot(formData: FormData) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Non autorisé')
  }

  const data = {
    dayOfWeek: parseInt(formData.get('dayOfWeek') as string),
    startTime: formData.get('startTime') as string,
    endTime: formData.get('endTime') as string,
    maxCapacity: parseInt(formData.get('maxCapacity') as string),
  }

  const validated = slotSchema.parse(data)

  // Vérifier si le créneau existe déjà
  const existing = await prisma.timeSlot.findFirst({
    where: {
      dayOfWeek: validated.dayOfWeek,
      startTime: validated.startTime,
      endTime: validated.endTime,
    },
  })

  if (existing) {
    throw new Error('Ce créneau existe déjà')
  }

  await prisma.timeSlot.create({
    data: {
      ...validated,
      isActive: true,
    },
  })

  revalidatePath('/admin/slots')
  return { success: true }
}

/**
 * Server Action: Supprimer un créneau (protégé)
 */
export async function deleteSlot(id: string) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
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
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Non autorisé')
  }

  await prisma.timeSlot.update({
    where: { id },
    data: { isActive: !isActive },
  })

  revalidatePath('/admin/slots')
  return { success: true }
}
