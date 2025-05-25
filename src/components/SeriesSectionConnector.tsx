
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchSeries } from '@/services/seriesService';
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
  const { data: allSeries = [], isLoading } = useQuery({
    queryKey: ['series', sortBy],
    queryFn: () => fetchSeries(''),
  });

  // Sort and limit the series based on the sortBy parameter
  const sortedSeries = React.useMemo(() => {
    if (!allSeries.length) return [];
    
    let sorted = [...allSeries];
    
    switch (sortBy) {
      case 'rating':
        sorted = sorted
          .filter(serie => serie.rating && serie.rating > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'first_air_date':
        sorted = sorted
          .filter(serie => serie.first_air_date)
          .sort((a, b) => new Date(b.first_air_date!).getTime() - new Date(a.first_air_date!).getTime());
        break;
      case 'created_at':
      default:
        sorted = sorted.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
        break;
    }
    
    return sorted.slice(0, limit);
  }, [allSeries, sortBy, limit]);

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
