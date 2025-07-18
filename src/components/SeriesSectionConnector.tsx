
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSeries, fetchSeriesByRating, fetchSeriesByAirDate } from '@/services/seriesService';
import SeriesSection from './SeriesSection';

interface SeriesSectionConnectorProps {
  title: string;
  limit?: number;
  sortBy?: 'created_at' | 'rating' | 'first_air_date';
  viewAllLink?: string;
}

const SeriesSectionConnector = ({ 
  title, 
  limit = 6, 
  sortBy = 'created_at',
  viewAllLink 
}: SeriesSectionConnectorProps) => {
  const queryFn = () => {
    switch (sortBy) {
      case 'rating':
        return fetchSeriesByRating(limit);
      case 'first_air_date':
        return fetchSeriesByAirDate(limit);
      default:
        return fetchSeries('').then(series => series.slice(0, limit));
    }
  };

  const { data: sortedSeries = [], isLoading } = useQuery({
    queryKey: ['series', sortBy, limit],
    queryFn,
  });

  return (
    <SeriesSection 
      title={title}
      series={sortedSeries}
      isLoading={isLoading}
      viewAllLink={viewAllLink}
    />
  );
};

export default SeriesSectionConnector;
