import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Fallback content if no featured items are configured
const fallbackItems = [
  {
    id: 1,
    title: "Avengers: Endgame",
    description: "Después de los devastadores eventos de 'Vengadores: Infinity War', el universo está en ruinas. Con la ayuda de los aliados que quedaron, los Vengadores se reúnen una vez más para intentar deshacer las acciones de Thanos y restaurar el equilibrio del universo.",
    backdropUrl: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    rating: 4.8,
    year: 2019,
    genre: "Acción, Aventura",
    type: "movie"
  },
  {
    id: 2,
    title: "Breaking Bad",
    description: "Un profesor de química de secundaria con cáncer terminal se asocia con un antiguo estudiante para producir y vender metanfetamina con el fin de asegurar el futuro financiero de su familia.",
    backdropUrl: "https://image.tmdb.org/t/p/original/eSzpy96DwBujGFj0xMbXBcGcfxX.jpg",
    rating: 4.9,
    year: 2008,
    genre: "Drama, Crimen",
    type: "series"
  },
  {
    id: 3,
    title: "Dune",
    description: "Paul Atreides, un joven brillante y talentoso nacido en un gran destino más allá de su entendimiento, debe viajar al planeta más peligroso del universo para asegurar el futuro de su familia y de su pueblo.",
    backdropUrl: "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
    rating: 4.5,
    year: 2021,
    genre: "Ciencia ficción, Drama",
    type: "movie"
  }
];

const FeaturedCarouselUnified = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch featured items from database (both movies and series)
  const { data: featuredItemsData = [] } = useQuery({
    queryKey: ['featuredItems'],
    queryFn: async () => {
      // 1) Fetch featured item ids only (no embeds) preserving order
      const { data: featuredRows, error } = await supabase
        .from('featured_items')
        .select('*')
        .order('display_order');

      if (error) {
        console.error('Error fetching featured items:', error);
        return [] as any[];
      }

      if (!featuredRows || featuredRows.length === 0) return [] as any[];

      // 2) Split ids by type
      const movieIds = featuredRows
        .filter((r: any) => r.item_type === 'movie')
        .map((r: any) => r.item_id);
      const seriesIds = featuredRows
        .filter((r: any) => r.item_type === 'series')
        .map((r: any) => r.item_id);

      // 3) Fetch movies and series in parallel
      const [moviesRes, seriesRes] = await Promise.all([
        movieIds.length
          ? supabase
              .from('movies')
              .select('id, slug, title, overview, backdrop_path, poster_path, rating, release_date, genres')
              .in('id', movieIds)
          : Promise.resolve({ data: [], error: null }),
        seriesIds.length
          ? supabase
              .from('series')
              .select('id, slug, title, overview, backdrop_path, poster_path, rating, first_air_date, genres')
              .in('id', seriesIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (moviesRes.error) console.error('Error fetching movies for featured:', moviesRes.error);
      if (seriesRes.error) console.error('Error fetching series for featured:', seriesRes.error);

      // 4) Build maps for quick lookup
      const movieMap = new Map((moviesRes.data as any[]).map((m: any) => [m.id, m]));
      const seriesMap = new Map((seriesRes.data as any[]).map((s: any) => [s.id, s]));

      // 5) Compose final items in original order
      const items = featuredRows
        .map((row: any) => {
          const item = row.item_type === 'movie' ? movieMap.get(row.item_id) : seriesMap.get(row.item_id);
          if (!item) return null; // Skip invalid refs
          const dateField = row.item_type === 'movie' ? 'release_date' : 'first_air_date';

          const backdropUrl = item.backdrop_path?.startsWith('http')
            ? item.backdrop_path
            : item.backdrop_path
              ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
              : item.poster_path?.startsWith('http')
                ? item.poster_path
                : item.poster_path
                  ? `https://image.tmdb.org/t/p/original${item.poster_path}`
                  : '/placeholder.svg';

          return {
            id: item.id,
            slug: item.slug,
            title: item.title,
            description: item.overview || 'Sin descripción disponible',
            backdropUrl,
            rating: item.rating || 0,
            year: item[dateField] ? new Date(item[dateField]).getFullYear() : 'Sin fecha',
            genre: Array.isArray(item.genres) ? item.genres.join(', ') : 'Sin género',
            type: row.item_type,
          };
        })
        .filter(Boolean);

      return items as any[];
    }
  });

  // Use featured items from database, or fallback to static items
  const featuredItems = featuredItemsData.length > 0 ? featuredItemsData : fallbackItems;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [featuredItems.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredItems.length) % featuredItems.length);
  };

  if (featuredItems.length === 0) {
    return (
      <div className="h-[70vh] bg-cuevana-gray-100 flex items-center justify-center">
        <p className="text-cuevana-white text-lg">No hay contenido destacado configurado</p>
      </div>
    );
  }

  const currentItem = featuredItems[currentSlide];
  const getLinkPath = (): string => {
    if (featuredItemsData.length === 0) {
      return currentItem.type === 'movie' ? '/movies' : '/series';
    }
    const item: any = currentItem as any;
    return currentItem.type === 'movie'
      ? `/movie/${item.slug || item.id}`
      : `/series/${(item.slug && item.slug.trim() !== '') ? item.slug : item.id}`;
  };
  const linkPath = getLinkPath();

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={currentItem.backdropUrl} 
          alt={currentItem.title} 
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cuevana-bg/90 via-cuevana-bg/60 to-cuevana-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
        <div className="max-w-2xl">
          {/* Content Type Badge */}
          <span className="inline-block bg-cuevana-gold/20 text-cuevana-gold px-3 py-1 rounded-full text-sm font-semibold mb-4">
            {currentItem.type === 'movie' ? '🎬 Película' : '📺 Serie'}
          </span>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cuevana-white">
            {currentItem.title}
          </h1>
          
          <div className="flex items-center mb-4 space-x-4">
            <span className="bg-cuevana-blue px-3 py-1 rounded text-sm font-semibold text-white">
              {currentItem.rating} ★
            </span>
            <span className="text-cuevana-gold text-sm font-medium">{currentItem.year}</span>
            <span className="text-cuevana-white/80 text-sm">{currentItem.genre}</span>
          </div>
          
          <p className="text-cuevana-white/90 mb-8 text-lg leading-relaxed line-clamp-3">
            {currentItem.description}
          </p>
          
          <div className="flex space-x-4">
            <Link to={linkPath}>
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white flex items-center gap-2 px-8 py-3 text-lg">
                <Play className="h-5 w-5" /> Ver Ahora
              </Button>
            </Link>
            <Link to={linkPath}>
              <Button 
                variant="outline" 
                className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10 flex items-center gap-2 px-8 py-3 text-lg"
              >
                <Info className="h-5 w-5" /> Más Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-cuevana-bg/50 hover:bg-cuevana-bg/70 text-cuevana-white rounded-full p-3 transition-all"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-cuevana-bg/50 hover:bg-cuevana-bg/70 text-cuevana-white rounded-full p-3 transition-all"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-cuevana-blue' : 'bg-cuevana-white/30'
            }`}
          />
        ))}
      </div>

      {/* Admin Notice */}
      {featuredItemsData.length === 0 && (
        <div className="absolute top-4 right-4 bg-yellow-600/80 text-white text-xs px-3 py-1 rounded">
          Usando contenido por defecto - Configura en Admin
        </div>
      )}
    </div>
  );
};

export default FeaturedCarouselUnified;