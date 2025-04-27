import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { verifyAdminToken } from '@/utils/auth';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// POST - Request a password reset
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the admin user
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      // For security reasons, don't reveal if the email exists or not
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    // Store the reset token
    const { error: tokenError } = await supabase
      .from('password_reset_tokens')
      .insert({
        admin_id: user.id,
        token,
        expires_at: expiresAt.toISOString()
      });

    if (tokenError) {
      console.error('Error creating password reset token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to create password reset token' },
        { status: 500 }
      );
    }

    // In a real application, send an email with the reset link
    // For now, we'll just return the token in the response (for development purposes only)
    console.log(`Password reset token for ${email}: ${token}`);

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link',
      // Remove this in production
      debug: {
        token,
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${token}`
      }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/auth/reset-password:', error);
    return NextResponse.json(
      { error: 'An error occurred while requesting password reset' },
      { status: 500 }
    );
  }
}
