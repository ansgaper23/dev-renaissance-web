
-- Add slug column to series table
ALTER TABLE public.series ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug for better performance and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS series_slug_idx ON public.series(slug);

-- Update existing series to generate slugs from their titles
UPDATE public.series 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
