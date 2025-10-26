import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /admin/* routes (except /admin login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('admin_session')

    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/admin', request.url))
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
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
