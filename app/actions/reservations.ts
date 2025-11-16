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
    const dayOfWeek = getDayOfWeek(date)
    if (timeSlot.dayOfWeek !== dayOfWeek) {
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
 * Récupère toutes les réservations (pour l'admin)
 */
export async function getAllReservations() {
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
