# Authentication System

This document describes the authentication system for the ESC-APE Creator Engine.

## Overview

The authentication system uses a combination of:

1. **Supabase** for user data storage
2. **JWT tokens** for session management
3. **bcrypt** for password hashing
4. **Next.js middleware** for route protection

## User Model

Users are stored in the Supabase `users` table with the following schema:

```sql
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
```

## Authentication Flow

1. **Login**:
   - User submits email and password to `/api/admin/auth/login`
   - Server verifies credentials against Supabase
   - If valid, a JWT token is generated and set as an HTTP-only cookie
   - User is redirected to the dashboard

2. **Session Verification**:
   - Next.js middleware checks for the presence of the `admin_token` cookie
   - If present, the token is verified using the JWT secret
   - If valid, the user is allowed to access protected routes
   - If invalid or missing, the user is redirected to the login page

3. **Logout**:
   - User clicks "Sign out" in the dashboard
   - Client sends a request to `/api/admin/auth/logout`
   - Server clears the `admin_token` cookie
   - User is redirected to the login page

## Protected Routes

The following routes are protected and require authentication:

- `/dashboard/*` - All dashboard routes
- `/api/admin/*` - All admin API routes (except login/logout)

## User Roles

The system supports the following roles:

- `admin`: Full access to all features
- `user`: Limited access (not currently used)

## Creating Admin Users

Admin users can be created using the `create_admin_user.js` script:

```bash
node scripts/create_admin_user.js <email> <password> [name]
```

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Tokens are signed with a secret key and have a 24-hour expiration
3. **HTTP-Only Cookies**: Prevents JavaScript access to the authentication token
4. **CSRF Protection**: Strict same-site cookie policy
5. **Secure Cookies**: In production, cookies are only sent over HTTPS

## Testing

Authentication tests are located in `tests/auth/test_login.js` and can be run with:

```bash
npx playwright test tests/auth/test_login.js
```
