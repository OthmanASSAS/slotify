// /Users/oassas/Projets/slotify/app/actions/pending-reservations.ts
'use server'

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendMagicLinkEmail } from '@/lib/email'

interface PendingSlot {
  slotId: string
  date: string // Format: YYYY-MM-DD
}

/**
 * Crée une réservation en attente et envoie le magic link
 */
export async function createPendingReservation(email: string, slots: PendingSlot[]) {
  try {
    // 1. Vérifier que l'email est autorisé
    const allowedEmail = await prisma.allowedEmail.findUnique({
      where: { email }
    })

    if (!allowedEmail) {
      return {
        success: false,
        error: 'Cet email n\'est pas autorisé à réserver.'
      }
    }

    // 2. Générer un token unique
    const token = crypto.randomBytes(32).toString('hex')

    // 3. Créer la réservation en attente (expire dans 1h)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.pendingReservation.create({
      data: {
        email,
        token,
        slots: JSON.stringify(slots),
        expiresAt
      }
    })

    // 4. Envoyer l'email avec le magic link
    console.log(`[PENDING] Envoi magic link à ${email} avec token ${token}`)
    const emailResult = await sendMagicLinkEmail(email, token)

    console.log(`[PENDING] Résultat envoi email:`, emailResult)

    if (!emailResult.success) {
      console.error('[PENDING] Échec envoi email:', emailResult.error)
      return {
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email.'
      }
    }

    console.log(`[PENDING] ✅ Email envoyé avec succès à ${email}`)
    return {
      success: true,
      message: 'Email envoyé ! Cliquez sur le lien pour finaliser votre réservation.'
    }

  } catch (error) {
    console.error('Error creating pending reservation:', error)
    return {
      success: false,
      error: 'Une erreur est survenue.'
    }
  }
}

/**
 * Récupère une réservation en attente via son token
 */
export async function getPendingReservation(token: string) {
  try {
    const pending = await prisma.pendingReservation.findUnique({
      where: { token }
    })

    if (!pending) {
      return {
        success: false,
        error: 'Lien invalide ou expiré.'
      }
    }

    // Vérifier l'expiration
    if (new Date() > pending.expiresAt) {
      // Supprimer la réservation expirée
      await prisma.pendingReservation.delete({
        where: { id: pending.id }
      })

      return {
        success: false,
        error: 'Ce lien a expiré. Veuillez recommencer.'
      }
    }

    return {
      success: true,
      email: pending.email,
      slots: JSON.parse(pending.slots as string) as PendingSlot[]
    }

  } catch (error) {
    console.error('Error getting pending reservation:', error)
    return {
      success: false,
      error: 'Une erreur est survenue.'
    }
  }
}

/**
 * Supprime une réservation en attente après confirmation
 */
export async function deletePendingReservation(token: string) {
  try {
    await prisma.pendingReservation.delete({
      where: { token }
    })
    return { success: true }
  } catch (error) {
    console.error('Error deleting pending reservation:', error)
    return { success: false }
  }
}
