import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { getTotalMoviesCount } from '@/services/movieService';
import { getTotalSeriesCount } from '@/services/seriesService';
import { Loader2 } from 'lucide-react';
import FeaturedContentManager from './FeaturedContentManager';
import SiteSettings from './SiteSettings';
import FixMissingGenres from './FixMissingGenres';
import FixMissingSlugs from './FixMissingSlugs';
import ManualAddMovieDialogButton from "./ManualAddMovieDialogButton";

const AdminDashboard = () => {
  const { data: totalMovies, isLoading } = useQuery({
    queryKey: ['totalMovies'],
    queryFn: getTotalMoviesCount
  });

  const { data: totalSeries, isLoading: loadingSeries } = useQuery({
    queryKey: ['totalSeries'],
    queryFn: getTotalSeriesCount
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-lg font-medium">Total Películas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Cargando...</span>
              </div>
            ) : (
              <div className="text-4xl font-bold text-brand-purple">{totalMovies}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-lg font-medium">Total Series</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSeries ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Cargando...</span>
              </div>
            ) : (
              <div className="text-4xl font-bold text-cuevana-blue">{totalSeries}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-300 text-lg font-medium">Última Actualización</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-medium">{new Date().toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Botón para agregar película manualmente */}
      <div className="flex justify-end pb-2">
        <ManualAddMovieDialogButton />
      </div>

      {/* Fix Missing Genres button */}
      <FixMissingGenres />

      {/* Fix Missing Slugs button */}
      <FixMissingSlugs />

      {/* Site Settings */}
      <SiteSettings />

      {/* Featured Content Manager */}
      <FeaturedContentManager />
    </div>
  );
};

export default AdminDashboard;
