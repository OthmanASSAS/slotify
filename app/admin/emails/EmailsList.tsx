'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Mail, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { addEmail, deleteEmail } from './actions'
import { useRouter } from 'next/navigation'

interface AllowedEmail {
  id: string
  email: string
  addedAt: string
  _count?: {
    reservations: number
  }
}

export default function EmailsList({ initialData }: { initialData: AllowedEmail[] }) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await addEmail(formData)
        toast.success('Email ajouté avec succès!')
        setShowAddDialog(false)
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Une erreur est survenue')
      }
    })
  }

  const handleDelete = (id: string) => {
    setEmailToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!emailToDelete) return

    startTransition(async () => {
      try {
        await deleteEmail(emailToDelete)
        toast.success('Email supprimé')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
      } finally {
        setDeleteDialogOpen(false)
        setEmailToDelete(null)
      }
    })
  }

  return (
    <>
      {/* Stats + Add Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500">Total des emails autorisés</p>
          <p className="text-3xl font-semibold text-gray-900">{initialData.length}</p>
        </div>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un email
        </Button>
      </div>

      {/* Emails List */}
      <div className="space-y-3">
        {initialData.length === 0 ? (
          <Card className="p-12 text-center border border-gray-200 bg-white">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-base font-medium text-gray-900">Aucun email autorisé</p>
            <p className="text-sm text-gray-500 mt-1">Ajoutez des emails pour permettre aux étudiants de réserver</p>
          </Card>
        ) : (
          initialData.map((email) => (
            <Card
              key={email.id}
              className="p-4 bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{email.email}</p>
                    <p className="text-sm text-gray-500">
                      Ajouté le {format(new Date(email.addedAt), 'dd MMMM yyyy', { locale: fr })}
                    </p>
                    {email._count && email._count.reservations > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        {email._count.reservations} réservation{email._count.reservations > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(email.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement cet email. Cette opération ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-400 hover:bg-red-500"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-900">
              Ajouter un email
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Ajouter un email à la liste blanche pour autoriser les réservations
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Adresse email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="etudiant@example.com"
                className="border-gray-200"
                required
                disabled={isPending}
              />
              <p className="text-xs text-gray-500">
                L&apos;email sera immédiatement autorisé à faire des réservations
              </p>
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
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isPending}
              >
                {isPending ? 'Ajout...' : 'Ajouter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
