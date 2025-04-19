/**
 * Test for the login functionality
 */

const { test, expect } = require('@playwright/test');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'admin'
};

// Setup and teardown
test.beforeAll(async () => {
  // Create test user
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(testUser.password, saltRounds);

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', testUser.email)
    .single();

  if (existingUser) {
    // Update existing user
    await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        name: testUser.name,
        role: testUser.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingUser.id);
  } else {
    // Create new user
    await supabase
      .from('users')
      .insert({
        email: testUser.email,
        password_hash: passwordHash,
        name: testUser.name,
        role: testUser.role
      });
  }
});

test.afterAll(async () => {
  // Clean up test user
  await supabase
    .from('users')
    .delete()
    .eq('email', testUser.email);
});

// Tests
test('Login page loads correctly', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByRole('heading', { name: 'Admin Login' })).toBeVisible();
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('Login with valid credentials', async ({ page }) => {
  await page.goto('/admin/login');
  
  // Fill in login form
  await page.getByLabel('Email address').fill(testUser.email);
  await page.getByLabel('Password').fill(testUser.password);
  
  // Submit form
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Verify we're on the dashboard
  await expect(page.url()).toContain('/dashboard');
  
  // Verify user is logged in
  await expect(page.getByText(testUser.name)).toBeVisible();
});

test('Login with invalid credentials', async ({ page }) => {
  await page.goto('/admin/login');
  
  // Fill in login form with invalid credentials
  await page.getByLabel('Email address').fill(testUser.email);
  await page.getByLabel('Password').fill('wrongpassword');
  
  // Submit form
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Verify error message
  await expect(page.getByText('Invalid email or password')).toBeVisible();
  
  // Verify we're still on the login page
  await expect(page.url()).toContain('/admin/login');
});

test('Logout functionality', async ({ page }) => {
  // Login first
  await page.goto('/admin/login');
  await page.getByLabel('Email address').fill(testUser.email);
  await page.getByLabel('Password').fill(testUser.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Click on user menu
  await page.getByText(testUser.name).click();
  
  // Click on Sign out
  await page.getByRole('button', { name: 'Sign out' }).click();
  
  // Wait for redirect to login page
  await page.waitForURL('/admin/login');
  
  // Verify we're on the login page
  await expect(page.url()).toContain('/admin/login');
  
  // Try to access dashboard
  await page.goto('/dashboard');
  
  // Verify we're redirected back to login
  await expect(page.url()).toContain('/admin/login');
});
