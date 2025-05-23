
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
  genre?: string;
}

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
}

const MovieSection = ({ title, movies, viewAllLink }: MovieSectionProps) => {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white">{title}</h2>
          {viewAllLink && (
            <Link 
              to={viewAllLink}
              className="text-cuevana-blue hover:text-cuevana-gold transition-colors font-medium"
            >
              Ver todas →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </section>
  );
};

const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <Link to={`/movie/${movie.id}`} className="group">
      <Card className="bg-cuevana-gray-100 border-cuevana-gray-200 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-cuevana-bg/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-cuevana-blue/90 rounded-full p-3 mb-2">
                <Play className="h-6 w-6 text-white" />
              </div>
              <p className="text-cuevana-white text-sm font-medium">Ver Ahora</p>
            </div>
          </div>
          
          {/* Rating badge */}
          <div className="absolute top-2 left-2 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-2 py-1 rounded flex items-center">
            <Star className="h-3 w-3 mr-1 fill-current" />
            {movie.rating}
          </div>
        </div>
        
        <CardContent className="p-3">
          <h3 className="text-cuevana-white font-medium text-sm line-clamp-2 mb-1">
            {movie.title}
          </h3>
          <div className="flex justify-between items-center text-xs">
            <span className="text-cuevana-white/70">{movie.year}</span>
            {movie.genre && (
              <span className="text-cuevana-blue text-xs">{movie.genre}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MovieSection;
