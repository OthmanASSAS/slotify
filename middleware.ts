import { auth } from './auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  // Protéger les routes /admin/* (sauf /admin qui est le login)
  if (req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin') {
    if (!req.auth) {
      return Response.redirect(new URL('/admin', req.url))
    }
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  )
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  return response
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
