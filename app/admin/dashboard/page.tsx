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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 bg-blue-50 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Réservations</h3>
                  <p className="text-4xl font-bold text-gray-900">-</p>
                  <p className="text-xs text-gray-600 mt-2">Total actives</p>
                </div>
                <CalendarDays className="h-12 w-12 text-blue-600 opacity-80" />
              </div>
            </Card>

            <Card className="p-6 bg-emerald-50 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Créneaux</h3>
                  <p className="text-4xl font-bold text-gray-900">10</p>
                  <p className="text-xs text-gray-600 mt-2">Créneaux disponibles</p>
                </div>
                <Clock className="h-12 w-12 text-emerald-600 opacity-80" />
              </div>
            </Card>

            <Card className="p-6 bg-purple-50 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Emails autorisés</h3>
                  <p className="text-4xl font-bold text-gray-900">4</p>
                  <p className="text-xs text-gray-600 mt-2">Étudiants autorisés</p>
                </div>
                <Mail className="h-12 w-12 text-purple-600 opacity-80" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/reservations">
              <Card className="p-6 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Réservations</h2>
                <p className="text-gray-600 text-sm">Gérer toutes les réservations actives et annulées</p>
              </Card>
            </Link>

            <Link href="/admin/slots">
              <Card className="p-6 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Créneaux horaires</h2>
                <p className="text-gray-600 text-sm">Créer et gérer les créneaux disponibles</p>
              </Card>
            </Link>

            <Link href="/admin/emails">
              <Card className="p-6 border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-purple-600 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Emails autorisés</h2>
                <p className="text-gray-600 text-sm">Gérer la liste blanche des emails</p>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
