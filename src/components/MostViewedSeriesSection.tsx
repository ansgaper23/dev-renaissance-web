import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMostViewedSeries } from '@/services/viewsService';
import SeriesSection from './SeriesSection';
import { Loader2 } from 'lucide-react';

interface MostViewedSeriesSectionProps {
  title: string;
  viewAllLink?: string;
  limit?: number;
}

const MostViewedSeriesSection = ({ title, viewAllLink, limit = 6 }: MostViewedSeriesSectionProps) => {
  const { data: series, isLoading, error } = useQuery({
    queryKey: ['mostViewedSeries', limit],
    queryFn: fetchMostViewedSeries,
  });

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white mb-6">{title}</h2>
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cuevana-blue" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !series) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-cuevana-white mb-6">{title}</h2>
          <div className="text-center py-20 text-cuevana-white/70">
            No se pudieron cargar las series más vistas
          </div>
        </div>
      </section>
    );
  }

  // Ensure series is an array and slice it properly
  const seriesArray = Array.isArray(series) ? series : [];
  const limitedSeries = seriesArray.slice(0, limit);

  // Transform to SeriesSection format
  const transformedSeries = limitedSeries.map(seriesItem => ({
    id: seriesItem.id,
    title: seriesItem.title,
    posterUrl: seriesItem.poster_path ? 
      (seriesItem.poster_path.startsWith('http') ? seriesItem.poster_path : `https://image.tmdb.org/t/p/w500${seriesItem.poster_path}`) : 
      '/placeholder.svg',
    rating: seriesItem.rating || 0,
    year: seriesItem.first_air_date ? new Date(seriesItem.first_air_date).getFullYear() : new Date().getFullYear(),
    genre: seriesItem.genres ? seriesItem.genres[0] : 'Sin género',
    numberOfSeasons: seriesItem.number_of_seasons || 1,
    numberOfEpisodes: seriesItem.number_of_episodes || 0,
    status: seriesItem.status || 'Finalizada'
  }));

  return (
    <SeriesSection 
      title={title}
      series={transformedSeries}
      isLoading={false}
      viewAllLink={viewAllLink}
    />
  );
};

export default MostViewedSeriesSection;