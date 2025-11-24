import { verifyMagicLinkAndGetReservations } from '@/app/actions/magic-link'
import { getPendingReservation } from '@/app/actions/pending-reservations'
import DashboardCalendar from './DashboardCalendar'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token

  if (!token) {
    redirect('/my-reservations')
  }

  // Vérifier d'abord si c'est une réservation en attente
  const pendingResult = await getPendingReservation(token)
  
  if (pendingResult.success && pendingResult.slots) {
    // C'est une nouvelle réservation en attente
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Confirmer ma réservation</h1>
                <p className="text-sm text-gray-500">{pendingResult.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <DashboardCalendar 
            initialReservations={[]} 
            token={token} 
            email={pendingResult.email}
            pendingSlots={pendingResult.slots}
          />
        </main>
      </div>
    )
  }

  // Sinon, vérifier si c'est un magic link normal (gestion des réservations existantes)
  const result = await verifyMagicLinkAndGetReservations(token)

  if (!result.success || !result.reservations) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <h1 className="text-xl font-bold text-red-700 mb-2">Lien invalide ou expiré</h1>
            <p className="text-red-600 mb-6">
              Votre lien de connexion n'est plus valide. Veuillez en demander un nouveau.
            </p>
            <Button asChild>
              <Link href="/my-reservations">Retour à la connexion</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mes Réservations</h1>
              <p className="text-sm text-gray-500">{result.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-gray-500">
            <Link href="/">
              <LogOut className="w-4 h-4 mr-2" />
              Quitter
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <DashboardCalendar 
          initialReservations={result.reservations} 
          token={token} 
          email={result.email}
        />
      </main>
    </div>
  )
}
