/**
 * Utilitaires pour le calendrier
 * Couche 1 : Fonctions pures, pas de React hooks
 * Principes : Pure functions, single responsibility, testable
 */

import { startOfDay, isBefore, isSameDay } from 'date-fns'
import type {
  AvailabilityStatus,
  AvailabilityBadgeConfig,
  SlotAvailability,
  TimeSlot,
} from './types'

/**
 * Génère une clé unique pour identifier un créneau à une date donnée
 * Format: "slotId-YYYY-MM-DDT00:00:00.000Z"
 */
export const getAvailabilityKey = (slotId: string, date: Date): string => {
  const dateKey = startOfDay(date).toISOString()
  return `${slotId}-${dateKey}`
}

/**
 * Détermine le statut de disponibilité basé sur le pourcentage de places restantes
 * > 50% → available
 * 1-50% → limited
 * 0% → full
 */
export const getAvailabilityStatus = (
  available: number,
  capacity: number
): AvailabilityStatus => {
  if (capacity === 0) return 'full'

  const percentage = (available / capacity) * 100

  if (percentage > 50) return 'available'
  if (percentage > 0) return 'limited'
  return 'full'
}

/**
 * Retourne la configuration du badge selon le statut de disponibilité
 * Utilisé pour l'affichage UI du badge
 */
export const getAvailabilityBadgeConfig = (
  status: AvailabilityStatus
): AvailabilityBadgeConfig => {
  const configs: Record<AvailabilityStatus, AvailabilityBadgeConfig> = {
    available: {
      variant: 'default',
      className: 'bg-emerald-400 hover:bg-emerald-500 text-white',
      label: 'Disponible',
      icon: '✓',
    },
    limited: {
      variant: 'secondary',
      className: 'bg-amber-400 hover:bg-amber-500 text-white',
      label: 'Limité',
      icon: '⚠',
    },
    full: {
      variant: 'destructive',
      className: 'bg-rose-400 hover:bg-rose-500 text-white',
      label: 'Complet',
      icon: '✕',
    },
  }

  return configs[status]
}

/**
 * Vérifie si une date est dans le passé (avant aujourd'hui)
 */
export const isPastDate = (date: Date): boolean => {
  return isBefore(date, startOfDay(new Date()))
}

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date: Date): boolean => {
  return isSameDay(date, startOfDay(new Date()))
}

/**
 * Trie les créneaux par heure de début (croissant)
 */
export const sortSlotsByTime = (slots: TimeSlot[]): TimeSlot[] => {
  return [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * Filtre les créneaux pour un jour de la semaine donné
 */
export const getSlotsForDay = (
  slots: TimeSlot[],
  dayOfWeek: number
): TimeSlot[] => {
  return slots.filter(slot => slot.dayOfWeek === dayOfWeek)
}

/**
 * Vérifie si un créneau devrait être désactivé
 * Désactivé si : date+heure passée OU aucune place disponible
 */
export const isSlotDisabled = (
  date: Date,
  availability: SlotAvailability | null,
  slotStartTime?: string
): boolean => {
  // Vérifier si la date entière est passée
  if (isPastDate(date)) return true

  // Si on a l'heure du créneau et que c'est aujourd'hui, vérifier l'heure aussi
  if (slotStartTime && isToday(date)) {
    const [hours, minutes] = slotStartTime.split(':').map(Number)
    const now = new Date()
    const slotDateTime = new Date(date)
    slotDateTime.setHours(hours, minutes, 0, 0)

    if (slotDateTime < now) return true
  }

  if (!availability) return true
  return availability.available === 0
}
