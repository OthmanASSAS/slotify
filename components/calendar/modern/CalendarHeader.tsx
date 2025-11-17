/**
 * CalendarHeader - Navigation et affichage de la période courante
 * Composant présentationnel avec callbacks pour la navigation
 */

import React from 'react'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarHeaderProps } from './types'
import { CalendarLegend } from './CalendarLegend'

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentWeekStart,
  onPreviousWeek,
  onNextWeek,
  canGoToPreviousWeek,
  canGoToNextWeek,
}) => {
  const weekEnd = addDays(currentWeekStart, 6)

  return (
    <div className="sticky top-16 z-30 bg-gray-50 backdrop-blur-sm pb-6 mb-6">
      {/* Legend */}
      <div className="mb-4">
        <CalendarLegend />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          onClick={onPreviousWeek}
          variant="outline"
          size="sm"
          className="border border-gray-200 hover:bg-white hover:border-gray-300 rounded-full px-4 shadow-sm"
          aria-label="Semaine précédente"
          disabled={!canGoToPreviousWeek}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline text-sm">Précédente</span>
        </Button>

        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-gray-200 shadow-sm">
          <Calendar className="h-4 w-4 text-blue-600" aria-hidden="true" />
          <span className="font-medium text-sm text-gray-900">
            {format(currentWeekStart, 'dd MMM', { locale: fr })} -{' '}
            {format(weekEnd, 'dd MMM yyyy', { locale: fr })}
          </span>
        </div>

        <Button
          onClick={onNextWeek}
          variant="outline"
          size="sm"
          className="border border-gray-200 hover:bg-white hover:border-gray-300 rounded-full px-4 shadow-sm"
          aria-label="Semaine suivante"
          disabled={!canGoToNextWeek}
        >
          <span className="hidden sm:inline text-sm">Suivante</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
