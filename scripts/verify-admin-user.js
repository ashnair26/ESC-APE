// Script to verify an admin user in Supabase
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or service role key is missing. Please check your environment variables.');
  process.exit(1);
}

// Admin user details to verify
const adminEmail = 'admin@escaepe.io';
const adminPassword = 'admin123';

async function verifyAdminUser() {
  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the user exists
    console.log(`Checking if user ${adminEmail} exists...`);
    const { data: users, error: queryError } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, name, role')
      .eq('email', adminEmail)
      .limit(1);

    if (queryError) {
      console.error('Error checking for user:', queryError);
      return;
    }

    if (!users || users.length === 0) {
      console.log(`User ${adminEmail} does not exist.`);
      return;
    }

    const user = users[0];
    console.log(`User found: ${user.email} (${user.name}, ${user.role})`);

    // Verify password
    console.log('Verifying password...');
    const passwordMatch = await bcrypt.compare(adminPassword, user.password_hash);
    
    if (passwordMatch) {
      console.log('Password is correct!');
    } else {
      console.log('Password is incorrect.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

verifyAdminUser();
