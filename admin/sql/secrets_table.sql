-- Create the secrets table
CREATE TABLE IF NOT EXISTS secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    creator_id TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (name, creator_id)
);

-- Enable Row Level Security
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows only authenticated users with the admin role to access secrets
CREATE POLICY admin_policy ON secrets
    USING (auth.jwt() ->> 'role' = 'admin');

-- Create a function to get a secret by name and creator_id
CREATE OR REPLACE FUNCTION get_secret(secret_name TEXT, creator_id TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    secret_value TEXT;
BEGIN
    -- Check if the user has admin role
    IF (auth.jwt() ->> 'role') != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can access secrets';
    END IF;

    -- Get the secret value
    SELECT value INTO secret_value
    FROM secrets
    WHERE name = secret_name
    AND (creator_id IS NULL OR secrets.creator_id = creator_id);

    RETURN secret_value;
END;
$$;

-- Create a function to set a secret
CREATE OR REPLACE FUNCTION set_secret(secret_name TEXT, secret_value TEXT, creator_id TEXT DEFAULT NULL, secret_description TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    existing_id UUID;
BEGIN
    -- Check if the user has admin role
    IF (auth.jwt() ->> 'role') != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can set secrets';
    END IF;

    -- Check if the secret already exists
    SELECT id INTO existing_id
    FROM secrets
    WHERE name = secret_name
    AND (creator_id IS NULL OR secrets.creator_id = creator_id);

    -- Update or insert the secret
    IF existing_id IS NOT NULL THEN
        UPDATE secrets
        SET value = secret_value,
            description = secret_description,
            updated_at = now()
        WHERE id = existing_id;
    ELSE
        INSERT INTO secrets (name, value, creator_id, description)
        VALUES (secret_name, secret_value, creator_id, secret_description);
    END IF;

    RETURN TRUE;
END;
$$;

-- Create a function to delete a secret
CREATE OR REPLACE FUNCTION delete_secret(secret_name TEXT, creator_id TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the user has admin role
    IF (auth.jwt() ->> 'role') != 'admin' THEN
        RAISE EXCEPTION 'Only administrators can delete secrets';
    END IF;

    -- Delete the secret
    DELETE FROM secrets
    WHERE name = secret_name
    AND (creator_id IS NULL OR secrets.creator_id = creator_id);

    RETURN TRUE;
END;
$$;
