-- Fix the security warnings by moving the extension to proper schema and updating functions

-- Move pgcrypto extension to extensions schema (recommended practice)
DROP EXTENSION IF EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Update the authenticate_admin function with proper search path handling
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input text, password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
AS $$
DECLARE
    admin_record RECORD;
    session_token TEXT;
    session_data JSONB;
BEGIN
    -- Get admin by email
    SELECT * INTO admin_record FROM public.admins WHERE email = email_input;
    
    -- Check if admin exists and verify password using crypt
    IF admin_record IS NULL OR admin_record.password != extensions.crypt(password_input, admin_record.password) THEN
        RETURN NULL;
    END IF;
    
    -- Generate session token
    session_token := encode(extensions.gen_random_bytes(32), 'hex');
    
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

-- Update the create_admin_account function with proper search path
CREATE OR REPLACE FUNCTION public.create_admin_account(email_input text, password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
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
    VALUES (email_input, extensions.crypt(password_input, extensions.gen_salt('bf')))
    RETURNING id INTO new_admin_id;
    
    result := jsonb_build_object(
        'success', true,
        'admin_id', new_admin_id,
        'message', 'Admin account created successfully'
    );
    
    RETURN result;
END;
$$;

-- Update the change_admin_password function with proper search path
CREATE OR REPLACE FUNCTION public.change_admin_password(admin_id_input uuid, old_password_input text, new_password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, extensions
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
    
    IF admin_record.password != extensions.crypt(old_password_input, admin_record.password) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Current password is incorrect'
        );
    END IF;
    
    -- Update password with new hashed version
    UPDATE public.admins 
    SET password = extensions.crypt(new_password_input, extensions.gen_salt('bf'))
    WHERE id = admin_id_input;
    
    result := jsonb_build_object(
        'success', true,
        'message', 'Password changed successfully'
    );
    
    RETURN result;
END;
$$;

-- Re-hash any existing passwords using the properly scoped extension
UPDATE public.admins 
SET password = extensions.crypt(
    -- We need to extract the original password since it's already hashed
    -- For existing admins, you'll need to reset their passwords manually
    password, 
    extensions.gen_salt('bf')
) 
WHERE password IS NOT NULL 
AND password NOT LIKE '$2%'; -- Only update if not already bcrypt hashed