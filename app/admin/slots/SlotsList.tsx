'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Plus, Trash2 } from 'lucide-react'
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
  const [selectedDay, setSelectedDay] = useState('1')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Ajouter le jour sélectionné au FormData
    formData.set('dayOfWeek', selectedDay)

    startTransition(async () => {
      try {
        await createSlot(formData)
        toast.success('Créneaux créés avec succès!')
        setShowAddDialog(false)
        setSelectedDay('1')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
      }
    })
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [slotToDelete, setSlotToDelete] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setSlotToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!slotToDelete) return
    
    startTransition(async () => {
      try {
        await deleteSlot(slotToDelete)
        toast.success('Créneau supprimé')
        router.refresh()
      } catch {
        toast.error('Erreur lors de la suppression')
      } finally {
        setDeleteDialogOpen(false)
        setSlotToDelete(null)
      }
    })
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleSlotActive(id, isActive)
        toast.success(isActive ? 'Créneau désactivé' : 'Créneau activé')
        router.refresh()
      } catch {
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Actifs</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.active}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Inactifs</p>
            <p className="text-3xl font-semibold text-gray-900">{stats.inactive}</p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="btn-primary-pastel"
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
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              {dayNames[day]}
            </h2>
            <div className="space-y-2">
              {groupedSlots[day]?.length > 0 ? (
                groupedSlots[day].map((slot) => (
                  <Card
                    key={slot.id}
                    className={`p-3 border transition-all ${
                      slot.isActive
                        ? 'bg-white border-gray-200 hover:border-gray-300'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-900 text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Capacité: <span className="font-medium text-gray-900">{slot.maxCapacity}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(slot.id, slot.isActive)}
                          className={`h-8 min-w-[70px] text-xs font-medium ${
                            slot.isActive
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                          disabled={isPending}
                        >
                          {slot.isActive ? 'Actif' : 'Inactif'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(slot.id)}
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center border border-dashed border-gray-200 bg-white">
                  <p className="text-sm text-gray-500">Aucun créneau pour ce jour</p>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement ce créneau horaire. Cette opération ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
                          onClick={handleConfirmDelete}
                          className="btn-destructive-pastel"
                        >              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900">
              Créer des créneaux horaires
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              La plage horaire sera découpée en créneaux d&apos;1 heure
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Jour de la semaine</Label>
              <Select value={selectedDay} onValueChange={setSelectedDay} disabled={isPending}>
                <SelectTrigger className="border-gray-200 bg-white w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {dayNames.map((name, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Input
                  type="time"
                  name="startTime"
                  defaultValue="06:00"
                  step="1800"
                  className="border-gray-200"
                  required
                  disabled={isPending}
                />
                <p className="text-xs text-gray-500">:00 ou :30</p>
              </div>
              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Input
                  type="time"
                  name="endTime"
                  defaultValue="12:00"
                  step="1800"
                  className="border-gray-200"
                  required
                  disabled={isPending}
                />
                <p className="text-xs text-gray-500">:00 ou :30</p>
              </div>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-900">
                <strong className="font-semibold">Exemples :</strong>
              </p>
              <ul className="text-xs text-blue-800 mt-1 space-y-1">
                <li>• 6h-12h → 6 créneaux d&apos;1h (6h-7h, 7h-8h, ..., 11h-12h)</li>
                <li>• 6h30-12h → 6h30-7h (30min) puis 5 créneaux d&apos;1h</li>
                <li>• 6h-12h30 → 6 créneaux d&apos;1h puis 12h-12h30 (30min)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>Capacité par créneau</Label>
              <Input
                type="number"
                name="maxCapacity"
                min="1"
                max="100"
                defaultValue="25"
                className="border-gray-200"
                required
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">Même capacité pour tous les créneaux</p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="btn-primary-pastel"
                disabled={isPending}
              >
                {isPending ? 'Création...' : 'Créer les créneaux'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
