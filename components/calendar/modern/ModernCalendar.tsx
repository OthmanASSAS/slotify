
'use client'

import { useState, useMemo, useEffect } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWeekAvailability, useDayInfos, useTimeSlots } from './hooks'
import { getAvailabilityKey, getAvailabilityStatus, isSlotDisabled } from './utils'
import { DesktopWeekGrid } from './DesktopWeekGrid'
import { MobileAccordion } from './MobileAccordion'
import { FloatingConfirmButton } from './FloatingConfirmButton'
import { TimeSlot } from '@prisma/client'
import type { SelectedSlot, SlotDisplayInfo } from './types'

interface CalendarProps {
  onSlotSelect?: (slots: SelectedSlot[]) => void
  refreshTrigger?: number
  // Nouvelles props pour le mode Dashboard
  userReservations?: Set<string> // Format: "slotId-YYYY-MM-DD"
  onSlotClick?: (slot: TimeSlot, date: Date, isReservedByMe: boolean) => void
  readOnly?: boolean
  externalSelectedSlots?: SelectedSlot[] // Pour contrôler la sélection depuis le parent
  hideFloatingButton?: boolean // Pour cacher le bouton de confirmation intégré
}

export const ModernCalendar: React.FC<CalendarProps> = ({
  onSlotSelect,
  refreshTrigger,
  userReservations = new Set(),
  onSlotClick,
  readOnly = false,
  externalSelectedSlots,
  hideFloatingButton = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [internalSelectedSlots, setInternalSelectedSlots] = useState<SelectedSlot[]>([])

  // Utiliser la sélection externe si fournie, sinon interne
  const selectedSlots = externalSelectedSlots || internalSelectedSlots

  const weekDates = useMemo(() => {
    const dates = []
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }) // Lundi
    for (let i = 0; i < 7; i++) {  // 7 jours (lundi à dimanche)
      dates.push(addDays(start, i))
    }
    return dates
  }, [currentDate])

  // Récupérer les créneaux horaires (structure)
  const { timeSlots, loading: slotsLoading } = useTimeSlots()

  // Récupérer les disponibilités (données dynamiques)
  const { availability, loading: availabilityLoading } = useWeekAvailability(weekDates, refreshTrigger)
  
  // Préparer les infos d'affichage par jour
  const dayInfos = useDayInfos(weekDates, timeSlots)

  const loading = slotsLoading || availabilityLoading

  // Gestion du clic unifiée
  const handleSlotClick = (slot: TimeSlot, date: Date, isReservedByMe: boolean) => {
    if (readOnly) return

    // Si une fonction personnalisée est fournie (Mode Dashboard)
    if (onSlotClick) {
      onSlotClick(slot, date, isReservedByMe)
      return
    }

    // Comportement par défaut (Mode Public)
    if (isReservedByMe) return

    setInternalSelectedSlots(prev => {
      const dateKey = format(date, 'yyyy-MM-dd')
      const isSelected = prev.some(s => s.slotId === slot.id && format(s.date, 'yyyy-MM-dd') === dateKey)
      let newSelection
      
      if (isSelected) {
        newSelection = prev.filter(s => !(s.slotId === slot.id && format(s.date, 'yyyy-MM-dd') === dateKey))
      } else {
        newSelection = [...prev, {
          slotId: slot.id,
          date: date,
          startTime: slot.startTime,
          endTime: slot.endTime
        }]
      }
      
      // Notifier le parent
      if (onSlotSelect) {
        onSlotSelect(newSelection)
      }
      return newSelection
    })
  }

  // Créer une Map de données pour chaque jour (utilisée par Mobile et Desktop)
  const slotsDataMap = useMemo(() => {
    const map = new Map<string, SlotDisplayInfo[]>()
    
    dayInfos.forEach(day => {
      const daySlots: SlotDisplayInfo[] = day.slots.map(slot => {
        const availabilityKey = getAvailabilityKey(slot.id, day.date)
        const slotAvailability = availability[availabilityKey]
        
        const available = slotAvailability?.available ?? slot.maxCapacity
        const capacity = slotAvailability?.capacity ?? slot.maxCapacity
        const status = getAvailabilityStatus(available, capacity)
        
        const dateKey = format(day.date, 'yyyy-MM-dd')
        const myReservationKey = `${slot.id}-${dateKey}`
        const isReservedByMe = userReservations.has(myReservationKey)
        
        const isSelected = selectedSlots.some(
          s => s.slotId === slot.id && format(s.date, 'yyyy-MM-dd') === dateKey
        )
        
        return {
          ...slot,
          availability: { available, capacity },
          isDisabled: isSlotDisabled(day.date, { available, capacity }, slot.startTime) && !isReservedByMe,
          availabilityStatus: status,
          isReservedByMe,
          isSelected
        }
      })
      
      map.set(day.date.toISOString(), daySlots)
    })
    
    return map
  }, [dayInfos, availability, selectedSlots, userReservations])

  // Générer le JSX pour le rendu Desktop (grille)
  const slotsJsx = useMemo(() => {
    if (!dayInfos.length) return null

    // Récupérer tous les créneaux horaires uniques (par startTime-endTime)
    const uniqueTimeRanges = new Map<string, TimeSlot>()
    
    dayInfos.forEach(day => {
      day.slots.forEach(slot => {
        const key = `${slot.startTime}-${slot.endTime}`
        if (!uniqueTimeRanges.has(key)) {
          uniqueTimeRanges.set(key, slot)
        }
      })
    })

    // Trier par heure de début
    const sortedTimeRanges = Array.from(uniqueTimeRanges.values())
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    return sortedTimeRanges.map((timeSlot) => (
      <div key={`${timeSlot.startTime}-${timeSlot.endTime}`} className="contents">
        {/* Heure (colonne de gauche) */}
        <div className="sticky left-0 z-10 bg-white p-2 text-xs font-medium text-gray-500 text-right border-r border-gray-100 flex items-center justify-end h-[60px]">
          {timeSlot.startTime}
        </div>

        {/* Créneaux pour chaque jour */}
        {weekDates.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd')
          
          // Trouver le slot pour ce jour et cette plage horaire
          const dayInfo = dayInfos.find(d => d.date.toDateString() === date.toDateString())
          const daySlot = dayInfo?.slots.find(s => 
            s.startTime === timeSlot.startTime && s.endTime === timeSlot.endTime
          )

          if (!daySlot) {
            return <div key={`${dateKey}-${timeSlot.startTime}`} className="bg-gray-50/50 border-b border-r border-gray-100 h-[60px]" />
          }

          const availabilityKey = getAvailabilityKey(daySlot.id, date)
          const slotInfo = availability[availabilityKey]

          // Comparer uniquement la partie date (pas l'heure)
          const selectedDateKey = format(date, 'yyyy-MM-dd')
          const isSelected = selectedSlots.some(
            (s) => s.slotId === daySlot.id && format(s.date, 'yyyy-MM-dd') === selectedDateKey
          )
          
          // Vérifier si c'est "ma" réservation
          const myReservationKey = `${daySlot.id}-${dateKey}`
          const isReservedByMe = userReservations.has(myReservationKey)

          const availableCount = slotInfo?.available ?? daySlot.maxCapacity
          const isFull = availableCount <= 0 && !isReservedByMe

          return (
            <div
              key={`${dateKey}-${daySlot.id}`}
              onClick={() => !isFull && handleSlotClick(daySlot, date, isReservedByMe)}
              className={`
                relative border-b border-r border-gray-100 h-[60px] p-1 transition-all duration-200 cursor-pointer group
                ${isFull ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-blue-50/50'}
              `}
            >
              {!isFull && (
                <div
                  className={`
                    w-full h-full rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all duration-300
                    ${
                      isReservedByMe
                        ? 'bg-emerald-50 border-emerald-200 shadow-sm' // Style "Ma réservation"
                        : isSelected
                        ? 'bg-blue-600 border-blue-600 shadow-md transform scale-[0.98]' // Style "Sélectionné"
                        : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm' // Style "Défaut"
                    }
                  `}
                >
                  {isReservedByMe ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700">Moi</span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {availableCount} place{availableCount > 1 ? 's' : ''}
                      </span>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-blue-100' : 'text-gray-400'
                        }`}
                      >
                        Dispo
                      </span>
                    </>
                  )}
                </div>
              )}
              
              {isFull && (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-300 rotate-[-12deg]">Complet</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    ))
  }, [dayInfos, weekDates, availability, selectedSlots, userReservations])

  const handleConfirm = () => {
    if (onSlotSelect) {
      onSlotSelect(selectedSlots)
    }
  }

  const handlePreviousWeek = () => setCurrentDate((d) => addDays(d, -7))
  const handleNextWeek = () => setCurrentDate((d) => addDays(d, 7))

  if (loading && !dayInfos.length) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Button variant="ghost" size="icon" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {format(weekDates[0], 'MMMM yyyy', { locale: fr })}
        </h2>
        <Button variant="ghost" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Grid container */}
        <div className="grid grid-cols-8" style={{ gridTemplateColumns: '80px repeat(7, 1fr)' }}>
        {/* Header Jours */}
        <div className="bg-gray-50 border-b border-r border-gray-200" />
        {weekDates.map((date) => (
          <div
            key={date.toISOString()}
            className={`
              p-3 text-center border-b border-r border-gray-200 min-w-[120px]
              ${isSameDay(date, new Date()) ? 'bg-blue-50/50' : 'bg-gray-50'}
            `}
          >
            <div className="text-sm font-medium text-gray-500 capitalize">
              {format(date, 'EEE', { locale: fr })}
            </div>
            <div
              className={`
                text-xl font-bold mt-1 inline-flex w-8 h-8 items-center justify-center rounded-full
                ${
                  isSameDay(date, new Date())
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-900'
                }
              `}
            >
              {format(date, 'd')}
            </div>
          </div>
        ))}

        {/* Grille des créneaux */}
        {slotsJsx}
        </div>
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden">
        <MobileAccordion
          dayInfos={dayInfos}
          slotsMap={slotsDataMap}
          onSlotClick={(slot, date) => {
            const dateKey = format(date, 'yyyy-MM-dd')
            const myReservationKey = `${slot.id}-${dateKey}`
            const isReservedByMe = userReservations.has(myReservationKey)
            handleSlotClick(slot, date, isReservedByMe)
          }}
        />
      </div>

      {/* Bouton flottant de confirmation (Seulement en mode public sans handler personnalisé) */}
      {!readOnly && !onSlotClick && !hideFloatingButton && (
        <FloatingConfirmButton
          selectedSlots={selectedSlots}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
