-- Add telegram_url to settings table
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS telegram_url TEXT;

-- Create storage bucket for site logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for site-assets bucket
CREATE POLICY "Public can view site assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Authenticated users can upload site assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update site assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete site assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- Update the update_site_settings function to include telegram_url
DROP FUNCTION IF EXISTS public.update_site_settings(text, text, text, text);

CREATE OR REPLACE FUNCTION public.update_site_settings(
    site_name_input text DEFAULT NULL::text, 
    site_description_input text DEFAULT NULL::text, 
    logo_url_input text DEFAULT NULL::text, 
    ads_code_input text DEFAULT NULL::text,
    telegram_url_input text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
        telegram_url = COALESCE(telegram_url_input, telegram_url),
        updated_at = now()
    WHERE id = 1;
    
    -- Return updated settings
    SELECT to_jsonb(settings.*) INTO updated_settings 
    FROM public.settings 
    WHERE id = 1;
    
    RETURN updated_settings;
END;
$function$;