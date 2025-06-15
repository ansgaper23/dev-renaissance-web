import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Play, ChevronRight } from 'lucide-react';
import { Movie, generateSlug } from '@/services/movieService';

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  isLoading: boolean;
  viewAllLink?: string;
}

const MovieSection = ({ title, movies, isLoading, viewAllLink }: MovieSectionProps) => {
  if (isLoading) {
    return (
      <section className="px-4 md:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-cuevana-white">{title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-cuevana-gray-100 aspect-[2/3] rounded-lg mb-2"></div>
              <div className="bg-cuevana-gray-100 h-4 rounded mb-1"></div>
              <div className="bg-cuevana-gray-100 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="px-4 md:px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-cuevana-white">{title}</h2>
        {viewAllLink && (
          <Link 
            to={viewAllLink}
            className="flex items-center text-cuevana-blue hover:text-cuevana-blue/80 transition-colors text-sm font-medium"
          >
            Ver todo <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
};

const MovieCard = ({ movie }: { movie: Movie }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const posterUrl = movie.poster_path 
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : '/placeholder.svg';

  // Use the slug from database if available, otherwise generate one
  const year = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined;
  const movieSlug = movie.slug && movie.slug.trim() !== '' ? movie.slug : generateSlug(movie.title, year);

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/movie/${movieSlug}`}>
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
                <div className="
                  rounded-full
                  p-4
                  flex
                  items-center
                  justify-center
                  backdrop-blur-md
                  bg-white/20
                  border
                  border-white/30
                  shadow-xl
                  transition-all
                  ring-2
                  ring-white/30
                  hover:ring-cuevana-blue
                  animate-fade-in
                ">
                  <Play className="h-8 w-8 text-cuevana-blue drop-shadow" />
                </div>
              </div>
            )}
            {/* Rating badge */}
            {movie.rating && movie.rating > 0 && (
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
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Sin año'}
              </span>
              {movie.genres && movie.genres.length > 0 && (
                <span className="text-xs text-cuevana-white/50">
                  {movie.genres[0]}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default MovieSection;
