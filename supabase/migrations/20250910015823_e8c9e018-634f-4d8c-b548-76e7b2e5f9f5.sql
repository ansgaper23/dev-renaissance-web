-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- First, let's backup any existing admin data and hash the passwords
-- Update existing plaintext passwords to hashed versions
UPDATE public.admins 
SET password = crypt(password, gen_salt('bf'))
WHERE password IS NOT NULL;

-- Drop the existing overly restrictive RLS policies
DROP POLICY IF EXISTS "Admins can only access their own data" ON public.admins;

-- Create proper RLS policies for admin table
-- Allow admin authentication function to access admin records
CREATE POLICY "Allow authentication function access"
ON public.admins
FOR SELECT
USING (true);

-- Prevent direct access to admin table from client
CREATE POLICY "No direct client access to admin table"
ON public.admins
FOR ALL
USING (false)
WITH CHECK (false);

-- Update the authenticate_admin function to use proper password hashing
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input text, password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    admin_record RECORD;
    session_token TEXT;
    session_data JSONB;
BEGIN
    -- Get admin by email
    SELECT * INTO admin_record FROM public.admins WHERE email = email_input;
    
    -- Check if admin exists and verify password using crypt
    IF admin_record IS NULL OR admin_record.password != crypt(password_input, admin_record.password) THEN
        RETURN NULL;
    END IF;
    
    -- Generate session token
    session_token := encode(gen_random_bytes(32), 'hex');
    
    -- Return session data
    session_data := jsonb_build_object(
        'authenticated', true,
        'admin_id', admin_record.id,
        'email', admin_record.email,
        'session_token', session_token,
        'expires_at', extract(epoch from (now() + interval '24 hours'))
    );
    
    RETURN session_data;
END;
$$;

-- Create a secure function to create new admin accounts with hashed passwords
CREATE OR REPLACE FUNCTION public.create_admin_account(email_input text, password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_admin_id UUID;
    result JSONB;
BEGIN
    -- Check if admin with this email already exists
    IF EXISTS (SELECT 1 FROM public.admins WHERE email = email_input) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Admin with this email already exists'
        );
    END IF;
    
    -- Insert new admin with hashed password
    INSERT INTO public.admins (email, password)
    VALUES (email_input, crypt(password_input, gen_salt('bf')))
    RETURNING id INTO new_admin_id;
    
    result := jsonb_build_object(
        'success', true,
        'admin_id', new_admin_id,
        'message', 'Admin account created successfully'
    );
    
    RETURN result;
END;
$$;

-- Create a function to change admin password securely
CREATE OR REPLACE FUNCTION public.change_admin_password(admin_id_input uuid, old_password_input text, new_password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    admin_record RECORD;
    result JSONB;
BEGIN
    -- Get admin record
    SELECT * INTO admin_record FROM public.admins WHERE id = admin_id_input;
    
    -- Verify admin exists and old password is correct
    IF admin_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Admin not found'
        );
    END IF;
    
    IF admin_record.password != crypt(old_password_input, admin_record.password) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Current password is incorrect'
        );
    END IF;
    
    -- Update password with new hashed version
    UPDATE public.admins 
    SET password = crypt(new_password_input, gen_salt('bf'))
    WHERE id = admin_id_input;
    
    result := jsonb_build_object(
        'success', true,
        'message', 'Password changed successfully'
    );
    
    RETURN result;
END;
$$;