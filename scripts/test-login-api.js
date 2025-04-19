// Script to test the login API
const axios = require('axios');
require('dotenv').config();

// Admin user details
const adminEmail = 'admin@escaepe.io';
const adminPassword = 'admin123';

async function testLoginApi() {
  try {
    console.log('Testing login API...');
    console.log(`Attempting to login with ${adminEmail} and password`);
    
    const response = await axios.post('http://localhost:3000/api/admin/auth/login', {
      email: adminEmail,
      password: adminPassword
    }, {
      withCredentials: true
    });
    
    console.log('Login response:', response.status);
    console.log('Response data:', response.data);
    
    if (response.data.success && response.data.user) {
      console.log('Login successful!');
      console.log('User:', response.data.user);
    } else {
      console.log('Login failed:', response.data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error testing login API:', error.response ? error.response.data : error.message);
  }
}

testLoginApi();
