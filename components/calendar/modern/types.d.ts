/**
 * Types pour le système de calendrier moderne
 * Couche 0 : Pas d'imports, juste des types
 * Suivant les principes TypeScript strict et separation of concerns
 */

// Domain types - représentent les entités métier
export type TimeSlot = {
  readonly id: string
  readonly dayOfWeek: number // 0-6 (Dimanche à Samedi)
  readonly startTime: string // Format "HH:mm"
  readonly endTime: string // Format "HH:mm"
  readonly maxCapacity: number
  readonly isActive: boolean
}

export type SlotAvailability = {
  readonly available: number
  readonly capacity: number
}

export type SelectedSlot = {
  readonly slotId: string
  readonly date: Date
  readonly startTime: string
  readonly endTime: string
}

// UI State types
export type DayInfo = {
  readonly date: Date
  readonly isToday: boolean
  readonly isPast: boolean
  readonly slots: TimeSlot[]
}

export type SlotDisplayInfo = TimeSlot & {
  readonly availability: SlotAvailability
  readonly isSelected: boolean
  readonly isDisabled: boolean
  readonly availabilityStatus: AvailabilityStatus
}

export type AvailabilityStatus = 'available' | 'limited' | 'full'

// Props types
export type CalendarProps = {
  readonly onSlotSelect: (slots: SelectedSlot[]) => void
  readonly refreshTrigger?: number
}

export type CalendarHeaderProps = {
  readonly currentWeekStart: Date
  readonly onPreviousWeek: () => void
  readonly onNextWeek: () => void
  readonly canGoToPreviousWeek: boolean
  readonly canGoToNextWeek: boolean
}

export type DayCardProps = {
  readonly day: DayInfo
  readonly slots: SlotDisplayInfo[]
  readonly onSlotClick: (slot: TimeSlot, date: Date) => void
}

export type SlotButtonProps = {
  readonly slot: SlotDisplayInfo
  readonly date: Date
  readonly onClick: () => void
}

export type FloatingConfirmButtonProps = {
  readonly selectedSlots: SelectedSlot[]
  readonly onConfirm: () => void
}

// Utility types
export type AvailabilityMap = Record<string, SlotAvailability>

export type AvailabilityBadgeConfig = {
  readonly variant: 'default' | 'secondary' | 'destructive'
  readonly className: string
  readonly label: string
  readonly icon: string
}
