/**
 * Custom hooks pour le calendrier
 * Couche 2 : Logique React réutilisable
 * Principe : Single Responsibility - chaque hook fait une seule chose
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { addDays, startOfWeek, isSameDay } from 'date-fns'
import { getPublicSlots, getWeekAvailability } from '@/app/actions/slots'
import type {
  TimeSlot,
  SelectedSlot,
  AvailabilityMap,
  DayInfo,
  SlotDisplayInfo,
} from './types'
import {
  getAvailabilityKey,
  getAvailabilityStatus,
  isPastDate,
  isToday,
  getSlotsForDay,
  sortSlotsByTime,
  isSlotDisabled,
} from './utils'

/**
 * Hook pour gérer la semaine courante du calendrier
 * Responsabilité : Navigation entre les semaines (limitée à 3 semaines à partir d'aujourd'hui)
 */
export const useWeekNavigation = () => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const today = startOfWeek(new Date(), { weekStartsOn: 1 })
  const maxWeekStart = addDays(today, 14) // 2 semaines après aujourd'hui = 3 semaines au total

  const canGoToPreviousWeek = currentWeekStart > today
  const canGoToNextWeek = currentWeekStart < maxWeekStart

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = addDays(prev, -7)
      return newDate >= today ? newDate : prev
    })
  }, [today])

  const goToNextWeek = useCallback(() => {
    setCurrentWeekStart(prev => {
      const newDate = addDays(prev, 7)
      return newDate <= maxWeekStart ? newDate : prev
    })
  }, [maxWeekStart])

  const getDaysOfWeek = useCallback((): Date[] => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
  }, [currentWeekStart])

  return {
    currentWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    getDaysOfWeek,
    canGoToPreviousWeek,
    canGoToNextWeek,
  }
}

/**
 * Hook pour charger les créneaux disponibles
 * Responsabilité : Fetch des time slots depuis l'API
 */
export const useTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true)
        const data = await getPublicSlots()
        setTimeSlots(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch slots'))
        console.error('Error fetching slots:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [])

  return { timeSlots, loading, error }
}

/**
 * Hook pour charger les disponibilités d'une semaine
 * Responsabilité : Fetch des disponibilités + refresh automatique
 */
export const useWeekAvailability = (
  weekDates: Date[],
  refreshTrigger?: number
) => {
  const [availability, setAvailability] = useState<AvailabilityMap>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (weekDates.length === 0) return

    const fetchAvailability = async () => {
      try {
        setLoading(true)
        const data = await getWeekAvailability(weekDates)
        setAvailability(data)
      } catch (error) {
        console.error('Error fetching availability:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailability()
  }, [weekDates, refreshTrigger])

  return { availability, loading }
}

/**
 * Hook pour gérer la sélection de créneaux
 * Responsabilité : State de sélection + logique toggle
 */
export const useSlotSelection = () => {
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([])

  const isSlotSelected = useCallback(
    (slotId: string, date: Date): boolean => {
      return selectedSlots.some(
        s => s.slotId === slotId && isSameDay(s.date, date)
      )
    },
    [selectedSlots]
  )

  const toggleSlot = useCallback((slot: TimeSlot, date: Date) => {
    setSelectedSlots(prev => {
      const isSelected = prev.some(
        s => s.slotId === slot.id && isSameDay(s.date, date)
      )

      if (isSelected) {
        return prev.filter(
          s => !(s.slotId === slot.id && isSameDay(s.date, date))
        )
      } else {
        return [
          ...prev,
          {
            slotId: slot.id,
            date,
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        ]
      }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedSlots([])
  }, [])

  return {
    selectedSlots,
    isSlotSelected,
    toggleSlot,
    clearSelection,
  }
}

/**
 * Hook pour préparer les données d'affichage des jours
 * Responsabilité : Transformer les données brutes en DayInfo
 */
export const useDayInfos = (
  weekDates: Date[],
  timeSlots: TimeSlot[]
): DayInfo[] => {
  return weekDates.map(date => ({
    date,
    isToday: isToday(date),
    isPast: isPastDate(date),
    slots: sortSlotsByTime(getSlotsForDay(timeSlots, date.getDay())),
  }))
}

/**
 * Hook pour préparer les données d'affichage des créneaux
 * Responsabilité : Enrichir les slots avec les infos de disponibilité et sélection
 */
export const useSlotDisplayInfos = (
  day: DayInfo,
  availability: AvailabilityMap,
  isSlotSelected: (slotId: string, date: Date) => boolean
): SlotDisplayInfo[] => {
  return day.slots.map(slot => {
    const key = getAvailabilityKey(slot.id, day.date)
    const slotAvailability = availability[key] || null

    const available = slotAvailability?.available ?? slot.maxCapacity
    const capacity = slotAvailability?.capacity ?? slot.maxCapacity
    const status = getAvailabilityStatus(available, capacity)

    const computedAvailability = { available, capacity }

    return {
      ...slot,
      availability: computedAvailability,
      isSelected: isSlotSelected(slot.id, day.date),
      isDisabled: isSlotDisabled(day.date, computedAvailability, slot.startTime),
      availabilityStatus: status,
    }
  })
}
