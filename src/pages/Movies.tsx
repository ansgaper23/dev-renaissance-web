
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import MovieGrid from '@/components/MovieGrid';
import SEOHead from '@/components/SEOHead';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { fetchMovies, fetchMoviesByRating, fetchMoviesByReleaseDate } from '@/services/movieService';
import { useSettings } from '@/hooks/useSettings';

const Movies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const { data: settings } = useSettings();
  const location = useLocation();

  // Determine which fetch function to use based on the current path
  const getQueryFunction = () => {
    switch (location.pathname) {
      case '/top-rated':
        return () => fetchMoviesByRating(50); // Get more movies for this page
      case '/recent':
        return () => fetchMoviesByReleaseDate(50); // Get more movies for this page
      default:
        return () => fetchMovies(currentSearchTerm);
    }
  };

  // Get page title and description based on route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/top-rated':
        return {
          title: 'Mejor Calificadas',
          description: 'Las películas mejor calificadas según TMDB',
          seoTitle: 'Películas Mejor Calificadas - Top Rating'
        };
      case '/recent':
        return {
          title: 'Estrenos Recientes',
          description: 'Los estrenos más recientes del cine',
          seoTitle: 'Estrenos Recientes - Películas Nuevas'
        };
      default:
        return {
          title: 'Todas las Películas',
          description: 'Explora nuestra colección completa de películas',
          seoTitle: 'Películas Online Gratis'
        };
    }
  };

  const pageInfo = getPageInfo();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['movies', location.pathname, currentSearchTerm],
    queryFn: getQueryFunction(),
  });

  const handleSearch = () => {
    setCurrentSearchTerm(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <SEOHead 
        title={pageInfo.seoTitle}
        description={pageInfo.description}
        siteName={settings?.site_name}
        logoUrl={settings?.logo_url}
        adsCode={settings?.ads_code}
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{pageInfo.title}</h1>
          <p className="text-cuevana-white/70 mb-6">{pageInfo.description}</p>
          
          {/* Search and Filters - Only show on main movies page */}
          {location.pathname === '/movies' && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cuevana-white/60" size={20} />
                <Input
                  placeholder="Buscar películas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 bg-cuevana-gray-100 border-cuevana-gray-300 text-cuevana-white placeholder-cuevana-white/60"
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white"
              >
                Buscar
              </Button>
              <Button variant="outline" className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          )}
        </div>

        {/* Movies Grid */}
        <MovieGrid movies={movies || []} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Movies;
