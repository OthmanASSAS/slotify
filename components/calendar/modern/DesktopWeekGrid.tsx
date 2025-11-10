/**
 * DesktopWeekGrid - Vue desktop avec grid horizontale (7 colonnes)
 * Design moderne avec pastel doux et bordures fines
 */

import React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Clock, Users } from 'lucide-react'
import type { DayInfo, SlotDisplayInfo, TimeSlot } from './types'
import { getAvailabilityBadgeConfig } from './utils'

type DesktopWeekGridProps = {
  readonly dayInfos: DayInfo[]
  readonly slotsMap: Map<string, SlotDisplayInfo[]>
  readonly onSlotClick: (slot: TimeSlot, date: Date) => void
}

export const DesktopWeekGrid: React.FC<DesktopWeekGridProps> = ({
  dayInfos,
  slotsMap,
  onSlotClick,
}) => {
  return (
    <div className="hidden lg:block pb-32">
      {/* Grid header - Days of week */}
      <div className="grid grid-cols-7 gap-3 mb-4">
        {dayInfos.map(day => {
          const hasSlots = (slotsMap.get(day.date.toISOString()) || []).length > 0

          if (!hasSlots && day.isPast) return <div key={day.date.toISOString()} />

          return (
            <div
              key={day.date.toISOString()}
              className={`
                p-3 rounded-xl border text-center transition-all
                ${day.isToday
                  ? 'bg-gradient-to-br from-violet-400 via-purple-400 to-pink-400 text-white border-violet-300 shadow-md'
                  : day.isPast
                  ? 'bg-gray-50/50 border-gray-200/50 opacity-60'
                  : 'bg-white border-violet-100 hover:border-violet-200 hover:shadow-sm'
                }
              `}
            >
              <div className={`text-xs font-medium uppercase tracking-wide ${day.isToday ? 'text-white/90' : 'text-violet-600'}`}>
                {format(day.date, 'EEE', { locale: fr })}
              </div>
              <div className={`text-2xl font-bold ${day.isToday ? 'text-white' : 'text-gray-800'}`}>
                {format(day.date, 'dd', { locale: fr })}
              </div>
              {day.isToday && (
                <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs mt-1 border-white/30">
                  Aujourd&apos;hui
                </Badge>
              )}
            </div>
          )
        })}
      </div>

      {/* Grid body - Slots */}
      <div className="grid grid-cols-7 gap-3">
        {dayInfos.map(day => {
          const slots = slotsMap.get(day.date.toISOString()) || []

          if (slots.length === 0 && day.isPast) {
            return <div key={day.date.toISOString()} />
          }

          return (
            <div
              key={day.date.toISOString()}
              className="space-y-2 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-violet-200 scrollbar-track-violet-50/50"
            >
              {slots.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl bg-gray-50/30">
                  Aucun créneau
                </div>
              ) : (
                slots.map(slot => {
                  const badge = getAvailabilityBadgeConfig(slot.availabilityStatus)

                  return (
                    <button
                      key={slot.id}
                      onClick={() => !slot.isDisabled && onSlotClick(slot, day.date)}
                      disabled={slot.isDisabled}
                      className={`
                        w-full p-3 rounded-xl border transition-all duration-200 text-left group
                        ${slot.isSelected
                          ? 'border-violet-400 bg-gradient-to-br from-violet-50 to-purple-50 ring-2 ring-violet-300 ring-offset-1 scale-[1.02] shadow-md'
                          : slot.isDisabled
                          ? 'border-gray-200/50 bg-gray-50/50 cursor-not-allowed opacity-50'
                          : 'border-violet-100 bg-white hover:border-violet-300 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]'
                        }
                      `}
                    >
                      {/* Time */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <Clock className={`h-3.5 w-3.5 ${slot.isSelected ? 'text-violet-500' : 'text-gray-400'}`} />
                        <span className={`text-sm font-semibold ${slot.isSelected ? 'text-violet-900' : 'text-gray-800'}`}>
                          {slot.startTime}
                        </span>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            <span className="font-semibold">{slot.availability.available}</span>
                            <span className="text-gray-400">/{slot.availability.capacity}</span>
                          </span>
                        </div>
                        {!slot.isDisabled && (
                          <div className={`w-2 h-2 rounded-full ${badge.className}`} />
                        )}
                      </div>

                      {/* Selected indicator */}
                      {slot.isSelected && (
                        <div className="mt-2 text-xs font-medium text-violet-600 flex items-center gap-1">
                          ✓ Sélectionné
                        </div>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
