/**
 * Server Actions pour les réservations
 * Type-safe et moderne avec Next.js 13+
 */

'use server'

import { prisma } from '@/lib/prisma'
import {
  getAvailableSlots,
  generateCancellationCode,
  hasExistingReservation,
  getDayOfWeek,
} from '@/lib/booking-utils'
import { sendReservationEmail, sendBulkReservationEmail } from '@/lib/email'

/**
 * Type pour le résultat de la réservation
 */
type ReservationResult =
  | { success: true; cancellationCode: string; reservationId: string }
  | { success: false; error: string }

/**
 * Crée une nouvelle réservation
 * Validation complète côté serveur avec toutes les règles métier
 */
export async function createReservation(
  email: string,
  timeSlotId: string,
  reservationDate: Date
): Promise<ReservationResult> {
  try {
    const date = new Date(reservationDate)

    // 1. Vérifier que l'email est autorisé
    const allowedEmail = await prisma.allowedEmail.findUnique({
      where: { email },
    })

    if (!allowedEmail) {
      return {
        success: false,
        error: 'Email non autorisé à effectuer des réservations',
      }
    }

    // 2. Récupérer le créneau et vérifier qu'il existe et est actif
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
    })

    if (!timeSlot || !timeSlot.isActive) {
      return {
        success: false,
        error: 'Créneau horaire invalide ou inactif',
      }
    }

    // 3. Vérifier que le jour de la semaine correspond
    // On ajoute 12h pour éviter les problèmes de fuseau horaire (minuit UTC vs Local)
    // Si la date est à minuit local (ex: 00:00 GMT+1), elle peut être 23:00 la veille en UTC
    // En ajoutant 12h, on est sûr d'être le bon jour quel que soit le fuseau (dans une limite raisonnable)
    const dateAtNoon = new Date(date)
    dateAtNoon.setHours(12, 0, 0, 0)
    const dayOfWeek = getDayOfWeek(dateAtNoon)
    
    if (timeSlot.dayOfWeek !== dayOfWeek) {
      console.log(`Mismatch: Slot Day ${timeSlot.dayOfWeek} vs Date Day ${dayOfWeek} (Date: ${date.toISOString()}, Noon: ${dateAtNoon.toISOString()})`)
      return {
        success: false,
        error: 'Le jour de la semaine ne correspond pas au créneau',
      }
    }

    // 4. Vérifier que la date+heure n'est pas dans le passé
    const slotDateTime = new Date(date)
    const [hours, minutes] = timeSlot.startTime.split(':').map(Number)
    slotDateTime.setHours(hours, minutes, 0, 0)

    if (slotDateTime < new Date()) {
      return {
        success: false,
        error: 'Impossible de réserver un créneau passé',
      }
    }

    // 5. Vérifier que l'utilisateur n'a pas déjà réservé ce créneau
    const alreadyReserved = await hasExistingReservation(email, timeSlotId, date)
    if (alreadyReserved) {
      return {
        success: false,
        error: 'Vous avez déjà une réservation pour ce créneau',
      }
    }

    // 6. Vérifier qu'il reste des places disponibles
    const availableSlots = await getAvailableSlots(date, timeSlotId)
    if (availableSlots <= 0) {
      return {
        success: false,
        error: 'Aucune place disponible pour ce créneau',
      }
    }

    // 7. Créer la réservation
    const cancellationCode = generateCancellationCode()
    const reservation = await prisma.reservation.create({
      data: {
        allowedEmailId: allowedEmail.id,
        timeSlotId,
        reservationDate: date,
        cancellationCode,
      },
    })

    // L'envoi d'email est maintenant géré de manière groupée par sendBulkReservationEmail
    // Voir app/actions/reservations.ts -> sendBulkReservationEmail

    return {
      success: true,
      cancellationCode,
      reservationId: reservation.id,
    }
  } catch (error) {
    console.error('Error creating reservation:', error)
    return {
      success: false,
      error: 'Erreur lors de la création de la réservation',
    }
  }
}

/**
 * Vérifie les réservations existantes pour une liste de créneaux
 */
export async function checkExistingReservations(
  email: string,
  slots: { slotId: string; date: Date }[]
): Promise<string[]> {
  // 1. Trouver l'utilisateur
  const allowedEmail = await prisma.allowedEmail.findUnique({
    where: { email },
  })

  if (!allowedEmail) return []

  const existingSlotIds: string[] = []

  // 2. Vérifier chaque créneau
  for (const slot of slots) {
    const alreadyReserved = await hasExistingReservation(
      email,
      slot.slotId,
      slot.date
    )
    
    if (alreadyReserved) {
      // On retourne une clé unique pour identifier le créneau réservé
      // Format: slotId-YYYY-MM-DD
      const dateKey = slot.date.toISOString().split('T')[0]
      existingSlotIds.push(`${slot.slotId}-${dateKey}`)
    }
  }

  return existingSlotIds
}

import { auth } from '@/auth'

/**
 * Récupère toutes les réservations (pour l'admin)
 */
export async function getAllReservations() {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    throw new Error('Non autorisé')
  }

  try {
    const reservations = await prisma.reservation.findMany({
      include: {
        allowedEmail: true,
        timeSlot: true,
      },
      orderBy: {
        reservationDate: 'desc',
      },
    })

    return reservations
  } catch (error) {
    console.error('Error fetching reservations:', error)
    throw new Error('Erreur lors de la récupération des réservations')
  }
}

/**
 * Annule une réservation avec le code d'annulation
 */
export async function cancelReservation(
  cancellationCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { cancellationCode },
    })

    if (!reservation) {
      return {
        success: false,
        error: 'Réservation introuvable',
      }
    }

    if (reservation.cancelledAt) {
      return {
        success: false,
        error: 'Cette réservation est déjà annulée',
      }
    }

    await prisma.reservation.update({
      where: { id: reservation.id },
      data: { cancelledAt: new Date() },
    })

    return { success: true }
  } catch (error) {
    console.error('Error cancelling reservation:', error)
    return {
      success: false,
      error: 'Erreur lors de l\'annulation de la réservation',
    }
  }
}
/**
 * Envoie un email récapitulatif pour plusieurs réservations
 */
export async function sendBulkReservationEmailAction(
  email: string,
  reservations: {
    date: Date
    startTime: string
    endTime: string
    cancellationCode: string
  }[]
) {
  try {
    await sendBulkReservationEmail(email, reservations)
    return { success: true }
  } catch (error) {
    console.error('Error sending bulk email:', error)
    return { success: false, error: 'Erreur lors de l\'envoi de l\'email' }
  }
}
