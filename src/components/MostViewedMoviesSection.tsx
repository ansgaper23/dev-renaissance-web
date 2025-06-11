
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMostViewedMovies } from '@/services/movieService';
import MovieSection from './MovieSection';
import { Loader2 } from 'lucide-react';

interface MostViewedMoviesSectionProps {
  title: string;
  viewAllLink?: string;
  limit?: number;
}

const MostViewedMoviesSection = ({ title, viewAllLink, limit = 6 }: MostViewedMoviesSectionProps) => {
  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['mostViewedMovies', limit],
    queryFn: fetchMostViewedMovies,
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white mb-6">{title}</h2>
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cuevana-blue" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !movies) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white mb-6">{title}</h2>
          <div className="text-center py-20 text-cuevana-white/70">
            No se pudieron cargar las películas más vistas
          </div>
        </div>
      </section>
    );
  }

  // Transformar los datos para que coincidan con la interfaz del MovieSection
  const transformedMovies = movies.slice(0, limit).map(movie => ({
    id: movie.id,
    title: movie.title,
    posterUrl: movie.poster_path ? 
      (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : 
      '/placeholder.svg',
    rating: movie.rating || 0,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
    genre: (movie.genres && movie.genres.length > 0) ? movie.genres[0] : null,
    // Mantener datos originales para el slug
    release_date: movie.release_date,
    poster_path: movie.poster_path
  }));

  return (
    <MovieSection 
      title={title}
      movies={transformedMovies}
      isLoading={false}
      viewAllLink={viewAllLink}
    />
  );
};

export default MostViewedMoviesSection;
