-- Create users table
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

-- Add RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for admins to see all users
CREATE POLICY admin_select_users ON public.users
    FOR SELECT
    USING (auth.role() = 'authenticated' AND EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid() AND auth.users.role = 'admin'
    ));

-- Policy for users to see their own data
CREATE POLICY user_select_own_data ON public.users
    FOR SELECT
    USING (auth.uid()::text = id::text);

-- Create function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email TEXT,
    admin_password_hash TEXT,
    admin_name TEXT DEFAULT 'Admin'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO user_id FROM public.users WHERE email = admin_email;
    
    IF user_id IS NULL THEN
        -- Create admin user
        INSERT INTO public.users (email, password_hash, name, role)
        VALUES (admin_email, admin_password_hash, admin_name, 'admin')
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$;

-- Create function to check user credentials
CREATE OR REPLACE FUNCTION check_user_credentials(
    user_email TEXT,
    user_password_hash TEXT
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    name TEXT,
    role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.email, u.name, u.role
    FROM public.users u
    WHERE u.email = user_email
    AND u.password_hash = user_password_hash;
END;
$$;
