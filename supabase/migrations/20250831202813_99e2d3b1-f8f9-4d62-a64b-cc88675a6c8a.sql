-- Crear tabla para elementos destacados que pueden ser películas o series
CREATE TABLE public.featured_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('movie', 'series')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.featured_items ENABLE ROW LEVEL SECURITY;

-- Crear policy para permitir lectura pública
CREATE POLICY "Featured items are viewable by everyone" 
ON public.featured_items 
FOR SELECT 
USING (true);

-- Crear políticas para admin (asumiendo que existe una tabla admins)
CREATE POLICY "Admins can insert featured items" 
ON public.featured_items 
FOR INSERT 
WITH CHECK (true); -- Se puede restringir con lógica de admin más adelante

CREATE POLICY "Admins can update featured items" 
ON public.featured_items 
FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete featured items" 
ON public.featured_items 
FOR DELETE 
USING (true);

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_featured_items_display_order ON public.featured_items(display_order);
CREATE INDEX idx_featured_items_type ON public.featured_items(item_type);