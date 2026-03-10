
-- Create admin sessions table for server-side session validation
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS on admin_sessions - no direct client access
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Ensure RLS is enabled on all tables
ALTER TABLE public.secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_views ENABLE ROW LEVEL SECURITY;

-- Update authenticate_admin to store session server-side
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input text, password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
    admin_record RECORD;
    new_session_token TEXT;
    session_data JSONB;
    expires_at_ts timestamptz;
BEGIN
    SELECT * INTO admin_record FROM public.admins WHERE email = email_input;
    
    IF admin_record IS NULL OR admin_record.password != crypt(password_input, admin_record.password) THEN
        RETURN NULL;
    END IF;
    
    new_session_token := encode(gen_random_bytes(32), 'hex');
    expires_at_ts := now() + interval '24 hours';
    
    -- Store session server-side
    INSERT INTO public.admin_sessions (admin_id, session_token, expires_at)
    VALUES (admin_record.id, new_session_token, expires_at_ts);
    
    -- Clean expired sessions
    DELETE FROM public.admin_sessions WHERE expires_at < now();
    
    session_data := jsonb_build_object(
        'authenticated', true,
        'admin_id', admin_record.id,
        'email', admin_record.email,
        'session_token', new_session_token,
        'expires_at', extract(epoch from expires_at_ts)
    );
    
    RETURN session_data;
END;
$$;

-- Create session validation function
CREATE OR REPLACE FUNCTION public.validate_admin_session(token text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    result_admin_id uuid;
BEGIN
    SELECT admin_id INTO result_admin_id
    FROM public.admin_sessions
    WHERE session_token = token AND expires_at > now();
    RETURN result_admin_id;
END;
$$;

-- Drop ALL existing write policies on content tables (keep only SELECT)
-- movies
DROP POLICY IF EXISTS "Admins can manage movies" ON public.movies;
DROP POLICY IF EXISTS "Movies are viewable by everyone" ON public.movies;
CREATE POLICY "movies_public_read" ON public.movies FOR SELECT USING (true);

-- series
DROP POLICY IF EXISTS "Admins can manage series" ON public.series;
DROP POLICY IF EXISTS "Series are viewable by everyone" ON public.series;
CREATE POLICY "series_public_read" ON public.series FOR SELECT USING (true);

-- featured_items
DROP POLICY IF EXISTS "Admins can insert featured items" ON public.featured_items;
DROP POLICY IF EXISTS "Admins can update featured items" ON public.featured_items;
DROP POLICY IF EXISTS "Admins can delete featured items" ON public.featured_items;
DROP POLICY IF EXISTS "Featured items are viewable by everyone" ON public.featured_items;
CREATE POLICY "featured_items_public_read" ON public.featured_items FOR SELECT USING (true);

-- featured_movies
DROP POLICY IF EXISTS "Admins can manage featured movies" ON public.featured_movies;
DROP POLICY IF EXISTS "Featured movies are viewable by everyone" ON public.featured_movies;
CREATE POLICY "featured_movies_public_read" ON public.featured_movies FOR SELECT USING (true);

-- domain_ads
DROP POLICY IF EXISTS "Admins can insert domain ads" ON public.domain_ads;
DROP POLICY IF EXISTS "Admins can update domain ads" ON public.domain_ads;
DROP POLICY IF EXISTS "Admins can delete domain ads" ON public.domain_ads;
DROP POLICY IF EXISTS "Domain ads readable by everyone" ON public.domain_ads;
CREATE POLICY "domain_ads_public_read" ON public.domain_ads FOR SELECT USING (true);

-- Keep movie_views and series_views INSERT policies (public can record views)
-- These are already correct with restrictive INSERT policies

-- Ensure secrets table has proper restrictive policy
DROP POLICY IF EXISTS "No direct access to secrets" ON public.secrets;
CREATE POLICY "secrets_no_access" ON public.secrets FOR ALL USING (false);

-- Ensure settings read policy exists
DROP POLICY IF EXISTS "Only authenticated admins can modify settings" ON public.settings;
DROP POLICY IF EXISTS "Settings are readable by everyone" ON public.settings;
CREATE POLICY "settings_public_read" ON public.settings FOR SELECT USING (true);

-- Ensure admins table policies
DROP POLICY IF EXISTS "Allow authentication function access" ON public.admins;
DROP POLICY IF EXISTS "No direct client access to admin table" ON public.admins;
CREATE POLICY "admins_no_direct_access" ON public.admins FOR ALL USING (false);
