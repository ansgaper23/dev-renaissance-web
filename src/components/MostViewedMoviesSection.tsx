
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

  // Ensure movies is an array and slice it properly
  const moviesArray = Array.isArray(movies) ? movies : [];
  const limitedMovies = moviesArray.slice(0, limit);

  return (
    <MovieSection 
      title={title}
      movies={limitedMovies}
      isLoading={false}
      viewAllLink={viewAllLink}
    />
  );
};

export default MostViewedMoviesSection;
