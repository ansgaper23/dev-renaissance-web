
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Play, Share2, Loader2, Tv } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import { fetchSeriesById } from '@/services/seriesService';
import { toast } from '@/hooks/use-toast';

const SeriesDetail = () => {
  const { id } = useParams();
  
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
  
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
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
                <div className="flex items-center text-cuevana-white/80">
                  <Tv className="h-4 w-4 mr-1" />
                  <span>{series.number_of_seasons || 'N/A'} temporadas</span>
                </div>
                <span className="bg-cuevana-gray-100 text-cuevana-white px-3 py-1 rounded text-sm">
                  {genres}
                </span>
              </div>
              
              {series.overview && (
                <p className="text-cuevana-white/90 mb-6 text-lg leading-relaxed">
                  {series.overview}
                </p>
              )}
              
              <div className="flex flex-wrap gap-3">
                <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white flex items-center gap-2 px-6 py-3">
                  <Play className="h-5 w-5" /> Ver Ahora
                </Button>
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
      
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-white">Reproducir</h2>
              <VideoPlayer 
                title={series.title} 
                streamServers={series.stream_servers || []}
              />
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-cuevana-white">Detalles</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Título Original</h4>
                  <p className="text-cuevana-white">{series.original_title || series.title}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Género</h4>
                  <p className="text-cuevana-white">{genres}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Año</h4>
                  <p className="text-cuevana-white">{releaseYear}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Temporadas</h4>
                  <p className="text-cuevana-white">{series.number_of_seasons || 'N/A'}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Episodios</h4>
                  <p className="text-cuevana-white">{series.number_of_episodes || 'N/A'}</p>
                </div>
                
                {series.rating && (
                  <div>
                    <h4 className="text-cuevana-blue mb-2 font-medium">Calificación</h4>
                    <p className="text-cuevana-white">{series.rating}/10</p>
                  </div>
                )}
                
                {series.stream_servers && series.stream_servers.length > 0 && (
                  <div>
                    <h4 className="text-cuevana-blue mb-2 font-medium">Servidores</h4>
                    <p className="text-cuevana-white">{series.stream_servers.length} servidor(es) disponible(s)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeriesDetail;
