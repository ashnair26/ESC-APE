#!/usr/bin/env node

/**
 * Script to test the login functionality
 * 
 * This script creates a test user and attempts to login with the credentials
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL and service key must be set in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'admin'
};

async function testLogin() {
  try {
    console.log('Creating test user...');
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(testUser.password, saltRounds);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();

    let userId;

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', checkError);
      process.exit(1);
    }

    if (existingUser) {
      // Update existing user
      console.log('Updating existing user...');
      const { data, error } = await supabase
        .from('users')
        .update({
          password_hash: passwordHash,
          name: testUser.name,
          role: testUser.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)
        .select('id');

      if (error) {
        console.error('Error updating user:', error);
        process.exit(1);
      }

      userId = existingUser.id;
    } else {
      // Create new user
      console.log('Creating new user...');
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: testUser.email,
          password_hash: passwordHash,
          name: testUser.name,
          role: testUser.role
        })
        .select('id');

      if (error) {
        console.error('Error creating user:', error);
        process.exit(1);
      }

      userId = data[0].id;
    }

    console.log('Test user created/updated successfully');

    // Test login
    console.log('Testing login...');
    
    // Get user from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, name, role')
      .eq('email', testUser.email)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      process.exit(1);
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(testUser.password, user.password_hash);
    if (!passwordMatch) {
      console.error('Password verification failed');
      process.exit(1);
    }

    console.log('Password verification successful');

    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET environment variable is not set');
      process.exit(1);
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('JWT token created successfully');
    
    // Verify token
    try {
      const decoded = jwt.verify(token, jwtSecret);
      console.log('JWT token verified successfully');
      console.log('Decoded token:', decoded);
    } catch (verifyError) {
      console.error('Error verifying token:', verifyError);
      process.exit(1);
    }

    console.log('Login test completed successfully');
  } catch (error) {
    console.error('Error testing login:', error);
    process.exit(1);
  }
}

testLogin();
