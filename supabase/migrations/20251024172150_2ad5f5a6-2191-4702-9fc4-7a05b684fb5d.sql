-- Fix update_site_settings function volatility
-- The function was marked as STABLE but contains UPDATE statements
-- Functions that modify data must be VOLATILE

DROP FUNCTION IF EXISTS public.update_site_settings(text, text, text, text);

CREATE OR REPLACE FUNCTION public.update_site_settings(
    site_name_input text DEFAULT NULL::text, 
    site_description_input text DEFAULT NULL::text, 
    logo_url_input text DEFAULT NULL::text, 
    ads_code_input text DEFAULT NULL::text
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
        updated_at = now()
    WHERE id = 1;
    
    -- Return updated settings
    SELECT to_jsonb(settings.*) INTO updated_settings 
    FROM public.settings 
    WHERE id = 1;
    
    RETURN updated_settings;
END;
$function$;