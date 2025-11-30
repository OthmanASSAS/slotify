'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/ui/search-bar'
import { Calendar, Clock, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Reservation {
  id: string
  allowedEmail: {
    email: string
  }
  timeSlot: {
    startTime: string
    endTime: string
    dayOfWeek: number
  }
  reservationDate: string
  cancellationCode: string
  cancelledAt: string | null
  createdAt: string
}

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function ReservationsList({ initialData }: { initialData: Reservation[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // D'abord filtrer par recherche
  const searchFilteredData = initialData.filter(res => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesEmail = res.allowedEmail.email.toLowerCase().includes(query)
      const matchesCode = res.cancellationCode.toLowerCase().includes(query)
      return matchesEmail || matchesCode
    }
    return true
  })

  // Ensuite filtrer par statut
  const filteredReservations = searchFilteredData.filter(res => {
    if (filter === 'active') return !res.cancelledAt
    if (filter === 'cancelled') return !!res.cancelledAt
    return true
  })

  // Stats basées sur les résultats de la recherche
  const stats = {
    total: searchFilteredData.length,
    active: searchFilteredData.filter(r => !r.cancelledAt).length,
    cancelled: searchFilteredData.filter(r => !!r.cancelledAt).length,
  }

  return (
    <>
      {/* Stats */}
      <div className="flex items-center gap-8 mb-8">
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-semibold text-gray-900">{stats.total}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Actives</p>
          <p className="text-3xl font-semibold text-green-600">{stats.active}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Annulées</p>
          <p className="text-3xl font-semibold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Rechercher par email ou code d'annulation..."
          className="max-w-md"
        />
      </div>

      {/* Filters */}
      <div className="inline-flex rounded-lg border border-gray-200 p-1 bg-white mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-gray-100' : 'hover:bg-gray-50'}
        >
          Toutes ({stats.total})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'hover:bg-gray-50'}
        >
          Actives ({stats.active})
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFilter('cancelled')}
          className={filter === 'cancelled' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'hover:bg-gray-50'}
        >
          Annulées ({stats.cancelled})
        </Button>
      </div>

      {/* Reservations List */}
      <div className="space-y-3">
        {filteredReservations.length === 0 ? (
          <Card className="p-12 text-center border border-gray-200 bg-white">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-base font-medium text-gray-900">Aucune réservation trouvée</p>
          </Card>
        ) : (
          filteredReservations.map((reservation) => (
            <Card
              key={reservation.id}
              className={`p-4 border transition-all ${
                reservation.cancelledAt
                  ? 'bg-red-50 border-red-200 opacity-80'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail className={`h-4 w-4 ${reservation.cancelledAt ? 'text-red-600' : 'text-green-600'}`} />
                    <span className="font-medium text-gray-900">{reservation.allowedEmail.email}</span>
                    {reservation.cancelledAt && (
                      <Badge className="bg-red-200 text-red-800 border-red-300">
                        Annulée
                      </Badge>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className={`h-4 w-4 ${reservation.cancelledAt ? 'text-red-600' : 'text-green-600'}`} />
                      <span className="text-sm text-gray-600">
                        {dayNames[reservation.timeSlot.dayOfWeek]} - {format(new Date(reservation.reservationDate), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${reservation.cancelledAt ? 'text-red-600' : 'text-green-600'}`} />
                      <span className="text-sm text-gray-600">
                        {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="flex items-center gap-2">
                    <code className={`px-2 py-1 rounded text-xs font-mono font-medium ${
                        reservation.cancelledAt
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-green-50 border border-green-200 text-green-700'
                      }`}
                    >
                      {reservation.cancellationCode}
                    </code>
                    <span className="text-xs text-gray-500">
                      Créée le {format(new Date(reservation.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  )
}
