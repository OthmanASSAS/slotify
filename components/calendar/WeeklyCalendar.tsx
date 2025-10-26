'use client'

import { useState, useEffect } from 'react'
import { format, addDays, startOfWeek, isSameDay, isAfter, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TimeSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  maxCapacity: number
  isActive: boolean
}

interface SelectedSlot {
  slotId: string
  date: Date
  startTime: string
  endTime: string
}

interface WeeklyCalendarProps {
  onSlotSelect: (slots: SelectedSlot[]) => void
}

const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8) // 8h to 23h

export default function WeeklyCalendar({ onSlotSelect }: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([])

  useEffect(() => {
    fetchTimeSlots()
  }, [])

  const fetchTimeSlots = async () => {
    try {
      const response = await fetch('/api/slots')
      const data = await response.json()
      setTimeSlots(data)
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysOfWeek = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeekStart, i))
    }
    return days
  }

  const getSlotForTime = (dayOfWeek: number, hour: number): TimeSlot | null => {
    return timeSlots.find(slot => {
      const slotHour = parseInt(slot.startTime.split(':')[0])
      return slot.dayOfWeek === dayOfWeek && slotHour === hour
    }) || null
  }

  const isSlotSelected = (date: Date, hour: number, slotId?: string): boolean => {
    return selectedSlots.some(s =>
      isSameDay(s.date, date) &&
      parseInt(s.startTime.split(':')[0]) === hour &&
      (!slotId || s.slotId === slotId)
    )
  }

  const handleSlotClick = (slot: TimeSlot | null, date: Date, hour: number) => {
    const isPast = !isAfter(date, startOfDay(new Date())) && !isSameDay(date, startOfDay(new Date()))
    if (isPast || !slot) return

    const slotKey = { slotId: slot.id, date, startTime: slot.startTime, endTime: slot.endTime }
    const isSelected = isSlotSelected(date, hour, slot.id)

    if (isSelected) {
      setSelectedSlots(prev => prev.filter(s => !(s.slotId === slot.id && isSameDay(s.date, date))))
    } else {
      setSelectedSlots(prev => [...prev, slotKey])
    }
  }

  const handleConfirmSelection = () => {
    if (selectedSlots.length > 0) {
      onSlotSelect(selectedSlots)
      setSelectedSlots([])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    )
  }

  const days = getDaysOfWeek()
  const today = startOfDay(new Date())

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="text-sm font-semibold">
              {format(currentWeekStart, 'MMM yyyy', { locale: fr })}
            </div>
            <div className="text-xs text-muted-foreground hidden sm:block">
              {format(currentWeekStart, 'dd', { locale: fr })} - {format(addDays(currentWeekStart, 6), 'dd', { locale: fr })}
            </div>
          </div>
          <Button
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {selectedSlots.length > 0 && (
          <Button
            onClick={handleConfirmSelection}
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30 shrink-0 animate-in fade-in slide-in-from-right-2 duration-300"
          >
            Réserver ({selectedSlots.length})
          </Button>
        )}
      </div>

      {/* Calendar Grid - Schedule View */}
      <div className="rounded-xl border-2 border-violet-200/60 bg-white overflow-hidden shadow-lg shadow-violet-500/10">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b-2 border-violet-200/60 bg-gradient-to-b from-violet-50 to-purple-50">
          <div className="p-2 text-xs font-medium text-center border-r border-violet-200/60"></div>
          {days.map((day, index) => {
            const isToday = isSameDay(day, today)
            return (
              <div
                key={index}
                className={`p-3 text-center border-r border-violet-200/60 last:border-r-0 transition-colors ${
                  isToday ? 'bg-gradient-to-b from-violet-100 to-purple-100' : ''
                }`}
              >
                <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-violet-700' : 'text-slate-600'}`}>
                  {dayNames[day.getDay()]}
                </div>
                <div className={`text-lg font-bold mt-1 ${isToday ? 'text-violet-600' : 'text-slate-800'}`}>
                  {format(day, 'dd')}
                </div>
                {isToday && (
                  <div className="mt-1">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full">
                      Aujourd&apos;hui
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Time Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-violet-100 last:border-b-0 hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 transition-all duration-200">
              {/* Hour Label */}
              <div className="p-2 text-xs font-bold text-slate-600 text-center border-r border-violet-100 bg-gradient-to-r from-slate-50 to-slate-100 sticky left-0">
                {hour}h
              </div>

              {/* Day Cells */}
              {days.map((day, dayIndex) => {
                const dayOfWeek = day.getDay()
                const slot = getSlotForTime(dayOfWeek, hour)
                const isPast = !isAfter(day, today) && !isSameDay(day, today)
                const isSelected = slot && isSlotSelected(day, hour, slot.id)
                const isToday = isSameDay(day, today)
                const availableSlots = 20 // TODO: Get from API
                const percentage = slot ? (availableSlots / slot.maxCapacity) * 100 : 0

                return (
                  <div
                    key={dayIndex}
                    onClick={() => slot && handleSlotClick(slot, day, hour)}
                    className={`
                      p-2 sm:p-3 border-r border-violet-100 last:border-r-0 min-h-[56px] sm:min-h-[64px] cursor-pointer transition-all duration-200
                      ${isToday ? 'bg-violet-50/30' : ''}
                      ${isPast ? 'opacity-40 cursor-not-allowed bg-slate-50/50' : ''}
                      ${!slot ? 'bg-slate-50/30 cursor-not-allowed' : ''}
                      ${isSelected ? 'bg-gradient-to-br from-violet-500 to-purple-600 ring-2 ring-violet-400 ring-offset-2 shadow-lg shadow-violet-500/30 scale-[1.02]' : ''}
                      ${slot && !isPast && !isSelected ? 'hover:bg-gradient-to-br hover:from-violet-100 hover:to-purple-100 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]' : ''}
                    `}
                  >
                    {slot && (
                      <div className="h-full flex flex-col items-center justify-center gap-1.5">
                        <div className={`
                          w-3 h-3 rounded-full shrink-0 transition-all duration-200 shadow-sm
                          ${isSelected
                            ? 'bg-white scale-125 shadow-white/50'
                            : percentage > 50
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
                            : percentage > 0
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                            : 'bg-gradient-to-br from-red-400 to-red-600'}
                        `}></div>
                        <div className={`text-[10px] font-bold text-center hidden sm:block ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                          {availableSlots}/{slot.maxCapacity}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Colorful Legend */}
      <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm"></div>
          <span className="text-xs font-semibold text-emerald-700">Disponible</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-100 border border-amber-200">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm"></div>
          <span className="text-xs font-semibold text-orange-700">Limité</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm"></div>
          <span className="text-xs font-semibold text-red-700">Complet</span>
        </div>
      </div>
    </div>
  )
}
