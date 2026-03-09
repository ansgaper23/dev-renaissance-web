-- Reset admin password
UPDATE public.admins 
SET password = crypt('jorge_2001', gen_salt('bf'))
WHERE email = 'jorge968122@gmail.com';