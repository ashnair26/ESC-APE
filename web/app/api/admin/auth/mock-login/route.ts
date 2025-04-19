import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminToken } from '@/utils/auth';

// Mock admin credentials
const ADMIN_EMAIL = 'admin@escape.io';
const ADMIN_PASSWORD = 'admin123';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check credentials against mock admin
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = createAdminToken({
      sub: 'admin-user',
      email: ADMIN_EMAIL,
      name: 'Admin User',
      role: 'admin',
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: 'admin-user',
        email: ADMIN_EMAIL,
        name: 'Admin User',
        role: 'admin',
      },
    });

    // Set cookie in the response
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
