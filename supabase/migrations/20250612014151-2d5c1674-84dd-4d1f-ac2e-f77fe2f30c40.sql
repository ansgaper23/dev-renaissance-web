
-- Add omdb_api_key column to the secrets table
ALTER TABLE public.secrets ADD COLUMN IF NOT EXISTS omdb_api_key text;
