// Next.js Middleware for Route Protection
// Inspired by frontend-dev route guards

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/devices',
  '/rooms',
  '/scenes',
  '/users',
  '/settings',
];

// Auth routes that should redirect if already authenticated
const authRoutes = ['/login', '/register'];

// Public routes that don't require authentication
const publicRoutes = ['/', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies
  const token = request.cookies.get('admin_token')?.value;
  const isAuthenticated = !!token;
  
  // Check if current path matches protected routes
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  );
  
  // Check if current path matches auth routes
  const isAuthRoute = authRoutes.some((route) => 
    pathname.startsWith(route)
  );
  
  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Allow access
  return NextResponse.next();
}

// Configure which paths trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|tenants).*)',
  ],
};
