'use server'

import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Email invalide'),
})

/**
 * Server Action: Récupérer tous les emails autorisés (protégé)
 */
export async function getEmails() {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    redirect('/admin')
  }

  const emails = await prisma.allowedEmail.findMany({
    include: {
      _count: {
        select: {
          reservations: true,
        },
      },
    },
    orderBy: {
      addedAt: 'desc',
    },
  })

  return emails
}

/**
 * Server Action: Ajouter un email à la whitelist (protégé)
 */
export async function addEmail(formData: FormData) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Non autorisé')
  }

  const email = formData.get('email') as string
  const validated = emailSchema.parse({ email })

  // Vérifier si l'email existe déjà
  const existing = await prisma.allowedEmail.findUnique({
    where: { email: validated.email },
  })

  if (existing) {
    throw new Error('Cet email existe déjà dans la liste')
  }

  await prisma.allowedEmail.create({
    data: { email: validated.email },
  })

  revalidatePath('/admin/emails')
  return { success: true }
}

/**
 * Server Action: Supprimer un email (protégé)
 */
export async function deleteEmail(id: string) {
  const authenticated = await isAuthenticated()
  if (!authenticated) {
    throw new Error('Non autorisé')
  }

  // Vérifier si l'email a des réservations actives
  const emailWithReservations = await prisma.allowedEmail.findUnique({
    where: { id },
    include: {
      reservations: {
        where: { cancelledAt: null },
      },
    },
  })

  if (emailWithReservations && emailWithReservations.reservations.length > 0) {
    throw new Error(
      `Impossible de supprimer cet email car il a ${emailWithReservations.reservations.length} réservation(s) active(s)`
    )
  }

  await prisma.allowedEmail.delete({
    where: { id },
  })

  revalidatePath('/admin/emails')
  return { success: true }
}
