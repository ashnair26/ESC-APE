// Script to create an admin user in Supabase
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

// Admin user details
const adminEmail = 'admin@escaepe.io';
const adminPassword = 'admin123';
const adminName = 'Admin User';
const adminRole = 'admin';

async function createAdminUser() {
  try {
    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the user already exists
    console.log(`Checking if user ${adminEmail} already exists...`);
    const { data: existingUsers, error: queryError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', adminEmail)
      .limit(1);

    if (queryError) {
      console.error('Error checking for existing user:', queryError);
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log(`User ${adminEmail} already exists. Updating password...`);
      
      // Hash the password
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      // Update the user
      const { error: updateError } = await supabase
        .from('admin_users')
        .update({
          password_hash: passwordHash,
          name: adminName,
          role: adminRole,
          updated_at: new Date().toISOString()
        })
        .eq('email', adminEmail);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        return;
      }
      
      console.log(`User ${adminEmail} updated successfully.`);
      return;
    }

    // Hash the password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Create the admin user
    console.log('Creating admin user...');
    const { data: newUser, error: insertError } = await supabase
      .from('admin_users')
      .insert({
        email: adminEmail,
        password_hash: passwordHash,
        name: adminName,
        role: adminRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, name, role');

    if (insertError) {
      console.error('Error creating admin user:', insertError);
      return;
    }

    console.log('Admin user created successfully:', newUser);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();
