-- Clean up invalid references and add proper foreign key relationships

-- First, remove any featured_items that reference non-existent movies or series
DELETE FROM public.featured_items 
WHERE (item_type = 'movie' AND item_id NOT IN (SELECT id FROM public.movies))
   OR (item_type = 'series' AND item_id NOT IN (SELECT id FROM public.series));

-- Now add the foreign key constraints (we'll use a different approach without multiple FKs)
-- Instead, we'll create a trigger to validate the references

-- Create a function to validate featured item references
CREATE OR REPLACE FUNCTION validate_featured_item_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.item_type = 'movie' THEN
        IF NOT EXISTS (SELECT 1 FROM public.movies WHERE id = NEW.item_id) THEN
            RAISE EXCEPTION 'Referenced movie does not exist';
        END IF;
    ELSIF NEW.item_type = 'series' THEN
        IF NOT EXISTS (SELECT 1 FROM public.series WHERE id = NEW.item_id) THEN
            RAISE EXCEPTION 'Referenced series does not exist';
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid item_type. Must be either movie or series';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate references
DROP TRIGGER IF EXISTS validate_featured_item_trigger ON public.featured_items;
CREATE TRIGGER validate_featured_item_trigger
    BEFORE INSERT OR UPDATE ON public.featured_items
    FOR EACH ROW
    EXECUTE FUNCTION validate_featured_item_reference();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_featured_items_item_id_type ON public.featured_items(item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_featured_items_display_order ON public.featured_items(display_order);