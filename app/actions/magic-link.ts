
'use server'

import { prisma } from '@/lib/prisma'
import { sendMagicLinkEmail } from '@/lib/email'
import { randomBytes } from 'crypto'

/**
 * Génère un lien magique et l'envoie par email
 */
export async function sendMagicLink(email: string) {
  try {
    // 1. Vérifier si l'email est autorisé (optionnel, mais mieux pour la sécurité)
    const allowedEmail = await prisma.allowedEmail.findUnique({
      where: { email },
    })

    if (!allowedEmail) {
      // On ne dit pas que l'email n'existe pas pour éviter le "user enumeration"
      // Mais on n'envoie rien
      return { success: true }
    }

    // 2. Générer un token sécurisé
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // 3. Sauvegarder le token
    await prisma.magicLink.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    // 4. Envoyer l'email
    await sendMagicLinkEmail(email, token)

    return { success: true }
  } catch (error) {
    console.error('Error sending magic link:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

/**
 * Crée un MagicLink permanent avec un token existant (après confirmation de PendingReservation)
 */
export async function createMagicLinkFromToken(email: string, token: string) {
  try {
    // Vérifier si un MagicLink existe déjà avec ce token
    const existing = await prisma.magicLink.findUnique({
      where: { token }
    })

    if (existing) {
      // Déjà créé, on ne fait rien
      return { success: true }
    }

    // Créer un MagicLink permanent (expire dans 30 jours)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.magicLink.create({
      data: {
        email,
        token,
        expiresAt,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Error creating magic link from token:', error)
    return { success: false, error: 'Une erreur est survenue' }
  }
}

/**
 * Vérifie le token et récupère les réservations de l'utilisateur
 */
export async function verifyMagicLinkAndGetReservations(token: string) {
  try {
    // 1. Trouver le lien magique
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    })

    if (!magicLink) {
      return { success: false, error: 'Lien invalide' }
    }

    // 2. Vérifier l'expiration
    if (new Date() > magicLink.expiresAt) {
      return { success: false, error: 'Lien expiré' }
    }

    // 3. Récupérer les réservations de l'utilisateur
    const reservations = await prisma.reservation.findMany({
      where: {
        allowedEmail: {
          email: magicLink.email,
        },
        // On montre aussi les réservations passées récentes ? Pour l'instant non, que les futures
        reservationDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // À partir d'aujourd'hui minuit
        },
        cancelledAt: null, // Seulement les actives
      },
      include: {
        timeSlot: true,
      },
      orderBy: {
        reservationDate: 'asc',
      },
    })

    return { success: true, reservations, email: magicLink.email }
  } catch (error) {
    console.error('Error verifying token:', error)
    return { success: false, error: 'Erreur lors de la vérification' }
  }
}

/**
 * Annule une réservation par son ID (sécurisé par le token)
 */
export async function cancelReservationById(reservationId: string, token: string) {
  try {
    // 1. Vérifier le token à nouveau (double sécurité)
    const magicLink = await prisma.magicLink.findUnique({
      where: { token },
    })

    if (!magicLink || new Date() > magicLink.expiresAt) {
      return { success: false, error: 'Session expirée' }
    }

    // 2. Vérifier que la réservation appartient bien à cet email
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { allowedEmail: true },
    })

    if (!reservation || reservation.allowedEmail.email !== magicLink.email) {
      return { success: false, error: 'Réservation introuvable ou non autorisée' }
    }

    // 3. Annuler
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { cancelledAt: new Date() },
    })

    return { success: true }
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    return { success: false, error: 'Erreur lors de l\'annulation' }
  }
}
