import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { verifyAdminToken } from '@/utils/auth';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get a specific admin user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get the admin user
    const { data: user, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, created_at, last_login')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching admin user:', error);
      return NextResponse.json(
        { error: 'Failed to fetch admin user' },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching admin user' },
      { status: 500 }
    );
  }
}

// PATCH - Update a specific admin user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { email, name, password, role } = await request.json();

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', id)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (email) updateData.email = email.toLowerCase();
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    // Update the admin user
    const { data: updatedUser, error } = await supabase
      .from('admin_users')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, email, name, role, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error updating admin user:', error);
      return NextResponse.json(
        { error: 'Failed to update admin user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating admin user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific admin user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Prevent deleting yourself
    if (adminData.sub === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete the admin user
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin user:', error);
      return NextResponse.json(
        { error: 'Failed to delete admin user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/[id]:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting admin user' },
      { status: 500 }
    );
  }
}
