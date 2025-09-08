
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { fetchMovies } from '@/services/movieService';
import { fetchSeries } from '@/services/seriesService';

const Genres = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: movies = [], refetch: refetchMovies } = useQuery({
    queryKey: ['movies'],
    queryFn: () => fetchMovies(''),
    staleTime: 0, // Always refetch
  });

  const { data: series = [], refetch: refetchSeries } = useQuery({
    queryKey: ['series'],
    queryFn: () => fetchSeries(''),
    staleTime: 0, // Always refetch
  });

  // Refresh data when component mounts or becomes visible
  React.useEffect(() => {
    refetchMovies();
    refetchSeries();
  }, [refetchMovies, refetchSeries]);

  // Combine all genres from movies and series
  const allGenres = React.useMemo(() => {
    const genreMap = new Map<string, { name: string; movieCount: number; seriesCount: number; icon: string }>();
    
    // Count movie genres
    movies.forEach(movie => {
      if (movie.genres) {
        movie.genres.forEach(genre => {
          const existing = genreMap.get(genre) || { name: genre, movieCount: 0, seriesCount: 0, icon: '🎬' };
          existing.movieCount++;
          genreMap.set(genre, existing);
        });
      }
    });

    // Count series genres
    series.forEach(serie => {
      if (serie.genres) {
        serie.genres.forEach(genre => {
          const existing = genreMap.get(genre) || { name: genre, movieCount: 0, seriesCount: 0, icon: '📺' };
          existing.seriesCount++;
          genreMap.set(genre, existing);
        });
      }
    });

    // Convert to array and add icons
    const genreIcons: { [key: string]: string } = {
      'Acción': '💥',
      'Aventura': '🗺️',
      'Comedia': '😂',
      'Drama': '🎭',
      'Horror': '👻',
      'Romance': '💕',
      'Ciencia Ficción': '🚀',
      'Suspenso': '🔍',
      'Animación': '🎨',
      'Fantasía': '🦄',
      'Crimen': '🔫',
      'Documental': '📹',
      'Familia': '👨‍👩‍👧‍👦',
      'Música': '🎵',
      'Misterio': '🕵️',
      'Bélica': '⚔️',
      'Western': '🤠',
      'Historia': '📚'
    };

    return Array.from(genreMap.entries()).map(([name, data]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      icon: genreIcons[name] || '🎬',
      movieCount: data.movieCount,
      seriesCount: data.seriesCount,
      totalCount: data.movieCount + data.seriesCount
    })).sort((a, b) => b.totalCount - a.totalCount);
  }, [movies, series]);

  const handleGenreClick = (genreName: string) => {
    // Navigate to genre-specific page
    navigate(`/genre/${encodeURIComponent(genreName)}`);
  };

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Géneros</h1>
          <p className="text-cuevana-white/80 text-lg">Explora películas y series por categoría</p>
        </div>

        {allGenres.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allGenres.map((genre, index) => (
              <div 
                key={`${genre.id}-${index}`} 
                className="group cursor-pointer"
                onClick={() => handleGenreClick(genre.name)}
              >
                <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200 hover:border-cuevana-blue transition-all duration-300 hover:bg-cuevana-gray-200">
                  <div className="text-center">
                    <div className="text-4xl mb-3">{genre.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-cuevana-blue transition-colors">
                      {genre.name}
                    </h3>
                    <div className="text-cuevana-white/70 text-sm space-y-1">
                      {genre.movieCount > 0 && (
                        <p>{genre.movieCount} película{genre.movieCount !== 1 ? 's' : ''}</p>
                      )}
                      {genre.seriesCount > 0 && (
                        <p>{genre.seriesCount} serie{genre.seriesCount !== 1 ? 's' : ''}</p>
                      )}
                      {genre.totalCount === 0 && (
                        <p>Sin contenido</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No hay géneros disponibles</h2>
            <p className="text-cuevana-white/70">Aún no hay contenido categorizado por géneros.</p>
          </div>
        )}

        {/* Featured Genre Section */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-cuevana-blue to-cuevana-blue/80 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-lg mb-6 opacity-90">
              Usa nuestro buscador para encontrar exactamente lo que quieres ver
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/movies">
                <Button className="bg-white text-cuevana-blue hover:bg-gray-100 font-semibold px-8 py-3">
                  Explorar Películas
                </Button>
              </Link>
              <Link to="/series">
                <Button className="bg-white text-cuevana-blue hover:bg-gray-100 font-semibold px-8 py-3">
                  Explorar Series
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Genres;
