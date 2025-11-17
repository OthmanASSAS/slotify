/**
 * FloatingConfirmButton - Bouton flottant pour confirmer la sélection
 * Visible uniquement quand des créneaux sont sélectionnés
 * Affiche un récapitulatif détaillé des créneaux sélectionnés
 */

import React, { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, ChevronRight } from 'lucide-react'
import type { FloatingConfirmButtonProps } from './types'

export const FloatingConfirmButton: React.FC<FloatingConfirmButtonProps> = ({
  selectedSlots,
  onConfirm,
}) => {
  // Calculer le total d'heures - AVANT le early return
  const totalHours = useMemo(() => {
    return selectedSlots.reduce((total, slot) => {
      const [startHour, startMin] = slot.startTime.split(':').map(Number)
      const [endHour, endMin] = slot.endTime.split(':').map(Number)
      const duration = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60
      return total + duration
    }, 0)
  }, [selectedSlots])

  // Grouper par jour - AVANT le early return
  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, typeof selectedSlots>()
    selectedSlots.forEach(slot => {
      const key = format(slot.date, 'yyyy-MM-dd')
      if (!grouped.has(key)) {
        grouped.set(key, [])
      }
      grouped.get(key)!.push(slot)
    })
    // Trier les slots de chaque jour par heure
    grouped.forEach(slots => {
      slots.sort((a, b) => a.startTime.localeCompare(b.startTime))
    })
    return grouped
  }, [selectedSlots])

  // Early return APRÈS tous les hooks
  if (selectedSlots.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="max-w-3xl mx-auto px-4 pb-4">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Compact header - collapsible summary */}
          <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">
                    {selectedSlots.length} créneau{selectedSlots.length > 1 ? 'x' : ''}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {totalHours}h
                  </div>
                </div>
              </div>

              {/* Compact summary badges */}
              <div className="flex items-center gap-2">
                {Array.from(slotsByDay.entries()).map(([dateKey, slots]) => {
                  const firstSlot = slots[0]
                  return (
                    <div key={dateKey} className="text-xs text-gray-700 bg-white rounded-full px-2 py-1 border border-gray-200">
                      {format(firstSlot.date, 'EEE dd', { locale: fr })}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="p-3">
            <Button
              onClick={onConfirm}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-5 rounded-xl shadow-md transition-all"
            >
              Continuer vers la réservation
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
