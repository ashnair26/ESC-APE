import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// JWT secret key - in production, use a strong secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h'; // Token expires in 24 hours

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 5; // Maximum number of failed login attempts
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check for rate limiting
    const { count } = await supabase
      .from('login_attempts')
      .select('id', { count: 'exact' })
      .eq('email', email.toLowerCase())
      .eq('success', false)
      .eq('ip_address', ip)
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString());

    if (count && count >= MAX_LOGIN_ATTEMPTS) {
      // Log the blocked attempt
      await supabase.from('login_attempts').insert({
        email: email.toLowerCase(),
        ip_address: ip,
        success: false
      });

      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Find the user in Supabase
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, name, password_hash, role')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // Log the failed attempt
      await supabase.from('login_attempts').insert({
        email: email.toLowerCase(),
        ip_address: ip,
        success: false
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      // Log the failed attempt
      await supabase.from('login_attempts').insert({
        email: email.toLowerCase(),
        ip_address: ip,
        success: false
      });

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Log the successful attempt
    await supabase.from('login_attempts').insert({
      email: email.toLowerCase(),
      ip_address: ip,
      success: true
    });

    // Create a JWT token
    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : TOKEN_EXPIRY }
    );

    // Set the token in an HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 24 hours in seconds
      path: '/',
    });

    // Return success with the token (for client-side storage if needed)
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
