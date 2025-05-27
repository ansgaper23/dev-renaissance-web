
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Play, Share2, Loader2, Tv, ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { fetchSeriesById } from '@/services/seriesService';
import { toast } from '@/hooks/use-toast';

interface Episode {
  id: string;
  season_number: number;
  episode_number: number;
  title: string;
  overview?: string;
  still_path?: string;
  stream_servers?: Array<{
    name: string;
    url: string;
    language?: string;
  }>;
}

const SeriesDetail = () => {
  const { id } = useParams();
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  
  const { data: series, isLoading, error } = useQuery({
    queryKey: ['series', id],
    queryFn: () => fetchSeriesById(id!),
    enabled: !!id,
  });

  console.log("Series data:", series);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: series?.title || 'Serie en Cuevana3',
        text: `Mira ${series?.title} en Cuevana3`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace de la serie se ha copiado al portapapeles",
      });
    }
  };

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
            <Link to="/series">
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90">
                Volver a Series
              </Button>
            </Link>
          </div>
        </div>
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

  const releaseYear = series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'N/A';
  const genres = Array.isArray(series.genres) ? series.genres.join(', ') : 'Sin género';
  
  // Generate mock episodes for demonstration
  const generateEpisodes = (seasonNumber: number) => {
    const episodesPerSeason = 10; // Default episodes per season
    const episodes: Episode[] = [];
    
    for (let i = 1; i <= episodesPerSeason; i++) {
      episodes.push({
        id: `${series.id}-s${seasonNumber}-e${i}`,
        season_number: seasonNumber,
        episode_number: i,
        title: `${series.title} ${seasonNumber}x${i}`,
        overview: `Episodio ${i} de la temporada ${seasonNumber}`,
        still_path: series.backdrop_path,
        stream_servers: series.stream_servers || []
      });
    }
    
    return episodes;
  };

  const currentSeasonEpisodes = generateEpisodes(selectedSeason);
  const seasons = Array.from({ length: series.number_of_seasons || 1 }, (_, i) => i + 1);
  
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Backdrop */}
        <div className="absolute inset-0 h-[60vh]">
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
              
              <div className="flex flex-wrap gap-4 mb-6">
                {series.rating && (
                  <div className="flex items-center bg-yellow-600 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-white mr-1 fill-current" />
                    <span className="font-semibold text-white">{series.rating}</span>
                  </div>
                )}
                <div className="flex items-center text-cuevana-white/80">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center text-cuevana-white/80">
                  <Tv className="h-4 w-4 mr-1" />
                  <span>{series.number_of_seasons || 'N/A'} temporadas</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-cuevana-blue font-medium">Género: </span>
                <span className="text-cuevana-white">{genres}</span>
              </div>
              
              <div className="mb-6">
                <span className="text-cuevana-blue font-medium">Actores: </span>
                <span className="text-cuevana-white/80">Información no disponible</span>
              </div>
              
              {series.overview && (
                <p className="text-cuevana-white/90 mb-6 text-lg leading-relaxed">
                  {series.overview}
                </p>
              )}
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10 flex items-center gap-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Season and Episode Selection */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              className="border-cuevana-blue text-cuevana-blue hover:bg-cuevana-blue hover:text-white"
            >
              Seleccionar temporada
            </Button>
            
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-cuevana-gray-100 border border-cuevana-gray-200 text-cuevana-white px-4 py-2 rounded-lg appearance-none pr-8"
              >
                {seasons.map(season => (
                  <option key={season} value={season} className="bg-cuevana-gray-100">
                    Temporada {season}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cuevana-white pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Episodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {currentSeasonEpisodes.map((episode) => (
            <div 
              key={episode.id}
              className="bg-cuevana-gray-100 rounded-lg overflow-hidden hover:bg-cuevana-gray-200 transition-colors cursor-pointer"
              onClick={() => setSelectedEpisode(episode)}
            >
              <div className="relative">
                <img 
                  src={episode.still_path?.startsWith('http') 
                    ? episode.still_path 
                    : episode.still_path 
                      ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                      : posterUrl} 
                  alt={episode.title}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute top-2 right-2 bg-cuevana-blue text-white px-2 py-1 rounded text-sm font-bold">
                  {selectedSeason}x{episode.episode_number}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-cuevana-white font-medium text-sm line-clamp-2">
                  {episode.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
        
        {/* Video Player for Selected Episode */}
        {selectedEpisode && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-cuevana-white">
              Reproducir - {selectedEpisode.title}
            </h2>
            <VideoPlayer 
              title={selectedEpisode.title} 
              streamServers={selectedEpisode.stream_servers || []}
            />
          </div>
        )}
        
        {/* Default Video Player */}
        {!selectedEpisode && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-cuevana-white">Reproducir</h2>
            <VideoPlayer 
              title={series.title} 
              streamServers={series.stream_servers || []}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SeriesDetail;
