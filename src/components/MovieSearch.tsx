
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchAll } from '@/services/searchService';
import { Search, Loader2, Film, Tv } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => searchAll(searchTerm),
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
        <div className="absolute top-full left-0 right-0 bg-cuevana-gray-100 border border-cuevana-gray-200 rounded-lg shadow-lg mt-1 max-h-[500px] overflow-y-auto z-50">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-cuevana-blue" />
              <span className="ml-2 text-cuevana-white/70">Buscando...</span>
            </div>
          ) : results && results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  to={result.type === 'movie' ? `/movie/${result.slug || result.id}` : `/series/${result.slug || result.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-cuevana-gray-200 transition-colors group"
                  onClick={() => setIsSearching(false)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={result.poster_path ? 
                        (result.poster_path.startsWith('http') ? result.poster_path : `https://image.tmdb.org/t/p/w92${result.poster_path}`) : 
                        '/placeholder.svg'
                      }
                      alt={result.title}
                      className="w-12 h-16 rounded object-cover shadow-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-cuevana-white font-medium text-sm truncate group-hover:text-cuevana-blue transition-colors">
                        {result.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className="flex items-center gap-1 text-xs bg-cuevana-gray-200 text-cuevana-white/80"
                      >
                        {result.type === 'movie' ? (
                          <>
                            <Film size={12} />
                            <span>Película</span>
                          </>
                        ) : (
                          <>
                            <Tv size={12} />
                            <span>Serie</span>
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-cuevana-white/60">
                      <span>
                        {result.release_date 
                          ? new Date(result.release_date).getFullYear() 
                          : result.first_air_date 
                            ? new Date(result.first_air_date).getFullYear() 
                            : 'Sin fecha'}
                      </span>
                      {result.rating && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            ⭐ {result.rating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchTerm.length > 2 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-cuevana-white/70 text-sm mb-1">
                No se encontraron resultados para "{searchTerm}"
              </p>
              <p className="text-cuevana-white/50 text-xs">
                Intenta con otro término de búsqueda
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MovieSearch;
