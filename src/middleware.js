import { NextResponse } from 'next/server'

export function middleware(request) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')

  // Protected routes that require authentication
  const protectedPaths = ['/add-item', '/profile', '/my-items']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // If trying to access protected route without token
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // If authenticated user tries to access auth pages, redirect to home
  const authPaths = ['/auth/login', '/auth/register']
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/add-item/:path*',
    '/profile/:path*',
    '/my-items/:path*',
    '/auth/:path*'
  ]
}