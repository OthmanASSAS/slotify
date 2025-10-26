'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Mail, CheckCircle2, XCircle } from 'lucide-react'
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

  const filteredReservations = initialData.filter(res => {
    if (filter === 'active') return !res.cancelledAt
    if (filter === 'cancelled') return !!res.cancelledAt
    return true
  })

  const stats = {
    total: initialData.length,
    active: initialData.filter(r => !r.cancelledAt).length,
    cancelled: initialData.filter(r => !!r.cancelledAt).length,
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Actives</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.active}</p>
            </div>
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Annulées</p>
              <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg' : 'border-violet-200 hover:bg-violet-50'}
        >
          Toutes ({stats.total})
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
          className={filter === 'active' ? 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg' : 'border-emerald-200 hover:bg-emerald-50'}
        >
          Actives ({stats.active})
        </Button>
        <Button
          variant={filter === 'cancelled' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('cancelled')}
          className={filter === 'cancelled' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg' : 'border-red-200 hover:bg-red-50'}
        >
          Annulées ({stats.cancelled})
        </Button>
      </div>

      {/* Reservations List */}
      <div className="space-y-4">
        {filteredReservations.length === 0 ? (
          <Card className="p-12 text-center border-2 border-violet-200">
            <Calendar className="h-16 w-16 text-violet-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-slate-600">Aucune réservation trouvée</p>
          </Card>
        ) : (
          filteredReservations.map((reservation) => (
            <Card
              key={reservation.id}
              className={`p-6 border-2 transition-all hover:shadow-lg ${
                reservation.cancelledAt
                  ? 'bg-red-50/50 border-red-200 opacity-75'
                  : 'bg-white border-violet-200 hover:border-violet-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-violet-600" />
                    <span className="font-semibold text-slate-800">{reservation.allowedEmail.email}</span>
                    {reservation.cancelledAt && (
                      <Badge className="bg-red-100 text-red-700 border border-red-300">
                        Annulée
                      </Badge>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-violet-600" />
                      <span className="text-sm text-slate-600">
                        {dayNames[reservation.timeSlot.dayOfWeek]} - {format(new Date(reservation.reservationDate), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-violet-600" />
                      <span className="text-sm text-slate-600">
                        {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                      </span>
                    </div>
                  </div>

                  {/* Code */}
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1 bg-gradient-to-r from-violet-100 to-purple-100 border border-violet-200 rounded-lg text-sm font-mono font-bold text-violet-700">
                      {reservation.cancellationCode}
                    </code>
                    <span className="text-xs text-slate-500">
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
