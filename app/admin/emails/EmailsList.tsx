'use client'

import { useState, useTransition } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Mail, Plus, Trash2, CheckCircle2 } from 'lucide-react'
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

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet email ?')) return

    startTransition(async () => {
      try {
        await deleteEmail(id)
        toast.success('Email supprimé')
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression')
      }
    })
  }

  return (
    <>
      {/* Stats */}
      <div className="flex items-center justify-between mb-8">
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 flex-1 mr-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Total des emails autorisés</p>
              <p className="text-4xl font-bold text-purple-600">{initialData.length}</p>
            </div>
            <Mail className="h-16 w-16 text-purple-500 opacity-80" />
          </div>
        </Card>

        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un email
        </Button>
      </div>

      {/* Emails List */}
      <div className="space-y-3">
        {initialData.length === 0 ? (
          <Card className="p-12 text-center border-2 border-violet-200">
            <Mail className="h-16 w-16 text-violet-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">Aucun email autorisé</p>
            <p className="text-sm text-slate-500 mt-2">Ajoutez des emails pour permettre aux étudiants de réserver</p>
          </Card>
        ) : (
          initialData.map((email) => (
            <Card
              key={email.id}
              className="p-4 bg-white border-2 border-violet-200 hover:border-violet-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-800">{email.email}</p>
                    <p className="text-sm text-slate-500">
                      Ajouté le {format(new Date(email.addedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                    {email._count && email._count.reservations > 0 && (
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        {email._count.reservations} réservation{email._count.reservations > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(email.id)}
                    className="border-red-300 hover:bg-red-50 text-red-600"
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

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[500px] border-2 border-violet-200">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <DialogTitle className="text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Ajouter un email
              </DialogTitle>
            </div>
            <DialogDescription>
              Ajouter un email à la liste blanche pour autoriser les réservations
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                Adresse email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="etudiant@example.com"
                className="border-violet-200 focus:border-violet-400 focus:ring-violet-400"
                required
                disabled={isPending}
              />
              <p className="text-xs text-slate-500">
                L&apos;email sera immédiatement autorisé à faire des réservations
              </p>
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
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
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
