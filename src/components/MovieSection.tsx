
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface Movie {
  id: string | number; // Permitir tanto string (UUID) como number para compatibilidad
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
  genre: string;
}

interface MovieSectionProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
}

const MovieSection = ({ title, movies, viewAllLink }: MovieSectionProps) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white">{title}</h2>
          {viewAllLink && (
            <Link to={viewAllLink}>
              <Button variant="outline" className="border-cuevana-blue text-cuevana-blue hover:bg-cuevana-blue hover:text-white">
                Ver todas
              </Button>
            </Link>
          )}
        </div>

        <div className="relative group">
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-r-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => (
              <Link 
                key={movie.id} 
                to={`/movie/${movie.id}`} // Usar el ID real (UUID o número)
                className="flex-shrink-0 group cursor-pointer"
              >
                <div className="w-48 transform transition-transform group-hover:scale-105">
                  <div className="relative">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-72 object-cover rounded-lg shadow-lg"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 text-white">
                        <Star className="h-4 w-4 text-cuevana-gold fill-current" />
                        <span className="text-sm">{movie.rating}/10</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <h3 className="text-cuevana-white font-medium text-sm line-clamp-2 mb-1">
                      {movie.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-cuevana-white/70">
                      <span>{movie.year}</span>
                      <span>{movie.genre}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MovieSection;
