-- Habilitar RLS en todas las tablas públicas que no lo tienen
ALTER TABLE public.featured_movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_views ENABLE ROW LEVEL SECURITY;

-- Crear políticas para featured_movies
CREATE POLICY "Featured movies are viewable by everyone" 
ON public.featured_movies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage featured movies" 
ON public.featured_movies 
FOR ALL 
USING (true);

-- Crear políticas para movies (lectura pública)
CREATE POLICY "Movies are viewable by everyone" 
ON public.movies 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage movies" 
ON public.movies 
FOR ALL 
USING (true);

-- Crear políticas para series (lectura pública)
CREATE POLICY "Series are viewable by everyone" 
ON public.series 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage series" 
ON public.series 
FOR ALL 
USING (true);

-- Crear políticas para movie_views (solo inserción pública)
CREATE POLICY "Anyone can record movie views" 
ON public.movie_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view movie stats" 
ON public.movie_views 
FOR SELECT 
USING (true);

-- Crear políticas para series_views (solo inserción pública)
CREATE POLICY "Anyone can record series views" 
ON public.series_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view series stats" 
ON public.series_views 
FOR SELECT 
USING (true);