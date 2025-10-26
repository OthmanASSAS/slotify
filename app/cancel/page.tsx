'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CancelPage() {
  const [cancellationCode, setCancellationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await fetch('/api/reservations/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancellationCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'annulation')
      }

      setSuccess(true)
      setCancellationCode('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Annuler une réservation</h1>
            <Link
              href="/"
              className="px-4 py-2 text-blue-600 hover:text-blue-800 transition"
            >
              ← Retour
            </Link>
          </div>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Attention:</strong> L&apos;annulation n&apos;est possible que si le créneau commence dans plus de 24 heures.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code d&apos;annulation
                </label>
                <input
                  type="text"
                  id="code"
                  value={cancellationCode}
                  onChange={(e) => setCancellationCode(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Entrez votre code d&apos;annulation"
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <strong>Réservation annulée avec succès!</strong>
                  <p className="text-sm mt-1">Votre place est maintenant disponible pour d&apos;autres étudiants.</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                disabled={loading || !cancellationCode}
              >
                {loading ? 'Annulation...' : 'Annuler ma réservation'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
