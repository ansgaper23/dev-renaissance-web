import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Clock, Play, Loader2, ChevronDown, Tv, FilePlay, Tag, Heart } from 'lucide-react';
import Navbar from '@/components/Navbar';
import SeriesVideoPlayer from '@/components/SeriesVideoPlayer';
import SEOHead from '@/components/SEOHead';
import ShareButton from '@/components/ShareButton';
import { fetchSeriesById, fetchSeries } from '@/services/seriesService';
import { getSettings } from '@/services/settingsService';
import { recordSeriesView, fetchRelatedSeries } from '@/services/viewsService';

const SeriesDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  
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

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

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

  const releaseYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'Sin fecha';
  const genres = Array.isArray(series.genres) ? series.genres.join(', ') : 'Sin género';

  // Get current episode data
  const seasons = series.seasons || [];
  const currentSeason = seasons.find(s => s.season_number === selectedSeason);
  const currentEpisode = currentSeason?.episodes?.find(e => e.episode_number === selectedEpisode);
  
  // Get real related series (limit to 6)
  const realRelatedSeries = relatedSeries?.slice(0, 6).map(s => ({
    id: s.id,
    title: s.title,
    posterUrl: s.poster_path?.startsWith('http') 
      ? s.poster_path 
      : s.poster_path 
        ? `https://image.tmdb.org/t/p/w500${s.poster_path}`
        : '/placeholder.svg',
    rating: s.rating || 0,
    year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : 0
  })) || [];
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-cuevana-blue" />
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Serie no encontrada</h1>
            <Link to="/">
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <SEOHead
        title={series.title}
        description={series.overview || `Mira ${series.title} online gratis en Cuevana3`}
        image={backdropUrl}
        url={window.location.href}
        type="series"
        siteName={settings?.site_name}
        logoUrl={settings?.logo_url}
      />
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Backdrop */}
        <div className="absolute inset-0 h-[50vh]">
          <img 
            src={backdropUrl} 
            alt={series.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-cuevana-bg/60 to-cuevana-bg/20" />
        </div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 pt-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img 
                src={posterUrl} 
                alt={series.title} 
                className="w-64 mx-auto lg:mx-0 rounded-lg shadow-2xl border border-cuevana-gray-200"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 pt-16">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-cuevana-white">{series.title}</h1>
              {series.original_title && series.original_title !== series.title && (
                <p className="text-xl text-cuevana-blue mb-4 italic">{series.original_title}</p>
              )}
              
              {/* Sinopsis debajo del título */}
              {series.overview && (
                <p className="text-cuevana-white/90 mb-6 text-lg leading-relaxed max-w-4xl">
                  {series.overview}
                </p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-6">
                {series.rating && (
                  <div className="flex items-center bg-cuevana-blue px-3 py-1 rounded">
                    <Star className="h-4 w-4 text-cuevana-gold mr-1 fill-current" />
                    <span className="font-semibold">{series.rating}/10</span>
                  </div>
                )}
                <div className="flex items-center text-cuevana-white/80">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{releaseYear}</span>
                </div>
                {series.number_of_seasons && (
                  <div className="flex items-center text-cuevana-white/80">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{series.number_of_seasons} Temporada{series.number_of_seasons > 1 ? 's' : ''}</span>
                  </div>
                )}
                <span className="bg-cuevana-gray-100 text-cuevana-white px-3 py-1 rounded text-sm">
                  {genres}
                </span>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <span className="text-cuevana-blue font-medium">Género: </span>
                  <span className="text-cuevana-white">{genres}</span>
                </div>
                <div>
                  <span className="text-cuevana-blue font-medium">Actores: </span>
                  <span className="text-cuevana-white">Ryan Wesen, Denise Reed, Jimmy Dalton, Verina Banks</span>
                </div>
                <div>
                  <span className="text-cuevana-blue font-medium">Título Original: </span>
                  <span className="text-cuevana-white">{series.original_title || series.title}</span>
                </div>
                <div>
                  <span className="text-cuevana-blue font-medium">Año: </span>
                  <span className="text-cuevana-white">{releaseYear}</span>
                </div>
                <div>
                  <span className="text-cuevana-blue font-medium">Temporadas: </span>
                  <span className="text-cuevana-white">{series.number_of_seasons || 'N/A'}</span>
                </div>
                {series.number_of_episodes && (
                  <div>
                    <span className="text-cuevana-blue font-medium">Episodios: </span>
                    <span className="text-cuevana-white">{series.number_of_episodes}</span>
                  </div>
                )}
                {series.status && (
                  <div>
                    <span className="text-cuevana-blue font-medium">Estado: </span>
                    <span className="text-cuevana-white">{series.status}</span>
                  </div>
                )}
                {series.rating && (
                  <div>
                    <span className="text-cuevana-blue font-medium">Calificación: </span>
                    <span className="text-cuevana-white">{series.rating}/10</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <Button 
                  onClick={scrollToPlayer}
                  className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white flex items-center gap-2 px-6 py-3"
                >
                  <Play className="h-5 w-5" /> Ver Ahora
                </Button>
                <ShareButton 
                  title={series.title}
                  variant="outline"
                  className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Season and Episode Selection */}
            {seasons.length > 0 && (
              <div className="flex gap-4 mb-6">
                <div className="relative">
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="bg-cuevana-gray-100 text-cuevana-white border border-cuevana-gray-200 rounded px-4 py-2 pr-8 appearance-none cursor-pointer"
                  >
                    {seasons.map((season) => (
                      <option key={season.season_number} value={season.season_number}>
                        Temporada {season.season_number}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cuevana-white pointer-events-none" />
                </div>
                
                {currentSeason && currentSeason.episodes.length > 0 && (
                  <div className="relative">
                    <select
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                      className="bg-cuevana-gray-100 text-cuevana-white border border-cuevana-gray-200 rounded px-4 py-2 pr-8 appearance-none cursor-pointer"
                    >
                      {currentSeason.episodes.map((episode) => (
                        <option key={episode.episode_number} value={episode.episode_number}>
                          Episodio {episode.episode_number}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cuevana-white pointer-events-none" />
                  </div>
                )}
              </div>
            )}

            {/* Video Player */}
            <section ref={videoPlayerRef}>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-white">
                {currentEpisode?.title || `Episodio ${selectedEpisode}`}
              </h2>
              <SeriesVideoPlayer 
                series={series}
                selectedSeason={selectedSeason}
                selectedEpisode={selectedEpisode}
                onSeasonChange={setSelectedSeason}
                onEpisodeChange={setSelectedEpisode}
              />
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Genres Section */}
            {Array.isArray(series.genres) && series.genres.length > 0 && (
              <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-cuevana-white">Géneros</h3>
                <div className="flex flex-wrap gap-2">
                  {series.genres.map((genre, index) => (
                    <Link
                      key={index}
                      to={`/genre/${encodeURIComponent(genre)}`}
                      className="bg-cuevana-blue text-white px-3 py-1 rounded text-sm hover:bg-cuevana-blue/80 transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Series */}
            {realRelatedSeries.length > 0 && (
              <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-cuevana-white">Series Destacadas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {realRelatedSeries.slice(0, 4).map((relatedSerie) => (
                    <Link key={relatedSerie.id} to={`/series/${relatedSerie.id}`} className="group">
                      <div className="relative aspect-[2/3] overflow-hidden rounded">
                        <img
                          src={relatedSerie.posterUrl}
                          alt={relatedSerie.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute top-1 left-1 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-1 py-0.5 rounded flex items-center">
                          <Star className="h-2 w-2 mr-0.5 fill-current" />
                          {relatedSerie.rating.toFixed(1)}
                        </div>
                      </div>
                      <h4 className="text-cuevana-white text-xs mt-2 line-clamp-2 group-hover:text-cuevana-blue">
                        {relatedSerie.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
