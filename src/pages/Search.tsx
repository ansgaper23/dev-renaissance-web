
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchAll } from '@/services/searchService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Film, Tv, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: results = [], isLoading, error } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query),
    enabled: !!query,
  });

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <SEOHead 
        title={`Buscar: ${query} - Cuevana3`}
        description={`Resultados de búsqueda para "${query}"`}
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Resultados para: "{query}"
          </h1>
          {!isLoading && results.length > 0 && (
            <p className="text-cuevana-white/60">
              {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
          )}
        </div>
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">Error al realizar la búsqueda</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="bg-cuevana-gray-100 border-cuevana-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-cuevana-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-cuevana-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-cuevana-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : !error && results.length === 0 && query ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cuevana-gray-100 mb-4">
              <Film className="w-8 h-8 text-cuevana-white/40" />
            </div>
            <p className="text-cuevana-white/70 text-lg mb-2">
              No se encontraron resultados para "{query}"
            </p>
            <p className="text-cuevana-white/50 text-sm">
              Intenta con otro término de búsqueda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((result) => (
              <Link
                key={`${result.type}-${result.id}`}
                to={result.type === 'movie' ? `/movie/${result.slug || result.id}` : `/series/${result.slug || result.id}`}
                className="group"
              >
                <Card className="bg-cuevana-gray-100 border-cuevana-gray-200 overflow-hidden hover:border-cuevana-blue transition-all duration-300 hover:scale-105">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={result.poster_path ? 
                        (result.poster_path.startsWith('http') ? result.poster_path : `https://image.tmdb.org/t/p/w500${result.poster_path}`) : 
                        '/placeholder.svg'
                      }
                      alt={result.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant="secondary" 
                        className="bg-black/70 text-white border-none backdrop-blur-sm flex items-center gap-1"
                      >
                        {result.type === 'movie' ? (
                          <><Film size={12} /><span className="text-xs">Película</span></>
                        ) : (
                          <><Tv size={12} /><span className="text-xs">Serie</span></>
                        )}
                      </Badge>
                    </div>
                    {result.rating && (
                      <div className="absolute top-2 left-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-yellow-500/90 text-black border-none backdrop-blur-sm flex items-center gap-1"
                        >
                          <Star size={12} fill="currentColor" />
                          <span className="text-xs font-semibold">{result.rating.toFixed(1)}</span>
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-cuevana-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-cuevana-blue transition-colors">
                      {result.title}
                    </h3>
                    <p className="text-cuevana-white/60 text-xs">
                      {result.release_date 
                        ? new Date(result.release_date).getFullYear() 
                        : result.first_air_date 
                          ? new Date(result.first_air_date).getFullYear() 
                          : 'Sin fecha'}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;
