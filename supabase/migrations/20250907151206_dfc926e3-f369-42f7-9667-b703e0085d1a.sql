-- Add foreign key relationships to featured_items table
-- This will allow proper joining with movies and series tables

-- First, let's ensure the featured_items table has the proper constraints
ALTER TABLE public.featured_items 
ADD CONSTRAINT featured_items_movies_fk 
FOREIGN KEY (item_id) REFERENCES public.movies(id) 
ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE public.featured_items 
ADD CONSTRAINT featured_items_series_fk 
FOREIGN KEY (item_id) REFERENCES public.series(id) 
ON DELETE CASCADE  
DEFERRABLE INITIALLY DEFERRED;

-- Add a check constraint to ensure item_type matches the referenced table
ALTER TABLE public.featured_items 
ADD CONSTRAINT featured_items_type_check 
CHECK (
  (item_type = 'movie' AND EXISTS (SELECT 1 FROM public.movies WHERE id = item_id)) OR
  (item_type = 'series' AND EXISTS (SELECT 1 FROM public.series WHERE id = item_id))
);

-- Create an index for better performance on joins
CREATE INDEX IF NOT EXISTS idx_featured_items_item_id_type ON public.featured_items(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_featured_items_display_order ON public.featured_items(display_order);