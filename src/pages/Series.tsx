
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Play, Calendar, Star } from 'lucide-react';
import { fetchSeries } from '@/services/seriesService';

const Series = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');

  const { data: series, isLoading } = useQuery({
    queryKey: ['series', currentSearchTerm],
    queryFn: () => fetchSeries(currentSearchTerm),
  });

  const handleSearch = () => {
    setCurrentSearchTerm(searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">Todas las Series</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cuevana-white/60" size={20} />
              <Input
                placeholder="Buscar series..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-cuevana-gray-100 border-cuevana-gray-300 text-cuevana-white placeholder-cuevana-white/60"
              />
            </div>
            <Button 
              onClick={handleSearch}
              className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white"
            >
              Buscar
            </Button>
            <Button variant="outline" className="border-cuevana-gray-300 text-cuevana-white hover:bg-cuevana-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {/* Series Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-cuevana-gray-100 rounded-lg aspect-[2/3] mb-3"></div>
                <div className="h-4 bg-cuevana-gray-100 rounded mb-2"></div>
                <div className="h-3 bg-cuevana-gray-100 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : series && series.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {series.map((serie) => {
              const posterUrl = serie.poster_path?.startsWith('http') 
                ? serie.poster_path 
                : serie.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
                  : '/placeholder.svg';

              const releaseYear = serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 'N/A';
              const genres = Array.isArray(serie.genres) ? serie.genres.slice(0, 2).join(', ') : 'Sin género';

              return (
                <div key={serie.id} className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg bg-cuevana-gray-100 aspect-[2/3] mb-3">
                    <img 
                      src={posterUrl} 
                      alt={serie.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button size="sm" className="bg-cuevana-blue hover:bg-cuevana-blue/90">
                        <Play className="h-4 w-4 mr-2" />
                        Ver Serie
                      </Button>
                    </div>
                    {serie.rating && (
                      <div className="absolute top-2 right-2 bg-cuevana-blue px-2 py-1 rounded text-xs font-semibold">
                        <Star className="h-3 w-3 inline mr-1" />
                        {serie.rating}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-cuevana-white group-hover:text-cuevana-blue transition-colors truncate">
                    {serie.title}
                  </h3>
                  <div className="flex items-center text-cuevana-white/70 text-sm mt-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{releaseYear}</span>
                    <span className="mx-2">•</span>
                    <span className="truncate">{genres}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">No se encontraron series</h2>
            <p className="text-cuevana-white/70 mb-6">
              {currentSearchTerm 
                ? `No hay series que coincidan con "${currentSearchTerm}"`
                : 'Aún no hay series disponibles. ¡Vuelve pronto!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series;
