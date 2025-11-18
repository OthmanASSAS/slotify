/**
 * SlotButton - Bouton pour un créneau horaire
 * Affiche l'heure, la disponibilité et le statut de sélection
 */

import React from 'react'
import { Clock, Users, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { SlotButtonProps } from './types'
import { getAvailabilityBadgeConfig } from './utils'

export const SlotButton: React.FC<SlotButtonProps> = ({
  slot,
  onClick,
}) => {
  const { availability, isSelected, isDisabled, availabilityStatus } = slot
  const badge = getAvailabilityBadgeConfig(availabilityStatus)

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={`
        Créneau de ${slot.startTime} à ${slot.endTime},
        ${availability.available} places sur ${availability.capacity} disponibles,
        ${isSelected ? 'sélectionné' : 'non sélectionné'}
      `}
      className={`
        w-full p-3 rounded-lg border transition-all duration-200 text-left
        ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-sm'
            : isDisabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {/* Header: Time + Selection indicator */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock
            className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}
            aria-hidden="true"
          />
          <span
            className={`font-bold ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}
          >
            {slot.startTime} - {slot.endTime}
          </span>
        </div>
        {isSelected && (
          <CheckCircle2
            className="h-5 w-5 text-blue-600"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Footer: Availability info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-gray-500" aria-hidden="true" />
          <span className="text-sm text-gray-600">
            <span className="font-bold">{availability.available}</span>/
            {availability.capacity} places
          </span>
        </div>

        {!isDisabled ? (
          <Badge className={badge.className} aria-label={badge.label}>
            <span aria-hidden="true">{badge.icon}</span> {badge.label}
          </Badge>
        ) : (
          <Badge variant="destructive">Complet</Badge>
        )}
      </div>
    </button>
  )
}
