
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Star, ArrowRight } from 'lucide-react';
import { Series } from '@/services/seriesService';

interface SeriesSectionProps {
  title: string;
  series: Series[];
  isLoading?: boolean;
  viewAllLink?: string;
}

const SeriesSection = ({ title, series, isLoading, viewAllLink }: SeriesSectionProps) => {
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-cuevana-gray-100 rounded-lg aspect-[2/3] mb-3"></div>
              <div className="h-4 bg-cuevana-gray-100 rounded mb-2"></div>
              <div className="h-3 bg-cuevana-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!series || series.length === 0) {
    return (
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white mb-6">{title}</h2>
        <div className="text-center py-8">
          <p className="text-cuevana-white/70">No hay series disponibles en esta sección.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink}>
            <Button variant="ghost" className="text-cuevana-blue hover:text-cuevana-blue/80 flex items-center gap-2">
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {series.map((serie) => {
          const posterUrl = serie.poster_path?.startsWith('http') 
            ? serie.poster_path 
            : serie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
              : '/placeholder.svg';

          const releaseYear = serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 'N/A';
          const genres = Array.isArray(serie.genres) ? serie.genres.slice(0, 2).join(', ') : 'Sin género';

          // Use slug if available, otherwise fallback to id
          const linkPath = serie.slug ? `/series/${serie.slug}` : `/series/${serie.id}`;

          return (
            <Link key={serie.id} to={linkPath} className="group">
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
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SeriesSection;
