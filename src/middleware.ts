import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const authRoutes = ['/login', '/register']

const protectedRoutes = ['/documents', '/upload', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const accessToken = request.cookies.get('access_token')
  
  const isAuthenticated = !!accessToken
  
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/documents', request.url))
  }
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (isProtectedRoute && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/documents', request.url))
  }
  
  if (pathname === '/' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}