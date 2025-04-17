import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Verify a password reset token and set a new password
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    // Validate input
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Find the reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('id, admin_id, expires_at, used')
      .eq('token', token)
      .single();

    if (tokenError || !resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Check if token is expired or already used
    if (new Date(resetToken.expires_at) < new Date() || resetToken.used) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update the admin user's password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.admin_id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Mark the token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('id', resetToken.id);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error in POST /api/admin/auth/reset-password/verify:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting password' },
      { status: 500 }
    );
  }
}
