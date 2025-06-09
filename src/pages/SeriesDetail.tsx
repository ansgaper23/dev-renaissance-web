
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSeriesById } from '@/services/seriesService';
import { Play, Star, Calendar, Clock, Tag, Heart, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SeriesVideoPlayer from '@/components/SeriesVideoPlayer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import SeriesSection from '@/components/SeriesSection';
import { recordSeriesView, fetchRelatedSeries } from '@/services/viewsService';

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const { data: series, isLoading, error } = useQuery({
    queryKey: ['series', id],
    queryFn: () => fetchSeriesById(id!),
    enabled: !!id,
  });

  // Query para series relacionadas
  const { data: relatedSeries = [] } = useQuery({
    queryKey: ['relatedSeries', id, series?.genres],
    queryFn: () => fetchRelatedSeries(id!, series?.genres || []),
    enabled: !!id && !!series,
  });

  // Registrar vista cuando se carga la serie
  useEffect(() => {
    if (series?.id) {
      recordSeriesView(series.id);
    }
  }, [series?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          Cargando...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          Error al cargar la serie
        </div>
        <Footer />
      </div>
    );
  }

  const posterUrl = series.poster_path?.startsWith('http') 
    ? series.poster_path 
    : series.poster_path 
      ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
      : '/placeholder.svg';

  const backdropUrl = series.backdrop_path?.startsWith('http')
    ? series.backdrop_path
    : series.backdrop_path
      ? `https://image.tmdb.org/t/p/original${series.backdrop_path}`
      : posterUrl;

  const firstAirYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Sin fecha';
  const genres = Array.isArray(series.genres) ? series.genres.join(', ') : 'Sin género';

  // Obtener la temporada actual
  const currentSeason = Array.isArray(series.seasons) 
    ? series.seasons.find((season: any) => season.season_number === selectedSeason)
    : null;

  const scrollToEpisodes = () => {
    const episodesSection = document.getElementById('episodes-section');
    if (episodesSection) {
      episodesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Transformar series relacionadas para SeriesSection
  const transformedRelatedSeries = relatedSeries.map(relatedSeriesItem => ({
    id: relatedSeriesItem.id,
    title: relatedSeriesItem.title,
    posterUrl: relatedSeriesItem.poster_path ? 
      (relatedSeriesItem.poster_path.startsWith('http') ? relatedSeriesItem.poster_path : `https://image.tmdb.org/t/p/w500${relatedSeriesItem.poster_path}`) : 
      '/placeholder.svg',
    rating: relatedSeriesItem.rating || 0,
    year: relatedSeriesItem.first_air_date ? new Date(relatedSeriesItem.first_air_date).getFullYear() : new Date().getFullYear(),
    genre: relatedSeriesItem.genres ? relatedSeriesItem.genres[0] : 'Sin género',
    numberOfSeasons: relatedSeriesItem.number_of_seasons || 1,
    numberOfEpisodes: relatedSeriesItem.number_of_episodes || 0,
    status: relatedSeriesItem.status || 'Finalizada'
  }));

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      <SEOHead 
        title={series.title}
        description={series.overview || `Mira ${series.title} online gratis`}
        image={posterUrl}
        type="series"
      />
      
      <div className="relative">
        {/* Backdrop */}
        <div className="relative h-[60vh] overflow-hidden">
          <img 
            src={backdropUrl}
            alt={series.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-cuevana-bg/60 to-transparent" />
        </div>

        {/* Series Info */}
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img 
                src={posterUrl}
                alt={series.title}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Details */}
            <div className="flex-1 lg:ml-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{series.title}</h1>
              
              {/* Sinopsis debajo del título */}
              {series.overview && (
                <p className="text-cuevana-white/90 text-lg leading-relaxed mb-6">
                  {series.overview}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 mb-6">
                {series.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-cuevana-gold fill-current" />
                    <span className="text-lg font-semibold">{series.rating}/10</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cuevana-blue" />
                  <span>{firstAirYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-cuevana-blue" />
                  <span>{series.number_of_seasons} temporadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-cuevana-blue" />
                  <span>{genres}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button 
                  onClick={scrollToEpisodes}
                  className="bg-cuevana-blue hover:bg-cuevana-blue/90 flex items-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  Ver Episodios
                </Button>
                <ShareButton 
                  title={series.title}
                />
                <Button variant="outline" className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10">
                  <Heart className="h-5 w-5 mr-2" />
                  Favoritos
                </Button>
              </div>
            </div>
          </div>

          {/* Episodes Section */}
          <div id="episodes-section" className="mt-12">
            <SeriesVideoPlayer 
              series={series}
              selectedSeason={selectedSeason}
              selectedEpisode={selectedEpisode}
              onSeasonChange={setSelectedSeason}
              onEpisodeChange={setSelectedEpisode}
            />
          </div>

          {/* Related Series */}
          {transformedRelatedSeries.length > 0 && (
            <div className="mt-16">
              <SeriesSection 
                title="Series Relacionadas"
                series={transformedRelatedSeries}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SeriesDetail;
