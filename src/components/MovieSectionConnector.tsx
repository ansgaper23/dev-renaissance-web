
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies, fetchMoviesByRating, fetchMoviesByReleaseDate } from '@/services/movieService';
import MovieSection from './MovieSection';
import { Loader2 } from 'lucide-react';

interface MovieSectionConnectorProps {
  title: string;
  viewAllLink?: string;
  limit?: number;
  sortBy?: 'created_at' | 'rating' | 'release_date';
}

const MovieSectionConnector = ({ title, viewAllLink, limit = 6, sortBy = 'created_at' }: MovieSectionConnectorProps) => {
  const queryFn = () => {
    switch (sortBy) {
      case 'rating':
        return fetchMoviesByRating(limit);
      case 'release_date':
        return fetchMoviesByReleaseDate(limit);
      default:
        return fetchMovies('').then(movies => movies.slice(0, limit));
    }
  };

  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['movies', sortBy, limit],
    queryFn,
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
            No se pudieron cargar las películas
          </div>
        </div>
      </section>
    );
  }

  // Transformar los datos para que coincidan con la interfaz del MovieSection  
  const transformedMovies = (movies || []).map(movie => ({
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    rating: movie.rating || 0,
    release_date: movie.release_date,
    genres: movie.genres,
    slug: movie.slug
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

export default MovieSectionConnector;
