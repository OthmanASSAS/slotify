/**
 * DayCard - Card pour un jour avec tous ses créneaux
 * Composant de composition qui utilise SlotButton
 */

import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DayCardProps } from './types'
import { SlotButton } from './SlotButton'

export const DayCard: React.FC<DayCardProps> = ({
  day,
  slots,
  onSlotClick,
}) => {
  const { date, isToday, isPast } = day

  // Ne pas afficher les jours sans créneaux
  if (slots.length === 0) return null

  return (
    <Card
      className={`
        overflow-hidden border-2 transition-all duration-200
        ${
          isToday
            ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50'
            : 'border-violet-200 bg-white'
        }
        ${isPast ? 'opacity-60' : 'hover:shadow-lg hover:shadow-violet-500/10'}
      `}
    >
      {/* Day Header */}
      <div
        className={`
          p-4 border-b-2
          ${
            isToday
              ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-violet-400'
              : 'bg-gradient-to-r from-violet-100 to-purple-100 border-violet-200'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <div
              className={`text-sm font-semibold uppercase tracking-wide ${
                isToday ? 'text-white' : 'text-violet-700'
              }`}
            >
              {format(date, 'EEEE', { locale: fr })}
            </div>
            <div
              className={`text-2xl font-bold ${
                isToday ? 'text-white' : 'text-violet-900'
              }`}
            >
              {format(date, 'dd MMM', { locale: fr })}
            </div>
          </div>
          {isToday && (
            <Badge className="bg-white text-violet-600 hover:bg-white">
              Aujourd&apos;hui
            </Badge>
          )}
        </div>
      </div>

      {/* Slots List */}
      <div className="p-3 space-y-2">
        {slots.map(slot => (
          <SlotButton
            key={slot.id}
            slot={slot}
            date={date}
            onClick={() => onSlotClick(slot, date)}
          />
        ))}
      </div>
    </Card>
  )
}
