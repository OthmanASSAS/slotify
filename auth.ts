import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { prisma } from './lib/prisma'
import { verifyPassword } from './lib/auth'
import { adminLoginSchema } from './lib/validators'
import { z } from 'zod'

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Valider les credentials
        const parsedCredentials = adminLoginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const { email, password } = parsedCredentials.data

        // Trouver l'admin en DB
        const admin = await prisma.admin.findUnique({
          where: { email },
        })

        if (!admin) {
          return null
        }

        // Vérifier le mot de passe
        const isValid = await verifyPassword(password, admin.password)

        if (!isValid) {
          return null
        }

        // Retourner l'objet user (sera stocké dans le JWT)
        return {
          id: admin.id,
          email: admin.email,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // On utilise JWT (pas de Session DB)
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Au login, ajouter les infos du user dans le token
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      // Rendre les infos du token disponibles côté client
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
})
