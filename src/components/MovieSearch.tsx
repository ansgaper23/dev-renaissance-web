
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '@/services/movieService';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const { data: movies, isLoading } = useQuery({
    queryKey: ['movies', searchTerm],
    queryFn: () => fetchMovies(searchTerm),
    enabled: searchTerm.length > 2 && searchTerm.toLowerCase() !== 'ansgaper',
  });

  const handleSearch = (value: string) => {
    // Verificar si es la palabra clave para el admin
    if (value.toLowerCase() === 'ansgaper') {
      navigate('/admin/login');
      return;
    }
    
    setSearchTerm(value);
    setIsSearching(value.length > 2);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cuevana-white/60" size={20} />
        <Input
          type="text"
          placeholder="Buscar películas..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 bg-cuevana-gray-100 border-cuevana-gray-200 text-cuevana-white placeholder:text-cuevana-white/60 focus:border-cuevana-blue"
        />
      </div>

      {/* Search Results Dropdown */}
      {isSearching && searchTerm.toLowerCase() !== 'ansgaper' && (
        <div className="absolute top-full left-0 right-0 bg-cuevana-gray-100 border border-cuevana-gray-200 rounded-b-lg mt-1 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-cuevana-blue" />
              <span className="ml-2 text-cuevana-white/70">Buscando...</span>
            </div>
          ) : movies && movies.length > 0 ? (
            <div className="py-2">
              {movies.slice(0, 5).map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-cuevana-gray-200 transition-colors"
                  onClick={() => setIsSearching(false)}
                >
                  <img
                    src={movie.poster_path ? 
                      (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w92${movie.poster_path}`) : 
                      '/placeholder.svg'
                    }
                    alt={movie.title}
                    className="w-10 h-15 rounded object-cover"
                  />
                  <div>
                    <h4 className="text-cuevana-white font-medium text-sm">{movie.title}</h4>
                    <p className="text-cuevana-white/60 text-xs">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Sin fecha'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchTerm.length > 2 ? (
            <div className="px-4 py-3 text-cuevana-white/70 text-sm">
              No se encontraron resultados para "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
