#!/usr/bin/env node

/**
 * Script to create an admin user in the Supabase database
 * 
 * Usage:
 * node create_admin_user.js <email> <password> [name]
 * 
 * Example:
 * node create_admin_user.js admin@example.com password123 "Admin User"
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node create_admin_user.js <email> <password> [name]');
  process.exit(1);
}

const email = args[0];
const password = args[1];
const name = args[2] || 'Admin User';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL and service key must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError);
      process.exit(1);
    }

    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          name,
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select('id, email, name, role');

      if (error) {
        console.error('Error updating admin user:', error);
        process.exit(1);
      }

      console.log('Admin user updated successfully:', data[0]);
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          name,
          role: 'admin'
        })
        .select('id, email, name, role');

      if (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
      }

      console.log('Admin user created successfully:', data[0]);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdminUser();
