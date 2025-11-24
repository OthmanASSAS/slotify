
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cancelReservationById } from '@/app/actions/magic-link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Reservation {
  id: string
  reservationDate: Date
  timeSlot: {
    startTime: string
    endTime: string
  }
  cancellationCode: string
}

interface ReservationsListProps {
  initialReservations: Reservation[]
  token: string
}

export default function ReservationsList({ initialReservations, token }: ReservationsListProps) {
  // Trier les réservations par date puis par heure de début
  const sortedReservations = [...initialReservations].sort((a, b) => {
    const dateA = new Date(a.reservationDate).getTime()
    const dateB = new Date(b.reservationDate).getTime()
    if (dateA !== dateB) return dateA - dateB
    return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime)
  })

  const [reservations, setReservations] = useState<Reservation[]>(sortedReservations)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      const result = await cancelReservationById(id, token)
      if (result.success) {
        setReservations(prev => prev.filter(r => r.id !== id))
      } else {
        alert('Erreur lors de l\'annulation: ' + result.error)
      }
    } catch (error) {
      alert('Une erreur est survenue')
    } finally {
      setCancellingId(null)
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune réservation à venir</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Vous n'avez pas de réservation prévue pour le moment. Réservez un créneau dès maintenant !
        </p>
        <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700">
          <Link href="/">Réserver un créneau</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Vos prochaines sessions ({reservations.length})
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {reservations.map((reservation) => {
          const date = new Date(reservation.reservationDate)
          const isToday = new Date().toDateString() === date.toDateString()
          
          return (
            <Card key={reservation.id} className="group overflow-hidden border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                      isToday ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <div className="text-center leading-none">
                        <span className="block text-xs font-medium uppercase opacity-80">
                          {format(date, 'MMM', { locale: fr })}
                        </span>
                        <span className="block text-lg font-bold">
                          {format(date, 'dd', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 capitalize">
                        {format(date, 'EEEE d MMMM', { locale: fr })}
                      </h3>
                      {isToday && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          Aujourd'hui
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-medium mb-1">CODE</span>
                    <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm font-mono font-bold tracking-wide border border-gray-200">
                      {reservation.cancellationCode}
                    </code>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-700 font-medium">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    {reservation.timeSlot.startTime} - {reservation.timeSlot.endTime}
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        disabled={cancellingId === reservation.id}
                      >
                        {cancellingId === reservation.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        <span className="text-sm">Annuler</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Annuler la réservation ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir annuler votre créneau du <strong>{format(date, 'd MMMM', { locale: fr })} à {reservation.timeSlot.startTime}</strong> ?
                          <br/><br/>
                          Cette action est irréversible et libérera la place pour d'autres étudiants.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Garder ma place</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleCancel(reservation.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Oui, annuler
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
