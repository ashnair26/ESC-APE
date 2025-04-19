import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Get all cookies from the request
  const allCookies = request.cookies.getAll();

  // Check for admin_token specifically
  const adminToken = request.cookies.get('admin_token');

  return NextResponse.json({
    success: true,
    message: 'Cookie test',
    cookies: allCookies.map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 20) + '...' // Only show part of the value for security
    })),
    hasAdminToken: !!adminToken,
    adminTokenPrefix: adminToken ? adminToken.value.substring(0, 20) + '...' : null
  });
}

export async function POST(request: NextRequest) {
  // Create response
  const response = NextResponse.json({
    success: true,
    message: 'Test cookie set'
  });

  // Set a test cookie in the response
  response.cookies.set({
    name: 'test_cookie',
    value: 'test_value',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return response;
}
