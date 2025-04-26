import { NextRequest, NextResponse } from 'next/server';
// Replace jsonwebtoken with jose for Edge compatibility
// import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose'; // Removed createSecretKey import

// JWT secret key - must match the one used for login
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'esc-ape-admin-jwt-secret-key-change-in-production';
// Encode the secret string as Uint8Array for jose
const JWT_SECRET_UINT8ARRAY = new TextEncoder().encode(JWT_SECRET_STRING);

// Paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard', // Dashboard routes require authentication
  '/api/admin',
  '/creatorhub', // CreatorHub routes require authentication
];

// Paths that are exempt from authentication
const EXEMPT_PATHS = [
  '/api/admin/auth/mock-login',
  '/api/admin/auth/login',
  '/api/admin/auth/logout',
];

// Paths that are exempt from authentication
const PUBLIC_PATHS = [
  '/login', // Add the main login page
  '/auth-check', // Add the auth-check page
  '/onboarding', // Add the onboarding path
  '/admin/login',
  '/admin/reset-password',
  '/admin/simple-login',
  '/admin/auth-test',
  '/admin/direct-login',
  '/admin/cookie-test',
  '/admin/real-login',
  '/admin/auth-flow-test',
  '/admin/new-login',
  '/admin/dashboard', // Allow access to the dashboard (it has its own auth check)
  '/api/admin/auth/login',
  '/api/admin/auth/mock-login',
  '/api/admin/auth/reset-password',
  '/api/admin/auth/user',
  '/api/admin/auth/cookie-test',
  '/api/admin/auth/logout',
  '/api/auth-check', // Add the auth-check API
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // IMPORTANT: Completely bypass middleware for admin routes and dashboard
  if (pathname.startsWith('/admin') || pathname === '/dashboard') {
    console.log(`Middleware: Bypassing all checks for admin route: ${pathname}`);
    return NextResponse.next();
  }

  // Check if the path is exempt from authentication
  const isExemptPath = EXEMPT_PATHS.some(path => pathname === path);
  if (isExemptPath) {
    return NextResponse.next();
  }

  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path));

  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));

  // If the path is not protected or is public, allow access
  if (!isProtectedPath || isPublicPath) {
    return NextResponse.next();
  }

  // Check if this is a CreatorHub route
  const isCreatorHubPath = pathname.startsWith('/creatorhub');

  if (isCreatorHubPath) {
    // For CreatorHub routes, check for Privy token
    const privyToken = request.cookies.get('privy-token')?.value;

    // If there's no Privy token, redirect to login
    if (!privyToken) {
      console.log(`Middleware: No Privy token found for CreatorHub path ${pathname}. Redirecting to login.`);
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Allow access to CreatorHub routes if Privy token exists
    return NextResponse.next();
  }

  // Check if this is a regular user path (not admin)
  if (!pathname.startsWith('/admin')) {
    // For non-admin routes, redirect to the main login page
    console.log(`Middleware: Non-admin path ${pathname} without auth. Redirecting to main login.`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For admin routes, check for admin token
  const token = request.cookies.get('admin_token')?.value;

  // If there's no token, redirect to admin login
  if (!token) {
    // console.log(`Middleware: No token found for protected admin path ${pathname}. Redirecting to admin login.`);
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Restore token verification
  try {
    // Verify the token using jose with the Uint8Array secret
    const { payload } = await jwtVerify(token, JWT_SECRET_UINT8ARRAY, {
      // Specify expected algorithms if known, e.g., algorithms: ['HS256']
    });

    // Check if the user has admin role
    if (!payload || payload.role !== 'admin') {
      throw new Error('Insufficient permissions or invalid payload');
    }

    // Allow access
    return NextResponse.next();
  } catch (error) {
    // If token verification fails, redirect to login
    console.error(`Middleware token verification failed for ${pathname}:`, error); // Keep general error log
    const url = new URL('/admin/login', request.url);
    url.searchParams.set('from', pathname);
    // Clear the invalid cookie before redirecting
    const response = NextResponse.redirect(url);
    response.cookies.delete('admin_token');
    return response;
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

// No longer need to force Node.js runtime as jose is Edge compatible
// export const runtime = 'nodejs';
