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
import { createReservation } from '@/app/actions/reservations'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Pour l'instant, on réserve seulement le premier créneau
      // TODO: Gérer la réservation de plusieurs créneaux
      const firstSlot = slots[0]

      const result = await createReservation(
        email,
        firstSlot.slotId,
        firstSlot.date
      )

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      onSuccess(result.cancellationCode)
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
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-gray-200 shadow-sm">
                <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm font-medium text-gray-800">{format(slot.date, 'EEE dd MMM', { locale: fr })}</span>
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-sm font-bold text-blue-600">{slot.startTime} - {slot.endTime}</span>
              </div>
            ))}
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Votre adresse email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
