import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchSeriesById, fetchSeriesBySlug } from '@/services/seriesService';
import { Star, Calendar, Clock, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SeriesVideoPlayer from '@/components/SeriesVideoPlayer';
import SeriesEpisodeSelector from '@/components/SeriesEpisodeSelector';
import SEOHead from '@/components/SEOHead';
import AdInjector from '@/components/AdInjector';
import ShareButton from '@/components/ShareButton';
import SeriesSection from '@/components/SeriesSection';
import { recordSeriesView, fetchRelatedSeries } from '@/services/viewsService';
import { useSettings } from '@/hooks/useSettings';

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const { data: settings } = useSettings();
  const playerRef = useRef<HTMLDivElement>(null);

  const handleEpisodeSelect = (episode: number) => {
    setSelectedEpisode(episode);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const isUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data: series, isLoading, error } = useQuery({
    queryKey: ['series', id],
    queryFn: () => {
      if (!id) throw new Error('No series ID provided');
      return isUUID ? fetchSeriesById(id) : fetchSeriesBySlug(id);
    },
    enabled: !!id,
  });

  const { data: relatedSeries = [] } = useQuery({
    queryKey: ['relatedSeries', id, series?.genres],
    queryFn: () => fetchRelatedSeries(series!.id, series?.genres || []),
    enabled: !!series?.id,
  });

  useEffect(() => {
    if (series?.id) recordSeriesView(series.id);
  }, [series?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">Cargando...</div>
        <Footer />
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Error al cargar la serie</h1>
          <p className="text-cuevana-white/70">{error?.message || 'No se pudo encontrar la serie'}</p>
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

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      <SEOHead title={series.title} description={series.overview || `Mira ${series.title} online gratis`} image={posterUrl} type="series" siteName={settings?.site_name} logoUrl={settings?.logo_url} />
      <AdInjector scope="playback" />

      {/* Hero Banner */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={backdropUrl} alt={series.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-cuevana-bg/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cuevana-bg/80 via-transparent to-transparent" />
      </div>

      {/* Content overlapping banner */}
      <div className="container mx-auto px-4 -mt-[35vh] md:-mt-[40vh] relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img src={posterUrl} alt={series.title} className="w-40 md:w-52 h-auto rounded-lg shadow-2xl border-2 border-white/10" />
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 md:pt-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">{series.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm md:text-base">
              {series.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">{series.rating}/10</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-cuevana-blue" />
                <span>{firstAirYear}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-cuevana-blue" />
                <span>{series.number_of_seasons} temporadas</span>
              </div>
              <div className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-cuevana-blue" />
                <span>{genres}</span>
              </div>
            </div>

            {series.overview && (
              <p className="text-cuevana-white/90 text-sm md:text-base leading-relaxed mb-4 max-w-3xl">{series.overview}</p>
            )}

            <div className="flex items-center gap-2">
              <ShareButton title={series.title} />
            </div>
          </div>
        </div>

        {/* Video Player with language tabs */}
        <div ref={playerRef} className="mt-8 mb-6 scroll-mt-20">
          <SeriesVideoPlayer series={series} selectedSeason={selectedSeason} selectedEpisode={selectedEpisode} onSeasonChange={setSelectedSeason} onEpisodeChange={handleEpisodeSelect} />
        </div>

        {/* Episode Selector (below player) */}
        <div className="mb-8">
          <SeriesEpisodeSelector series={series} selectedSeason={selectedSeason} selectedEpisode={selectedEpisode} onSeasonChange={setSelectedSeason} onEpisodeChange={handleEpisodeSelect} />
        </div>

        {/* Related Series */}
        {relatedSeries.length > 0 && (
          <div className="mt-16">
            <SeriesSection title="Series Relacionadas" series={relatedSeries} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SeriesDetail;
