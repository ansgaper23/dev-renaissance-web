
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Star } from 'lucide-react';
import { fetchMovies } from '@/services/movieService';
import { fetchSeries } from '@/services/seriesService';

const GenrePage = () => {
  const { genre } = useParams();
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'series'>('all');
  
  const decodedGenre = decodeURIComponent(genre || '');

  const { data: movies = [], isLoading: moviesLoading } = useQuery({
    queryKey: ['movies'],
    queryFn: () => fetchMovies(''),
  });

  const { data: series = [], isLoading: seriesLoading } = useQuery({
    queryKey: ['series'],
    queryFn: () => fetchSeries(''),
  });

  // Filter content by genre
  const filteredMovies = movies.filter(movie => 
    movie.genres && movie.genres.some(g => g.toLowerCase() === decodedGenre.toLowerCase())
  );

  const filteredSeries = series.filter(serie => 
    serie.genres && serie.genres.some(g => g.toLowerCase() === decodedGenre.toLowerCase())
  );

  const allContent = [
    ...filteredMovies.map(movie => ({ ...movie, type: 'movie' as const })),
    ...filteredSeries.map(serie => ({ ...serie, type: 'series' as const }))
  ].sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());

  const getDisplayContent = () => {
    switch (activeTab) {
      case 'movies':
        return filteredMovies.map(movie => ({ ...movie, type: 'movie' as const }));
      case 'series':
        return filteredSeries.map(serie => ({ ...serie, type: 'series' as const }));
      default:
        return allContent;
    }
  };

  const displayContent = getDisplayContent();
  const isLoading = moviesLoading || seriesLoading;

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Género: {decodedGenre}</h1>
          <p className="text-cuevana-white/80 text-lg">
            {filteredMovies.length} películas y {filteredSeries.length} series
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-cuevana-gray-100 p-1 rounded-lg w-fit">
          <Button
            onClick={() => setActiveTab('all')}
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            className={activeTab === 'all' ? 'bg-cuevana-blue text-white' : 'text-cuevana-white hover:bg-cuevana-gray-200'}
          >
            Todos ({allContent.length})
          </Button>
          <Button
            onClick={() => setActiveTab('movies')}
            variant={activeTab === 'movies' ? 'default' : 'ghost'}
            className={activeTab === 'movies' ? 'bg-cuevana-blue text-white' : 'text-cuevana-white hover:bg-cuevana-gray-200'}
          >
            Películas ({filteredMovies.length})
          </Button>
          <Button
            onClick={() => setActiveTab('series')}
            variant={activeTab === 'series' ? 'default' : 'ghost'}
            className={activeTab === 'series' ? 'bg-cuevana-blue text-white' : 'text-cuevana-white hover:bg-cuevana-gray-200'}
          >
            Series ({filteredSeries.length})
          </Button>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-cuevana-gray-100 rounded-lg aspect-[2/3] mb-3"></div>
                <div className="h-4 bg-cuevana-gray-100 rounded mb-2"></div>
                <div className="h-3 bg-cuevana-gray-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : displayContent.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayContent.map((item) => {
              const posterUrl = item.poster_path?.startsWith('http') 
                ? item.poster_path 
                : item.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : '/placeholder.svg';

              const releaseYear = item.type === 'movie' 
                ? (item.release_date ? new Date(item.release_date).getFullYear() : 'N/A')
                : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A');

              const itemGenres = Array.isArray(item.genres) ? item.genres.slice(0, 2).join(', ') : 'Sin género';
              const detailPath = item.type === 'movie' ? `/movie/${item.id}` : `/series/${item.id}`;

              return (
                <Link key={`${item.type}-${item.id}`} to={detailPath} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-cuevana-gray-100 aspect-[2/3] mb-3">
                    <img 
                      src={posterUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button size="sm" className="bg-cuevana-blue hover:bg-cuevana-blue/90">
                        <Play className="h-4 w-4 mr-2" />
                        Ver {item.type === 'movie' ? 'Película' : 'Serie'}
                      </Button>
                    </div>
                    {item.rating && (
                      <div className="absolute top-2 right-2 bg-cuevana-blue px-2 py-1 rounded text-xs font-semibold">
                        <Star className="h-3 w-3 inline mr-1" />
                        {item.rating}
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-cuevana-gray-100 px-2 py-1 rounded text-xs font-semibold">
                      {item.type === 'movie' ? '🎬' : '📺'}
                    </div>
                  </div>
                  <h3 className="font-semibold text-cuevana-white group-hover:text-cuevana-blue transition-colors truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center text-cuevana-white/70 text-sm mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{releaseYear}</span>
                    <span className="mx-2">•</span>
                    <span className="truncate">{itemGenres}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No se encontró contenido</h2>
            <p className="text-cuevana-white/70 mb-6">
              No hay películas ni series en el género "{decodedGenre}"
            </p>
            <Link to="/genres">
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90">
                Ver todos los géneros
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenrePage;
