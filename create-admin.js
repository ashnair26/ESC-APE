// Simple script to create an admin user in Supabase
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = 'https://mzpukqipelskkqdntmtr.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

// Admin user details
const adminEmail = 'admin@escape.io';
const adminPassword = 'admin123';
const adminName = 'Admin User';

async function createAdminUser() {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    // Check if users table exists, if not create it
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name TEXT,
          role TEXT DEFAULT 'user',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          last_login TIMESTAMP WITH TIME ZONE
        );
      `
    });
    
    if (tableError) {
      console.log('Creating users table directly...');
      // Try direct SQL if RPC fails
      const { error: directError } = await supabase.from('users').select('count(*)');
      if (directError && directError.code === '42P01') {
        console.log('Users table does not exist, creating it...');
        // Create the table using direct SQL
        const { error: createError } = await supabase.sql(`
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'user',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            last_login TIMESTAMP WITH TIME ZONE
          );
        `);
        
        if (createError) {
          console.error('Error creating users table:', createError);
          return;
        }
      }
    }
    
    // Check if admin user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError);
      return;
    }
    
    if (existingUser) {
      // Update existing user
      console.log('Admin user already exists, updating...');
      const { data, error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          name: adminName,
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select('id, email, name, role');
      
      if (error) {
        console.error('Error updating admin user:', error);
        return;
      }
      
      console.log('Admin user updated successfully:', data[0]);
    } else {
      // Create new user
      console.log('Creating new admin user...');
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: adminEmail,
          password_hash: passwordHash,
          name: adminName,
          role: 'admin'
        })
        .select('id, email, name, role');
      
      if (error) {
        console.error('Error creating admin user:', error);
        return;
      }
      
      console.log('Admin user created successfully:', data[0]);
    }
    
    console.log('\nAdmin user credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\nYou can now log in with these credentials at http://localhost:3000/admin/login');
  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();
