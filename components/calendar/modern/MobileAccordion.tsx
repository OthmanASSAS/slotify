/**
 * MobileAccordion - Vue mobile/tablet avec accordéon vertical
 * Design moderne avec pastel doux et bordures fines
 */

import React, { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronDown, ChevronRight, Clock, Users, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { DayInfo, SlotDisplayInfo, TimeSlot } from './types'

type MobileAccordionProps = {
  readonly dayInfos: DayInfo[]
  readonly slotsMap: Map<string, SlotDisplayInfo[]>
  readonly onSlotClick: (slot: TimeSlot, date: Date) => void
}

export const MobileAccordion: React.FC<MobileAccordionProps> = ({
  dayInfos,
  slotsMap,
  onSlotClick,
}) => {
  // Ouvrir le premier jour avec des créneaux par défaut
  const firstDayWithSlots = dayInfos.find(
    day => (slotsMap.get(day.date.toISOString()) || []).length > 0
  )
  const [openDayId, setOpenDayId] = useState<string | null>(
    firstDayWithSlots?.date.toISOString() || null
  )

  const toggleDay = (dayId: string) => {
    setOpenDayId(prev => (prev === dayId ? null : dayId))
  }

  return (
    <div className="lg:hidden space-y-3 pb-32">
      {dayInfos.map(day => {
        const dayId = day.date.toISOString()
        const slots = slotsMap.get(dayId) || []
        const isOpen = openDayId === dayId
        const selectedCount = slots.filter(s => s.isSelected).length

        // Skip past days without slots
        if (day.isPast && slots.length === 0) return null

        return (
          <div
            key={dayId}
            className={`
              rounded-xl border overflow-hidden transition-all duration-200
              ${day.isToday
                ? 'border-blue-200 bg-blue-50 shadow-sm'
                : day.isPast
                ? 'border-gray-200/50 bg-gray-50/50 opacity-70'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
          >
            {/* Accordion Header */}
            <button
              onClick={() => slots.length > 0 && toggleDay(dayId)}
              disabled={slots.length === 0}
              className="w-full p-4 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-3">
                {slots.length > 0 ? (
                  isOpen ? (
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  )
                ) : (
                  <div className="w-5 h-5" />
                )}

                <div className="text-left">
                  <div className={`text-sm font-medium uppercase tracking-wide ${day.isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    {format(day.date, 'EEEE', { locale: fr })}
                  </div>
                  <div className={`text-xl font-bold ${day.isToday ? 'text-gray-900' : 'text-gray-900'}`}>
                    {format(day.date, 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {day.isToday && (
                  <Badge className="bg-blue-600 text-white hover:bg-blue-700 border-blue-500">
                    Aujourd&apos;hui
                  </Badge>
                )}
                {selectedCount > 0 && (
                  <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-400">
                    {selectedCount}
                  </Badge>
                )}
                {slots.length === 0 && (
                  <Badge variant="secondary" className="text-gray-500 border-gray-200">
                    Aucun créneau
                  </Badge>
                )}
              </div>
            </button>

            {/* Accordion Content */}
            {isOpen && slots.length > 0 && (
              <div className="border-t border-gray-200 bg-white/50 p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {slots.map(slot => {

                  return (
                    <button
                      key={slot.id}
                      onClick={() => !slot.isDisabled && onSlotClick(slot, day.date)}
                      disabled={slot.isDisabled}
                      className={`
                        w-full p-3.5 rounded-xl border transition-all duration-200 text-left
                        ${slot.isReservedByMe
                          ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                          : slot.isSelected
                          ? 'border-blue-400 bg-blue-50 shadow-sm'
                          : slot.isDisabled
                          ? 'border-gray-200/50 bg-gray-50/50 cursor-not-allowed opacity-60'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <Clock className={`h-4 w-4 ${slot.isReservedByMe ? 'text-emerald-600' : slot.isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                          <span className={`font-semibold text-base ${slot.isReservedByMe || slot.isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>

                        {/* Indicators */}
                        <div className="flex items-center gap-2">
                          {slot.isReservedByMe && (
                            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500 text-xs">
                              Moi
                            </Badge>
                          )}
                          {slot.isSelected && !slot.isReservedByMe && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{slot.availability.available}</span>
                            <span className="text-gray-400">/{slot.availability.capacity}</span> places
                          </span>
                        </div>

                        {slot.isDisabled && slot.availability.available === 0 && (
                          <Badge className="bg-rose-400 hover:bg-rose-500 text-white text-xs">
                            Complet
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
