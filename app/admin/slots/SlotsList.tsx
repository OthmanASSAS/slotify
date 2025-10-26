'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Clock, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createSlot, deleteSlot, toggleSlotActive } from './actions'
import { useRouter } from 'next/navigation'

interface TimeSlot {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  maxCapacity: number
  isActive: boolean
}

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function SlotsList({ initialData }: { initialData: TimeSlot[] }) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createSlot(formData)
        toast.success('Créneau créé avec succès!')
        setShowAddDialog(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) return

    startTransition(async () => {
      try {
        await deleteSlot(id)
        toast.success('Créneau supprimé')
        router.refresh()
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    })
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleSlotActive(id, isActive)
        toast.success(isActive ? 'Créneau désactivé' : 'Créneau activé')
        router.refresh()
      } catch (error) {
        toast.error('Erreur')
      }
    })
  }

  const groupedSlots = initialData.reduce((acc, slot) => {
    const day = slot.dayOfWeek
    if (!acc[day]) acc[day] = []
    acc[day].push(slot)
    return acc
  }, {} as Record<number, TimeSlot[]>)

  const stats = {
    total: initialData.length,
    active: initialData.filter(s => s.isActive).length,
    inactive: initialData.filter(s => !s.isActive).length,
  }

  return (
    <>
      {/* Stats + Add Button */}
      <div className="flex items-start gap-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Total</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.total}</p>
              </div>
              <Clock className="h-10 w-10 text-emerald-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Actifs</p>
                <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Inactifs</p>
                <p className="text-3xl font-bold text-amber-600">{stats.inactive}</p>
              </div>
              <XCircle className="h-10 w-10 text-amber-500" />
            </div>
          </Card>
        </div>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30 whitespace-nowrap"
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau créneau
        </Button>
      </div>

      {/* Slots by day */}
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
          <div key={day}>
            <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500"></div>
              {dayNames[day]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedSlots[day]?.length > 0 ? (
                groupedSlots[day].map((slot) => (
                  <Card
                    key={slot.id}
                    className={`p-4 border-2 transition-all ${
                      slot.isActive
                        ? 'bg-white border-violet-200 hover:border-violet-300 hover:shadow-lg'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-violet-600" />
                        <span className="font-bold text-lg text-slate-800">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                      <Badge className={slot.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-slate-200 text-slate-600'}>
                        {slot.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>

                    <div className="text-sm text-slate-600 mb-4">
                      Capacité: <span className="font-semibold text-violet-600">{slot.maxCapacity} places</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleActive(slot.id, slot.isActive)}
                        className={slot.isActive ? 'border-amber-300 hover:bg-amber-50' : 'border-emerald-300 hover:bg-emerald-50'}
                        disabled={isPending}
                      >
                        {slot.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(slot.id)}
                        className="border-red-300 hover:bg-red-50 text-red-600"
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center border-2 border-dashed border-slate-200 col-span-full">
                  <p className="text-slate-500">Aucun créneau pour ce jour</p>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] border-2 border-violet-200">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Nouveau créneau horaire
            </DialogTitle>
            <DialogDescription>Créer un nouveau créneau pour la réservation</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jour de la semaine</Label>
              <select
                name="dayOfWeek"
                defaultValue="1"
                className="w-full px-3 py-2 border border-violet-200 rounded-lg focus:border-violet-400 focus:ring-violet-400"
                disabled={isPending}
              >
                {dayNames.map((name, index) => (
                  <option key={index} value={index}>{name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  name="startTime"
                  defaultValue="09:00"
                  className="border-violet-200 focus:border-violet-400"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  name="endTime"
                  defaultValue="10:00"
                  className="border-violet-200 focus:border-violet-400"
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Capacité maximale</Label>
              <Input
                type="number"
                name="maxCapacity"
                min="1"
                max="100"
                defaultValue="25"
                className="border-violet-200 focus:border-violet-400"
                required
                disabled={isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="border-violet-200 hover:bg-violet-50"
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30"
                disabled={isPending}
              >
                {isPending ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
