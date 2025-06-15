
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

const MAX_OVERVIEW_LEN = 120;

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

  // Handle both TMDB and OMDb poster URLs
  const posterUrl = movie.poster_path 
    ? (movie.poster_path.startsWith('http') 
        ? movie.poster_path  // OMDb URL (full URL)
        : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) // TMDB path
    : '/placeholder.svg';

  // Use the slug from database if available, otherwise generate one
  const year = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined;
  const movieSlug = movie.slug && movie.slug.trim() !== '' ? movie.slug : generateSlug(movie.title, year);

  // Info for the hover card
  const rating = movie.rating ?? null;
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${(movie.runtime % 60).toString().padStart(2, '0')}min`
    : null;
  const mainGenres = Array.isArray(movie.genres) && movie.genres.length ? movie.genres.join(', ') : null;
  const mainActors = Array.isArray(movie.actors) && movie.actors.length ? movie.actors.slice(0, 3).join(', ') : null;
  const overview = movie.overview
    ? movie.overview.length > MAX_OVERVIEW_LEN
      ? `${movie.overview.slice(0, MAX_OVERVIEW_LEN)}...`
      : movie.overview
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster & hover overlays */}
      <Link to={`/movie/${movieSlug}`}>
        <Card className="overflow-hidden bg-cuevana-gray-100 border-cuevana-gray-200 transition-all duration-300 hover:scale-105">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {/* Play button and info hover effect: desktop only */}
            {isHovered && (
              <>
                {/* Cristal info card */}
                <div className="hidden md:block absolute z-20 top-1/2 left-1/2 w-[90%] -translate-x-1/2 -translate-y-1/2 animate-fade-in">
                  <div
                    className="
                      rounded-xl
                      px-6 py-4
                      bg-white/18
                      backdrop-blur-xl
                      border border-white/25
                      shadow-2xl
                      ring-1 ring-white/20
                      text-left
                      text-cuevana-white
                      max-h-[85%]
                    "
                  >
                    <h4 className="font-bold text-lg mb-1 leading-tight">{movie.title}</h4>
                    <div className="flex items-baseline gap-2 mb-1">
                      {rating && (
                        <span className="text-yellow-400 font-semibold text-base">
                          {rating}/10
                        </span>
                      )}
                      {runtime && <span className="text-xs text-cuevana-white/70 mx-1">{runtime}</span>}
                      {year && <span className="text-xs text-cuevana-white/70">{year}</span>}
                    </div>
                    {overview && (
                      <div className="text-[13px] text-cuevana-white/90 mb-2 line-clamp-3">{overview}</div>
                    )}
                    {mainGenres && (
                      <div className="text-xs mb-1">
                        <span className="font-semibold text-cuevana-white/90">Género: </span>
                        <span className="text-cuevana-white/70">{mainGenres}</span>
                      </div>
                    )}
                    {mainActors && (
                      <div className="text-xs">
                        <span className="font-semibold text-cuevana-white/90">Actores: </span>
                        <span className="text-cuevana-white/70">{mainActors}{movie.actors && movie.actors.length > 3 && ' ...'}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Play button (crystal/glass effect, remain centered & in front) */}
                <div className="absolute z-30 inset-0 flex items-center justify-center pointer-events-none">
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
                    ring-2
                    ring-white/30
                    animate-fade-in
                  ">
                    <Play className="h-8 w-8 text-cuevana-blue drop-shadow" />
                  </div>
                </div>
                {/* Darken layer on hover (background) */}
                <div className="absolute inset-0 bg-cuevana-bg/70 z-10 pointer-events-none" />
              </>
            )}
            {/* Rating badge */}
            {movie.rating && (
              <div className="absolute top-2 left-2 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-2 py-1 rounded flex items-center z-40">
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
