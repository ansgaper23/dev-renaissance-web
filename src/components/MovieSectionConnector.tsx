
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '@/services/movieService';
import MovieSection from './MovieSection';
import { Loader2 } from 'lucide-react';

interface MovieSectionConnectorProps {
  title: string;
  viewAllLink?: string;
  limit?: number;
  sortBy?: 'created_at' | 'rating' | 'release_date';
}

const MovieSectionConnector = ({ title, viewAllLink, limit = 6, sortBy = 'created_at' }: MovieSectionConnectorProps) => {
  const { data: movies, isLoading, error } = useQuery({
    queryKey: ['movies', sortBy, limit],
    queryFn: () => fetchMovies(''),
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
  // CORREGIDO: Usar el ID real de la base de datos (UUID) en lugar de convertir a número
  const transformedMovies = movies.slice(0, limit).map(movie => ({
    id: movie.id, // Usar el ID UUID real
    title: movie.title,
    posterUrl: movie.poster_path ? 
      (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) : 
      '/placeholder.svg',
    rating: movie.rating || 0,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : new Date().getFullYear(),
    genre: movie.genres ? movie.genres[0] : 'Sin género'
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
