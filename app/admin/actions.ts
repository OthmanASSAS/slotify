'use server'

import { signIn } from '@/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'

export async function authenticate(formData: FormData) {
  // Rate limiting
  if (process.env.NODE_ENV !== 'development') {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000)

    if (!rateLimit.success) {
      const resetDate = new Date(rateLimit.reset)
      return {
        error: `Trop de tentatives de connexion. Réessayez après ${resetDate.toLocaleTimeString('fr-FR')}`,
      }
    }
  }

  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })

    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Email ou mot de passe incorrect' }
        default:
          return { error: 'Erreur lors de la connexion' }
      }
    }
    throw error
  }
}
