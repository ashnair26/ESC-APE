// This script sets up the necessary environment variables for the application
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate a random JWT secret
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

// Create or update .env.local
const createEnvFile = () => {
  const jwtSecret = generateJwtSecret();
  
  // Default environment variables
  const envVars = {
    JWT_SECRET: jwtSecret,
    // Add other environment variables as needed
  };
  
  // Read existing .env.local if it exists
  let existingEnvVars = {};
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    existingEnvVars = envContent.split('\n').reduce((acc, line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        acc[key.trim()] = value.trim();
      }
      return acc;
    }, {});
  }
  
  // Merge existing and new environment variables
  const mergedEnvVars = { ...envVars, ...existingEnvVars };
  
  // Create .env.local content
  const envContent = Object.entries(mergedEnvVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Write to .env.local
  fs.writeFileSync(envPath, envContent);
  
  console.log(`${envExists ? 'Updated' : 'Created'} .env.local with the following variables:`);
  Object.entries(mergedEnvVars).forEach(([key, value]) => {
    console.log(`${key}=${key === 'JWT_SECRET' ? '********' : value}`);
  });
};

// Run the script
createEnvFile();
