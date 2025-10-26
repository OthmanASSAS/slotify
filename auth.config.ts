import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  pages: {
    signIn: '/admin',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnAdmin = nextUrl.pathname.startsWith('/admin')

      if (isOnAdmin && nextUrl.pathname !== '/admin') {
        // Routes admin protégées (sauf /admin qui est le login)
        return isLoggedIn
      }

      return true
    },
  },
  providers: [], // Sera rempli dans auth.ts
} satisfies NextAuthConfig
