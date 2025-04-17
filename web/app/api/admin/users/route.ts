import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { verifyAdminToken } from '@/utils/auth';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - List all admin users
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all admin users
    const { data: users, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, created_at, last_login')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch admin users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching admin users' },
      { status: 500 }
    );
  }
}

// POST - Create a new admin user
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const { email, name, password, role = 'admin' } = await request.json();

    // Validate input
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new admin user
    const { data: newUser, error } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        name,
        password_hash: passwordHash,
        role
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      console.error('Error creating admin user:', error);
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating admin user' },
      { status: 500 }
    );
  }
}
