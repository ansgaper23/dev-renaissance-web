
import React, { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Clock, Play, Share2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import SEOHead from '@/components/SEOHead';
import { fetchMovieById, fetchMovies } from '@/services/movieService';
import { getSettings } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';

const MovieDetail = () => {
  const { id } = useParams();
  const videoPlayerRef = useRef<HTMLDivElement>(null);
  
  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => fetchMovieById(id!),
    enabled: !!id,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const { data: relatedMovies } = useQuery({
    queryKey: ['relatedMovies'],
    queryFn: () => fetchMovies(''),
  });

  console.log("Movie data:", movie);

  const scrollToPlayer = () => {
    videoPlayerRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const handleShare = async () => {
    const title = movie?.title || 'Película en Cuevana3';
    const text = `Mira ${movie?.title} en Cuevana3`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Enlace copiado",
          description: "El enlace de la película se ha copiado al portapapeles",
        });
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast({
          title: "Error",
          description: "No se pudo copiar el enlace",
          variant: "destructive"
        });
      }
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

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Película no encontrada</h1>
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

  const posterUrl = movie.poster_path?.startsWith('http') 
    ? movie.poster_path 
    : movie.poster_path 
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : '/placeholder.svg';

  const backdropUrl = movie.backdrop_path?.startsWith('http')
    ? movie.backdrop_path
    : movie.backdrop_path
      ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
      : posterUrl;

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const duration = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
  const genres = Array.isArray(movie.genres) ? movie.genres.join(', ') : 'Sin género';
  
  // Get real related movies (limit to 6)
  const realRelatedMovies = relatedMovies?.slice(0, 6).map(m => ({
    id: m.id,
    title: m.title,
    posterUrl: m.poster_path?.startsWith('http') 
      ? m.poster_path 
      : m.poster_path 
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
        : '/placeholder.svg',
    rating: m.rating || 0,
    year: m.release_date ? new Date(m.release_date).getFullYear() : 0
  })) || [];
  
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <SEOHead
        title={movie.title}
        description={movie.overview || `Mira ${movie.title} online gratis en Cuevana3`}
        image={backdropUrl}
        url={window.location.href}
        type="movie"
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
            alt={movie.title} 
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
                alt={movie.title} 
                className="w-64 mx-auto lg:mx-0 rounded-lg shadow-2xl border border-cuevana-gray-200"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 pt-16">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-cuevana-white">{movie.title}</h1>
              {movie.original_title && movie.original_title !== movie.title && (
                <p className="text-xl text-cuevana-blue mb-4 italic">{movie.original_title}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-6">
                {movie.rating && (
                  <div className="flex items-center bg-cuevana-blue px-3 py-1 rounded">
                    <Star className="h-4 w-4 text-cuevana-gold mr-1 fill-current" />
                    <span className="font-semibold">{movie.rating}/10</span>
                  </div>
                )}
                <div className="flex items-center text-cuevana-white/80">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center text-cuevana-white/80">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{duration}</span>
                </div>
                <span className="bg-cuevana-gray-100 text-cuevana-white px-3 py-1 rounded text-sm">
                  {genres}
                </span>
              </div>
              
              {movie.overview && (
                <p className="text-cuevana-white/90 mb-6 text-lg leading-relaxed">
                  {movie.overview}
                </p>
              )}
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={scrollToPlayer}
                  className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white flex items-center gap-2 px-6 py-3"
                >
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
            <section ref={videoPlayerRef}>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-white">Reproducir</h2>
              <VideoPlayer 
                title={movie.title} 
                streamServers={movie.stream_servers || []}
                streamUrl={movie.stream_url || undefined}
              />
            </section>
            
            {/* Trailer */}
            {movie.trailer_url && (
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-cuevana-white">Trailer</h2>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe 
                    src={movie.trailer_url} 
                    title={`${movie.title} trailer`}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </section>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Genres Section */}
            {Array.isArray(movie.genres) && movie.genres.length > 0 && (
              <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-cuevana-white">Géneros</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre, index) => (
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

            {/* Movie Details */}
            <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-cuevana-white">Detalles</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Título Original</h4>
                  <p className="text-cuevana-white">{movie.original_title || movie.title}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Año</h4>
                  <p className="text-cuevana-white">{releaseYear}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Duración</h4>
                  <p className="text-cuevana-white">{duration}</p>
                </div>
                
                {movie.rating && (
                  <div>
                    <h4 className="text-cuevana-blue mb-2 font-medium">Calificación</h4>
                    <p className="text-cuevana-white">{movie.rating}/10</p>
                  </div>
                )}
                
                {movie.stream_servers && movie.stream_servers.length > 0 && (
                  <div>
                    <h4 className="text-cuevana-blue mb-2 font-medium">Servidores</h4>
                    <p className="text-cuevana-white">{movie.stream_servers.length} servidor(es) disponible(s)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Movies */}
            {realRelatedMovies.length > 0 && (
              <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-cuevana-white">Películas Destacadas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {realRelatedMovies.slice(0, 4).map((relatedMovie) => (
                    <Link key={relatedMovie.id} to={`/movie/${relatedMovie.id}`} className="group">
                      <div className="relative aspect-[2/3] overflow-hidden rounded">
                        <img
                          src={relatedMovie.posterUrl}
                          alt={relatedMovie.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute top-1 left-1 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-1 py-0.5 rounded flex items-center">
                          <Star className="h-2 w-2 mr-0.5 fill-current" />
                          {relatedMovie.rating.toFixed(1)}
                        </div>
                      </div>
                      <h4 className="text-cuevana-white text-xs mt-2 line-clamp-2 group-hover:text-cuevana-blue">
                        {relatedMovie.title}
                      </h4>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Movies */}
        {realRelatedMovies.length > 0 && (
          <div className="mt-12">
            <section className="py-8">
              <h3 className="text-2xl font-bold text-cuevana-white mb-6">Películas Relacionadas</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {realRelatedMovies.map((relatedMovie) => (
                  <Link key={relatedMovie.id} to={`/movie/${relatedMovie.id}`} className="group">
                    <div className="bg-cuevana-gray-100 border-cuevana-gray-200 overflow-hidden transition-all duration-300 group-hover:scale-105 rounded-lg">
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <img
                          src={relatedMovie.posterUrl}
                          alt={relatedMovie.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        
                        <div className="absolute top-2 left-2 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-2 py-1 rounded flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {relatedMovie.rating.toFixed(1)}
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h4 className="text-cuevana-white font-medium text-sm line-clamp-2 mb-1">
                          {relatedMovie.title}
                        </h4>
                        <span className="text-cuevana-white/70 text-xs">{relatedMovie.year}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
