// This script creates the first admin user in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Admin user details
    const email = process.argv[2] || 'admin@escape.io';
    const name = process.argv[3] || 'Admin User';
    const password = process.argv[4] || 'admin123';

    if (process.argv.length < 5) {
      console.warn('\n⚠️  Warning: Using default credentials. For production, provide custom values:');
      console.warn('node create-admin-user.js email name password\n');
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      console.log(`Admin user with email ${email} already exists.`);
      return;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create the admin user
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: email.toLowerCase(),
        name,
        password_hash: passwordHash,
        role: 'admin'
      })
      .select('id, email, name, role')
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Admin user created successfully:');
    console.log(data);
    console.log('\nYou can now log in with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    if (process.argv.length < 5) {
      console.log('\n⚠️  Warning: You are using default credentials. Change your password immediately after logging in!');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
