import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { createAdminToken } from '@/utils/auth';
import { createAdminClient } from '@/utils/supabase';

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

    // Initialize Supabase admin client
    const supabase = createAdminClient();

    // Query the admin_users table for the user with the provided email
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, name, role')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (error) {
      console.error('Error querying users:', error);
      return NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      );
    }

    // Check if user exists
    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify the user has the 'admin' role
    if (user.role !== 'admin') {
        console.warn(`User ${email} attempted admin login but has role: ${user.role}`);
        return NextResponse.json(
            { success: false, error: 'Access denied. Not an admin user.' },
            { status: 403 } // Forbidden
        );
    }

    // Create JWT token
    const token = createAdminToken({
      sub: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role, // Should be 'admin' now
    });

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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

    // Update last login timestamp
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
