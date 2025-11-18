import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CalendarDays, Clock, Mail, LogOut, Home, BarChart3 } from 'lucide-react'
import { handleSignOut } from './actions'

export default async function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard Admin
                </h1>
                <p className="text-sm text-gray-600">Gestion de Slotify</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild className="hover:bg-gray-100">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Site</span>
                </Link>
              </Button>
              <form action={handleSignOut}>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 shadow-sm"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/reservations">
              <Card className="p-6 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Réservations</h2>
                    <p className="text-sm text-gray-500">Voir tout</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Gérer toutes les réservations actives et annulées</p>
              </Card>
            </Link>

            <Link href="/admin/slots">
              <Card className="p-6 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Créneaux</h2>
                    <p className="text-sm text-gray-500">Configurer</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Créer et gérer les créneaux disponibles</p>
              </Card>
            </Link>

            <Link href="/admin/emails">
              <Card className="p-6 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
                    <p className="text-sm text-gray-500">Liste blanche</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Gérer la liste blanche des emails</p>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
