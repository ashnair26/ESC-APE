import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// JWT secret key - must match the one used for login
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/api/admin',
];

// Paths that are exempt from authentication
const PUBLIC_PATHS = [
  '/admin/login',
  '/admin/reset-password',
  '/api/admin/auth/login',
  '/api/admin/auth/reset-password',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));

  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // If the path is not protected or is public, allow access
  if (!isProtectedPath || isPublicPath) {
    return NextResponse.next();
  }

  // Get the token from the cookie
  const token = request.cookies.get('admin_token')?.value;

  // If there's no token, redirect to login
  if (!token) {
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // Verify the token
    const payload = jwt.verify(token, JWT_SECRET) as { role: string };

    // Check if the user has admin role
    if (payload.role !== 'admin') {
      throw new Error('Insufficient permissions');
    }

    // Allow access
    return NextResponse.next();
  } catch (error) {
    // If token verification fails, redirect to login
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
