-- Enable pgcrypto extension for crypt() function
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- Re-set the password now that pgcrypto is available
UPDATE public.admins 
SET password = crypt('jorge_2001', gen_salt('bf'))
WHERE email = 'jorge968122@gmail.com';