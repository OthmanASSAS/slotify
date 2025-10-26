import { prisma } from './prisma'

/**
 * Get the number of available slots for a specific date and time slot
 */
export async function getAvailableSlots(date: Date, slotId: string): Promise<number> {
  const slot = await prisma.timeSlot.findUnique({
    where: { id: slotId },
    include: {
      reservations: {
        where: {
          reservationDate: date,
          cancelledAt: null,
        },
      },
    },
  })

  if (!slot) return 0
  return slot.maxCapacity - slot.reservations.length
}

/**
 * Check if a reservation can be cancelled (must be at least 24 hours before)
 */
export function canCancel(reservationDate: Date): boolean {
  const now = new Date()
  const hoursUntilReservation = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  return hoursUntilReservation >= 24
}

/**
 * Generate a unique cancellation code (8 uppercase alphanumeric characters)
 */
export function generateCancellationCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

/**
 * Check if an email is already reserved for a specific slot and date
 */
export async function hasExistingReservation(
  email: string,
  timeSlotId: string,
  reservationDate: Date
): Promise<boolean> {
  const allowedEmail = await prisma.allowedEmail.findUnique({
    where: { email },
  })

  if (!allowedEmail) return false

  const existing = await prisma.reservation.findUnique({
    where: {
      allowedEmailId_timeSlotId_reservationDate: {
        allowedEmailId: allowedEmail.id,
        timeSlotId,
        reservationDate,
      },
    },
  })

  return existing !== null && existing.cancelledAt === null
}

/**
 * Get day of week from a date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export function getDayOfWeek(date: Date): number {
  return date.getDay()
}
