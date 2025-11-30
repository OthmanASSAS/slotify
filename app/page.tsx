// /Users/oassas/Projets/slotify/app/page.tsx
"use client"

import { useState } from "react"
import { ModernCalendar } from "@/components/calendar/modern"
import { createPendingReservation } from "@/app/actions/pending-reservations"
import { format } from "date-fns"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface SelectedSlot {
  slotId: string
  date: Date
  startTime: string
  endTime: string
}

export default function HomePage() {
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([])
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleConfirmSelection = () => {
    if (selectedSlots.length === 0) {
      toast.error("Veuillez sélectionner au moins un créneau")
      return
    }
    setEmailDialogOpen(true)
  }

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const pendingSlots = selectedSlots.map(s => ({
      slotId: s.slotId,
      date: format(s.date, 'yyyy-MM-dd') // Utiliser date-fns pour éviter les problèmes UTC
    }))

    const result = await createPendingReservation(email, pendingSlots)

    if (result.success) {
      setEmailSent(true)
      setSelectedSlots([]) // Vider la sélection
      toast.success("Email envoyé ! Vérifiez votre boîte mail.")
    } else {
      toast.error(result.error || "Une erreur est survenue")
    }

    setIsSubmitting(false)
  }

  const handleCloseDialog = () => {
    setEmailDialogOpen(false)
    setEmailSent(false)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Slotify</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Réservation de salle d&apos;étude
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/my-reservations">Mes réservations</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Réservez votre place
          </h2>
          <p className="text-gray-600">
            Sélectionnez vos créneaux et recevez un lien de confirmation par email
          </p>
        </div>

        <ModernCalendar 
          onSlotSelect={(slots) => {
            setSelectedSlots(slots)
          }} 
          hideFloatingButton={true}
        />
      </main>

      {/* Custom Floating Button for Email Collection */}
      {selectedSlots.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[60]">
          <Button
            onClick={handleConfirmSelection}
            size="lg"
            className="btn-primary-pastel shadow-2xl"
          >
            Continuer ({selectedSlots.length} créneau{selectedSlots.length > 1 ? 'x' : ''})
          </Button>
        </div>
      )}

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {!emailSent ? (
            <>
              <DialogHeader>
                <DialogTitle>Entrez votre email</DialogTitle>
                <DialogDescription>
                  Nous vous enverrons un lien pour finaliser votre réservation de {selectedSlots.length} créneau{selectedSlots.length > 1 ? 'x' : ''}.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitEmail} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email universitaire
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      id="email"
                      placeholder="etudiant@univ.fr"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full btn-primary-pastel"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Recevoir le lien de confirmation'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email envoyé !</h3>
              <p className="text-gray-600 mb-4">
                Vérifiez votre boîte mail <strong>{email}</strong> et cliquez sur le lien pour finaliser votre réservation.
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-400 rounded-r-lg p-3 mb-4 text-left">
                <p className="text-sm text-orange-900 font-medium mb-1">⚠️ Vérifiez vos SPAMS</p>
                <p className="text-xs text-orange-800">
                  L'email peut arriver dans votre dossier <strong>Spam/Courrier indésirable</strong>.
                </p>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Le lien est valide pendant 1 heure.
              </p>
              <Button onClick={handleCloseDialog} variant="outline">
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-500">
          <p>Slotify - Plateforme de réservation de salle d&apos;étude</p>
        </div>
      </footer>
    </div>
  )
}
