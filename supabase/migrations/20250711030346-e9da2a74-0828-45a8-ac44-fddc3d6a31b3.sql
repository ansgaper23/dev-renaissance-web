-- Enable Row Level Security on sensitive tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create admin authentication function with proper security
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input TEXT, password_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_record RECORD;
    session_token TEXT;
    session_data JSONB;
BEGIN
    -- Get admin by email
    SELECT * INTO admin_record FROM public.admins WHERE email = email_input;
    
    -- Check if admin exists and password matches (will be updated to use hashing)
    IF admin_record IS NULL OR admin_record.password != password_input THEN
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

-- Create RLS policies for admins table
CREATE POLICY "Admins can only access their own data" 
ON public.admins 
FOR ALL 
USING (false); -- Disable direct access, use function instead

-- Create RLS policies for secrets table
CREATE POLICY "No direct access to secrets" 
ON public.secrets 
FOR ALL 
USING (false); -- Only accessible via edge functions

-- Create RLS policies for settings table  
CREATE POLICY "Settings are readable by everyone" 
ON public.settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated admins can modify settings" 
ON public.settings 
FOR ALL 
USING (false); -- Will be updated when proper admin auth is implemented

-- Create function to safely get settings
CREATE OR REPLACE FUNCTION public.get_site_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    settings_data JSONB;
BEGIN
    SELECT to_jsonb(settings.*) INTO settings_data 
    FROM public.settings 
    WHERE id = 1;
    
    RETURN settings_data;
END;
$$;

-- Create function to update settings (for admin use)
CREATE OR REPLACE FUNCTION public.update_site_settings(
    site_name_input TEXT DEFAULT NULL,
    site_description_input TEXT DEFAULT NULL,
    logo_url_input TEXT DEFAULT NULL,
    ads_code_input TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_settings JSONB;
BEGIN
    -- Update settings
    UPDATE public.settings 
    SET 
        site_name = COALESCE(site_name_input, site_name),
        site_description = COALESCE(site_description_input, site_description),
        logo_url = COALESCE(logo_url_input, logo_url),
        ads_code = COALESCE(ads_code_input, ads_code),
        updated_at = now()
    WHERE id = 1;
    
    -- Return updated settings
    SELECT to_jsonb(settings.*) INTO updated_settings 
    FROM public.settings 
    WHERE id = 1;
    
    RETURN updated_settings;
END;
$$;