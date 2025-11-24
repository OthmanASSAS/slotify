'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, AlertCircle } from 'lucide-react'
import { createReservation, checkExistingReservations, sendBulkReservationEmailAction } from '@/app/actions/reservations'

interface SelectedSlot {
  slotId: string
  date: Date
  startTime: string
  endTime: string
}

interface ReservationFormProps {
  slots: SelectedSlot[]
  onSuccess: (cancellationCode: string) => void
  onCancel: () => void
}

export default function ReservationForm({ slots, onSuccess, onCancel }: ReservationFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingReservations, setExistingReservations] = useState<string[]>([])

  // Vérifier les réservations quand l'email change (avec debounce idéalement, ici simple)
  const handleEmailChange = async (newEmail: string) => {
    setEmail(newEmail)
    if (newEmail.includes('@') && newEmail.includes('.')) {
      try {
        const existing = await checkExistingReservations(newEmail, slots)
        setExistingReservations(existing)
      } catch (err) {
        console.error('Erreur vérification réservations:', err)
      }
    } else {
      setExistingReservations([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const results = []
      const errors = []

      const successfulReservations = []

      // Réserver chaque créneau séquentiellement
      for (const slot of slots) {
        const result = await createReservation(
          email,
          slot.slotId,
          slot.date
        )

        if (!result.success) {
          errors.push(`${format(slot.date, 'dd/MM HH:mm', { locale: fr })}: ${result.error}`)
        } else {
          results.push(result.cancellationCode)
          successfulReservations.push({
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            cancellationCode: result.cancellationCode
          })
        }
      }

      // Envoyer un seul email récapitulatif si au moins une réservation a réussi
      if (successfulReservations.length > 0) {
        try {
          await sendBulkReservationEmailAction(email, successfulReservations)
        } catch (emailErr) {
          console.error('Erreur envoi email récapitulatif:', emailErr)
        }
      }

      if (errors.length > 0) {
        // Si toutes les réservations ont échoué
        if (results.length === 0) {
          setError(errors.join('\n'))
          setLoading(false)
          return
        }
        // Si certaines ont réussi et d'autres non, on affiche une erreur mais on continue
        // Idéalement on devrait gérer ça mieux (rollback ou message partiel)
        console.error('Certaines réservations ont échoué:', errors)
      }

      if (results.length > 0) {
        // On retourne le premier code pour l'instant (ou une liste si l'UI le supporte)
        // TODO: Adapter l'UI pour afficher plusieurs codes
        onSuccess(results[0])
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[540px] border border-gray-200">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl text-gray-900">
                Confirmer la réservation
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-gray-600">
            {slots.length === 1 ? 'Vous allez réserver 1 créneau' : `Vous allez réserver ${slots.length} créneaux`}
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 bg-blue-50 border border-gray-200 max-h-[200px] overflow-y-auto">
          <div className="space-y-2">
            {slots.map((slot, index) => {
              const dateKey = slot.date.toISOString().split('T')[0]
              const key = `${slot.slotId}-${dateKey}`
              const isReserved = existingReservations.includes(key)

              return (
                <div 
                  key={index} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border shadow-sm transition-colors ${
                    isReserved 
                      ? 'bg-amber-50 border-amber-200 opacity-80' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <Calendar className={`h-4 w-4 shrink-0 ${isReserved ? 'text-amber-600' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${isReserved ? 'text-amber-900' : 'text-gray-800'}`}>
                    {format(slot.date, 'EEE dd MMM', { locale: fr })}
                  </span>
                  <Clock className={`h-4 w-4 shrink-0 ${isReserved ? 'text-amber-600' : 'text-blue-600'}`} />
                  <span className={`text-sm font-bold ${isReserved ? 'text-amber-700' : 'text-blue-600'}`}>
                    {slot.startTime} - {slot.endTime}
                  </span>
                  {isReserved && (
                    <span className="ml-auto text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      Déjà réservé
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Votre adresse email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              placeholder="votre.email@example.com"
              disabled={loading}
              className="border-gray-200 focus:border-blue-400 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500">Votre email doit être autorisé pour effectuer une réservation</p>
          </div>

          {error && (
            <Card className="p-3 bg-red-50 border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </Card>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="border-gray-200 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              {loading ? 'Réservation...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
