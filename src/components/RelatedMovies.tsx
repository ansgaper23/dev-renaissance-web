
import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
}

interface RelatedMoviesProps {
  movies: Movie[];
}

const RelatedMovies = ({ movies }: RelatedMoviesProps) => {
  return (
    <section className="py-8">
      <h3 className="text-2xl font-bold text-cuevana-white mb-6">Películas Relacionadas</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="group">
            <Card className="bg-cuevana-gray-100 border-cuevana-gray-200 overflow-hidden transition-all duration-300 group-hover:scale-105">
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Rating badge */}
                <div className="absolute top-2 left-2 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-2 py-1 rounded flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  {movie.rating}
                </div>
              </div>
              
              <CardContent className="p-3">
                <h4 className="text-cuevana-white font-medium text-sm line-clamp-2 mb-1">
                  {movie.title}
                </h4>
                <span className="text-cuevana-white/70 text-xs">{movie.year}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedMovies;
