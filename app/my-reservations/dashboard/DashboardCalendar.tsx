'use client'

import { useState, useEffect } from 'react'
import { ModernCalendar } from '@/components/calendar/modern/ModernCalendar'
import { createReservation } from '@/app/actions/reservations'
import { cancelReservationById } from '@/app/actions/magic-link'
import { getPublicSlots } from '@/app/actions/slots'
import { format } from 'date-fns'
import { TimeSlot } from '@prisma/client'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Reservation {
  id: string
  reservationDate: Date
  timeSlot: {
    id: string
    startTime: string
    endTime: string
  }
  cancellationCode: string
}

interface PendingSlot {
  slotId: string
  date: string
}

interface DashboardCalendarProps {
  initialReservations: Reservation[]
  token: string
  email: string
  pendingSlots?: PendingSlot[]
}

export default function DashboardCalendar({ initialReservations, token, email, pendingSlots }: DashboardCalendarProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // État pour la sélection multiple (nouvelles réservations)
  const [selectedSlots, setSelectedSlots] = useState<{slot: TimeSlot, date: Date}[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPendingMode, setIsPendingMode] = useState(!!pendingSlots)

  // État pour la modale de confirmation d'annulation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null)

  // Pré-charger les créneaux en attente
  useEffect(() => {
    if (pendingSlots && pendingSlots.length > 0) {
      // Charger les TimeSlots pour avoir les infos complètes
      getPublicSlots().then(allSlots => {
        const preSelected = pendingSlots.map(ps => {
          const slot = allSlots.find(s => s.id === ps.slotId)
          if (slot) {
            const slotDate = new Date(ps.date + 'T12:00:00') // Midi pour éviter les problèmes de timezone
            return {
              slot,
              date: slotDate
            }
          }
          return null
        }).filter(Boolean) as {slot: TimeSlot, date: Date}[]
        
        setSelectedSlots(preSelected)
        
        // Afficher un message de confirmation
        if (preSelected.length > 0) {
          toast.success(`${preSelected.length} créneau${preSelected.length > 1 ? 'x' : ''} pré-sélectionné${preSelected.length > 1 ? 's' : ''} !`, {
            description: 'Vérifiez votre sélection et cliquez sur « Confirmer » pour réserver.'
          })
        }
      }).catch(error => {
        console.error('[DashboardCalendar] Error loading slots:', error)
        toast.error("Erreur lors du chargement des créneaux")
      })
    }
  }, [pendingSlots])

  // Calculer les IDs des créneaux réservés par l'utilisateur pour le calendrier
  const userReservations = new Set(
    reservations.map(r => {
      const dateKey = format(new Date(r.reservationDate), 'yyyy-MM-dd')
      return `${r.timeSlot.id}-${dateKey}`
    })
  )

  const handleSlotClick = (slot: TimeSlot, date: Date, isReservedByMe: boolean) => {
    // 1. Si c'est déjà réservé par moi -> Proposer l'annulation (Action immédiate)
    if (isReservedByMe) {
      const dateKey = format(date, 'yyyy-MM-dd')
      const reservation = reservations.find(r => 
        r.timeSlot.id === slot.id && 
        format(new Date(r.reservationDate), 'yyyy-MM-dd') === dateKey
      )
      
      if (reservation) {
        setReservationToCancel(reservation.id)
        setCancelDialogOpen(true)
      }
      return
    }

    // 2. Si c'est libre -> Ajouter/Retirer de la sélection
    setSelectedSlots(prev => {
      const isSelected = prev.some(s => s.slot.id === slot.id && s.date.getTime() === date.getTime())
      if (isSelected) {
        return prev.filter(s => !(s.slot.id === slot.id && s.date.getTime() === date.getTime()))
      } else {
        return [...prev, { slot, date }]
      }
    })
  }

  const handleBulkReservation = async () => {
    if (selectedSlots.length === 0) return

    setIsSubmitting(true)
    const toastId = toast.loading(`Réservation de ${selectedSlots.length} créneaux...`)

    try {
      // On lance toutes les réservations en parallèle
      const results = await Promise.all(
        selectedSlots.map(s => createReservation(email, s.slot.id, s.date))
      )

      const successes = results.filter(r => r.success)
      const failures = results.filter(r => !r.success)

      if (successes.length > 0) {
        // Mettre à jour l'état local avec les succès
        const newReservations = successes.map((r, index) => {
          const originalSlot = selectedSlots[index]
          return {
            id: r.reservationId!,
            reservationDate: originalSlot.date,
            timeSlot: {
              id: originalSlot.slot.id,
              startTime: originalSlot.slot.startTime,
              endTime: originalSlot.slot.endTime
            },
            cancellationCode: r.cancellationCode!
          }
        })

        setReservations(prev => [...prev, ...newReservations])
        setRefreshTrigger(prev => prev + 1)
        setSelectedSlots([]) // Vider la sélection

        // Si on était en mode pending, créer un MagicLink permanent et supprimer la pending reservation
        if (isPendingMode) {
          const { deletePendingReservation } = await import('@/app/actions/pending-reservations')
          const { createMagicLinkFromToken } = await import('@/app/actions/magic-link')
          
          // Créer un MagicLink permanent avec le même token
          await createMagicLinkFromToken(email, token)
          
          // Supprimer la pending reservation
          await deletePendingReservation(token)
          
          setIsPendingMode(false)
        }

        if (failures.length === 0) {
          toast.success(`${successes.length} créneaux réservés avec succès ! 🎉`, { id: toastId })
        } else {
          toast.warning(`${successes.length} réservés, ${failures.length} échecs`, { 
            id: toastId,
            description: "Certains créneaux n'ont pas pu être réservés." 
          })
        }
      } else {
        toast.error("Échec de la réservation", { 
          id: toastId,
          description: failures[0]?.error || "Une erreur est survenue." 
        })
      }

    } catch {
      toast.error("Erreur critique", { id: toastId })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmCancel = async () => {
    if (!reservationToCancel) return

    try {
      const toastId = toast.loading("Annulation en cours...")
      const result = await cancelReservationById(reservationToCancel, token)
      
      if (result.success) {
        toast.success("Réservation annulée", {
          id: toastId,
          description: "Votre place a été libérée."
        })
        
        // Retirer de la liste locale
        setReservations(prev => prev.filter(r => r.id !== reservationToCancel))
        setRefreshTrigger(prev => prev + 1)
      } else {
        toast.error("Erreur", {
          id: toastId,
          description: result.error || "Impossible d'annuler."
        })
      }
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue."
      })
    } finally {
      setCancelDialogOpen(false)
      setReservationToCancel(null)
    }
  }

  return (
    <div className="space-y-6 relative pb-24">
      {isPendingMode ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h2 className="text-green-800 font-semibold mb-1">✅ Finalisez votre réservation</h2>
          <p className="text-sm text-green-700">
            Vos créneaux sont pré-sélectionnés (en <strong className="text-blue-600">bleu</strong>). 
            Vérifiez-les et cliquez sur <strong>&quot;Confirmer ma réservation&quot;</strong> en bas de page pour finaliser.
          </p>
          <p className="text-xs text-green-600 mt-2">
            💡 Vous pouvez ajouter ou retirer des créneaux avant de confirmer.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h2 className="text-blue-800 font-semibold mb-1">Comment ça marche ?</h2>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Sélectionnez plusieurs créneaux <strong>blancs</strong> pour les réserver.</li>
            <li>Cliquez sur un créneau <strong>vert</strong> (Moi) pour l&apos;annuler immédiatement.</li>
          </ul>
        </div>
      )}

      <ModernCalendar
        refreshTrigger={refreshTrigger}
        userReservations={userReservations}
        onSlotClick={handleSlotClick}
        hideFloatingButton={true}
        // Passer la sélection externe pour l'affichage visuel
        externalSelectedSlots={selectedSlots.map(s => ({
          slotId: s.slot.id,
          date: s.date,
          startTime: s.slot.startTime,
          endTime: s.slot.endTime
        }))}
      />
      
      {/* Barre de confirmation flottante */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-50 md:bottom-6 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 md:rounded-full md:border md:max-w-md md:shadow-xl">
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="hidden md:block font-medium text-gray-900 text-sm">
                {selectedSlots.length} créneau{selectedSlots.length > 1 ? 'x' : ''} sélectionné{selectedSlots.length > 1 ? 's' : ''}
              </div>
              <button
                onClick={handleBulkReservation}
                disabled={isSubmitting}
                className="flex-1 md:flex-none btn-primary-pastel px-6 py-3 md:py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? 'Validation...' : (
                  <>
                    <span className="md:hidden">Confirmer ({selectedSlots.length})</span>
                    <span className="hidden md:inline">{isPendingMode ? 'Confirmer ma réservation' : 'Confirmer la réservation'}</span>
                  </>
                )}
              </button>
            </div>
            {!isPendingMode && (
              <button 
                onClick={() => setSelectedSlots([])}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Annuler la sélection"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler ce créneau ?</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous vraiment libérer votre place ? D&apos;autres étudiants pourront la réserver.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Garder</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancel} className="btn-destructive-pastel">
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
