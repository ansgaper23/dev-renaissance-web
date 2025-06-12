
-- Add slug column to movies table
ALTER TABLE public.movies ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug for better performance and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS movies_slug_idx ON public.movies(slug);

-- Update existing movies to generate slugs from their titles
UPDATE public.movies 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
