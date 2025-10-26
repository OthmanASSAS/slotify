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
      // For now, we'll book the first slot only
      // TODO: Update API to handle multiple reservations
      const firstSlot = slots[0]

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          timeSlotId: firstSlot.slotId,
          reservationDate: firstSlot.date.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la réservation')
      }

      onSuccess(data.cancellationCode)
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
      <DialogContent className="sm:max-w-[540px] border-2 border-violet-200">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Confirmer la réservation
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-slate-600">
            {slots.length === 1 ? 'Vous allez réserver 1 créneau' : `Vous allez réserver ${slots.length} créneaux`}
          </DialogDescription>
        </DialogHeader>

        <Card className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 max-h-[200px] overflow-y-auto">
          <div className="space-y-2">
            {slots.map((slot, index) => (
              <div key={index} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/80 border border-violet-200 shadow-sm">
                <Calendar className="h-4 w-4 text-violet-600 shrink-0" />
                <span className="text-sm font-medium text-slate-800">{format(slot.date, 'EEE dd MMM', { locale: fr })}</span>
                <Clock className="h-4 w-4 text-violet-600 shrink-0" />
                <span className="text-sm font-bold text-violet-600">{slot.startTime} - {slot.endTime}</span>
              </div>
            ))}
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Votre adresse email</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre.email@example.com"
              disabled={loading}
              className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
            />
            <p className="text-xs text-slate-500">Votre email doit être autorisé pour effectuer une réservation</p>
          </div>

          {error && (
            <Card className="p-3 bg-red-50 border-2 border-red-200">
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
              className="border-violet-200 hover:bg-violet-50"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-500/30"
            >
              {loading ? 'Réservation...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
