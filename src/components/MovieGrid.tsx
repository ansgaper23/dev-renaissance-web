
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { Movie, generateSlug } from '@/services/movieService';

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
}

const MovieGrid = ({ movies, isLoading }: MovieGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-cuevana-gray-100 aspect-[2/3] rounded-lg mb-2"></div>
            <div className="bg-cuevana-gray-100 h-4 rounded mb-1"></div>
            <div className="bg-cuevana-gray-100 h-3 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-cuevana-white/70 text-lg">No se encontraron películas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

const MovieCard = ({ movie }: { movie: Movie }) => {
  const [isHovered, setIsHovered] = useState(false);

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder.svg';

  // Generar slug para la URL basado en el título de la película
  const movieSlug = generateSlug(movie.title);
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
  
  // Crear slug completo con año si está disponible
  const fullSlug = releaseYear ? `${movieSlug}-${releaseYear}` : movieSlug;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/movie/${fullSlug}`}>
        <Card className="overflow-hidden bg-cuevana-gray-100 border-cuevana-gray-200 transition-all duration-300 hover:scale-105">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
            {isHovered && (
              <div className="absolute inset-0 bg-cuevana-bg/70 flex items-center justify-center">
                <div className="bg-cuevana-blue rounded-full p-3 text-white">
                  <Play className="h-6 w-6" />
                </div>
              </div>
            )}
            
            {/* Rating badge */}
            {movie.rating && (
              <div className="absolute top-2 left-2 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-2 py-1 rounded flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {movie.rating}
              </div>
            )}
          </div>
          <CardContent className="p-2 pt-3 px-0">
            <h3 className="text-sm font-medium text-cuevana-white truncate">{movie.title}</h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-cuevana-white/70">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default MovieGrid;
