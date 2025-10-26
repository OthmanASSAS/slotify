import { getSlots } from './actions'
import SlotsList from './SlotsList'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function SlotsPage() {
  const slots = await getSlots()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-violet-200/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-violet-100">
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  Créneaux horaires
                </h1>
                <p className="text-sm text-slate-600">Gérer les créneaux disponibles</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ✅ Composant client pour l'interactivité (dialogs, boutons) */}
        <SlotsList initialData={slots} />
      </main>
    </div>
  )
}
