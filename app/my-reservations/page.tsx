
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { sendMagicLink } from '@/app/actions/magic-link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function MyReservationsLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await sendMagicLink(email)
      
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    } catch (err) {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center shadow-lg border-blue-100">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Vérifiez vos emails ! 📬</h1>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Nous venons d'envoyer un lien de connexion sécurisé à <br/>
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-8 text-sm text-blue-800 text-left flex gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold mb-1">Prochaines étapes :</p>
              <ol className="list-decimal ml-4 space-y-1 text-blue-700">
                <li>Ouvrez votre boîte mail</li>
                <li>Cliquez sur le bouton "Voir mes réservations"</li>
                <li>Accédez directement à votre espace</li>
              </ol>
            </div>
          </div>

          <Button variant="ghost" onClick={() => setSubmitted(false)} className="text-gray-500 hover:text-gray-900">
            ← Essayer une autre adresse
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="mb-4 hover:bg-transparent pl-0 hover:text-blue-600">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes réservations</h1>
          <p className="text-gray-600">
            Entrez votre email pour recevoir un lien d'accès sécurisé à votre espace personnel.
          </p>
        </div>

        <Card className="p-6 bg-white shadow-sm border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Recevoir mon lien d\'accès'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
