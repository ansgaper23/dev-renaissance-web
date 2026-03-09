-- Update authenticate_admin to use extensions.crypt
CREATE OR REPLACE FUNCTION public.authenticate_admin(email_input text, password_input text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
    admin_record RECORD;
    session_token TEXT;
    session_data JSONB;
BEGIN
    SELECT * INTO admin_record FROM public.admins WHERE email = email_input;
    
    IF admin_record IS NULL OR admin_record.password != crypt(password_input, admin_record.password) THEN
        RETURN NULL;
    END IF;
    
    session_token := encode(gen_random_bytes(32), 'hex');
    
    session_data := jsonb_build_object(
        'authenticated', true,
        'admin_id', admin_record.id,
        'email', admin_record.email,
        'session_token', session_token,
        'expires_at', extract(epoch from (now() + interval '24 hours'))
    );
    
    RETURN session_data;
END;
$function$;