/**
 * ModernCalendar - Container principal du calendrier moderne
 * Responsabilité : Orchestration de tous les sous-composants
 * Architecture : Composition over inheritance
 */

'use client'

import React, { useMemo } from 'react'
import type { CalendarProps } from './types'
import {
  useWeekNavigation,
  useTimeSlots,
  useWeekAvailability,
  useSlotSelection,
  useDayInfos,
} from './hooks'
import { CalendarHeader } from './CalendarHeader'
import { DesktopWeekGrid } from './DesktopWeekGrid'
import { MobileAccordion } from './MobileAccordion'
import { FloatingConfirmButton } from './FloatingConfirmButton'
import { getAvailabilityKey, getAvailabilityStatus, isSlotDisabled } from './utils'
import type { SlotDisplayInfo } from './types'

/**
 * Composant de chargement
 */
const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-gray-600">
        Chargement des créneaux...
      </p>
    </div>
  </div>
)

/**
 * Composant d'erreur
 */
const ErrorState: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex items-center justify-center py-20">
    <div className="text-center space-y-4 max-w-md">
      <div className="text-red-500 text-4xl">⚠️</div>
      <h3 className="text-lg font-semibold text-gray-900">
        Erreur de chargement
      </h3>
      <p className="text-sm text-gray-600">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        Réessayer
      </button>
    </div>
  </div>
)

/**
 * Container principal - Orchestration pure
 */
export const ModernCalendar: React.FC<CalendarProps> = ({
  onSlotSelect,
  refreshTrigger,
}) => {
  // Hooks pour la logique métier (Single Responsibility)
  const {
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    getDaysOfWeek,
    canGoToPreviousWeek,
    canGoToNextWeek,
  } = useWeekNavigation()

  const { timeSlots, loading, error } = useTimeSlots()

  // Mémoriser weekDates pour éviter les re-renders
  const weekDates = useMemo(() => getDaysOfWeek(), [getDaysOfWeek])
  const { availability } = useWeekAvailability(weekDates, refreshTrigger)

  const { selectedSlots, isSlotSelected, toggleSlot, clearSelection } =
    useSlotSelection()

  // Préparer les données d'affichage
  const dayInfos = useDayInfos(weekDates, timeSlots)

  // Créer une Map pour accès O(1) aux slots par jour
  const slotsMap = useMemo(() => {
    const map = new Map<string, SlotDisplayInfo[]>()
    dayInfos.forEach(day => {
      // Calculer les slots directement au lieu d'utiliser le hook
      const slots = day.slots.map(slot => {
        const key = getAvailabilityKey(slot.id, day.date)
        const slotAvailability = availability[key] || null
        const available = slotAvailability?.available ?? 0
        const capacity = slotAvailability?.capacity ?? slot.maxCapacity
        const status = getAvailabilityStatus(available, capacity)

        return {
          ...slot,
          availability: { available, capacity },
          isSelected: isSlotSelected(slot.id, day.date),
          isDisabled: isSlotDisabled(day.date, slotAvailability, slot.startTime),
          availabilityStatus: status,
        }
      })
      map.set(day.date.toISOString(), slots)
    })
    return map
  }, [dayInfos, availability, isSlotSelected])

  // Handlers
  const handleConfirm = () => {
    onSlotSelect(selectedSlots)
    clearSelection()
  }

  // États de chargement/erreur
  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} />

  // Rendu principal : Pure composition avec responsive switch
  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      {/* Header avec navigation */}
      <CalendarHeader
        currentWeekStart={currentWeekStart}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        canGoToPreviousWeek={canGoToPreviousWeek}
        canGoToNextWeek={canGoToNextWeek}
      />

      {/* Desktop: Grid horizontale 7 colonnes */}
      <DesktopWeekGrid
        dayInfos={dayInfos}
        slotsMap={slotsMap}
        onSlotClick={toggleSlot}
      />

      {/* Mobile/Tablet: Accordéon vertical */}
      <MobileAccordion
        dayInfos={dayInfos}
        slotsMap={slotsMap}
        onSlotClick={toggleSlot}
      />

      {/* Bouton flottant de confirmation */}
      <FloatingConfirmButton
        selectedSlots={selectedSlots}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
