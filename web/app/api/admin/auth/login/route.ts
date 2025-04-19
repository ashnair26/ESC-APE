import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { createAdminClient } from '@/utils/supabase';
import { randomUUID } from 'crypto'; // Import crypto for UUID generation

// Prepare the secret key for jose (needs to be consistent with middleware)
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'esc-ape-admin-jwt-secret-key-change-in-production';
const JWT_SECRET_UINT8ARRAY = new TextEncoder().encode(JWT_SECRET_STRING);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Query the admin_users table
    const { data: users, error: userError } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, name, role')
      .eq('email', email.toLowerCase())
      .limit(1);

    if (userError) {
      console.error('Error querying admin_users:', userError);
      return NextResponse.json({ success: false, error: 'Authentication failed (DB Query)' }, { status: 500 });
    }
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify role
    if (user.role !== 'admin') {
      console.warn(`User ${email} attempted admin login but has role: ${user.role}`);
      return NextResponse.json({ success: false, error: 'Access denied. Not an admin user.' }, { status: 403 });
    }

    // --- Session Management ---
    const sessionId = randomUUID(); // Generate a unique session ID
    const sessionExpiryHours = 2;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + sessionExpiryHours);

    // Insert session into database
    const { error: sessionError } = await supabase
      .from('admin_sessions') // Target the correct table
      .insert({
        session_id: sessionId,
        admin_id: user.id,
        expires_at: expiresAt.toISOString(),
        // Optionally store IP address and User Agent from request headers
        ip_address: request.ip,
        user_agent: request.headers.get('user-agent')
      });

    if (sessionError) {
        console.error('Error inserting admin session:', sessionError);
        // Decide if login should fail if session insert fails (potentially yes for security)
        return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 });
    }
    // --- End Session Management ---


    // Create JWT token using jose, including the session ID
    const token = await new SignJWT({
        email: user.email,
        name: user.name || '',
        role: user.role,
        sessionId: sessionId // Include session ID in the token payload
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime(`${sessionExpiryHours}h`) // Use variable for consistency
      .sign(JWT_SECRET_UINT8ARRAY);

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
      maxAge: 60 * 60 * sessionExpiryHours, // Match JWT expiry
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
    return NextResponse.json({ success: false, error: 'An error occurred during login' }, { status: 500 });
  }
}

// Ensure this route uses Node.js runtime because it uses 'crypto' for randomUUID
export const runtime = 'nodejs';
