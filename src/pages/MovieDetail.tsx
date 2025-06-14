
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieBySlug } from '@/services/movieService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar, Clock, Tag, Heart, ArrowLeft } from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import MovieSection from '@/components/MovieSection';
import { recordMovieView, fetchRelatedMovies } from '@/services/movieService';
import { useSettings } from '@/hooks/useSettings';

const MovieDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedServer, setSelectedServer] = useState(0);
  const { data: settings } = useSettings();

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => fetchMovieBySlug(slug!),
    enabled: !!slug,
    retry: (failureCount, error) => {
      console.error(`Attempt ${failureCount + 1} failed:`, error);
      return failureCount < 2;
    }
  });

  const { data: relatedMovies = [] } = useQuery({
    queryKey: ['relatedMovies', movie?.id, movie?.genres],
    queryFn: () => fetchRelatedMovies(movie!.id, movie?.genres || []),
    enabled: !!movie,
  });

  useEffect(() => {
    if (movie?.id) {
      recordMovieView(movie.id);
    }
  }, [movie?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cuevana-blue"></div>
            <p className="text-lg">Cargando película...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    console.error("Error loading movie:", error);
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-2xl font-bold text-red-400">Error al cargar la película</h2>
            <p className="text-cuevana-white/70">
              {error?.message || 'No se pudo encontrar la película solicitada'}
            </p>
            <p className="text-sm text-cuevana-white/50">
              Slug buscado: {slug}
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="bg-cuevana-blue hover:bg-cuevana-blue/90 flex items-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Button>
          </div>
        </div>
        <Footer />
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

  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Sin fecha';
  const genres = Array.isArray(movie.genres) ? movie.genres.join(', ') : 'Sin género';
  const runtime = movie.runtime ? `${movie.runtime} min` : 'Duración no disponible';

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      <SEOHead 
        title={movie.title}
        description={movie.overview || `Mira ${movie.title} online gratis`}
        image={posterUrl}
        type="movie"
        siteName={settings?.site_name}
        logoUrl={settings?.logo_url}
        adsCode={settings?.ads_code}
      />
      
      <div className="relative">
        {/* Backdrop */}
        <div className="relative h-[50vh] overflow-hidden">
          <img 
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-cuevana-bg/80 to-transparent" />
        </div>

        {/* Movie Info - Layout like reference image */}
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img 
                src={posterUrl}
                alt={movie.title}
                className="w-48 h-72 object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Movie Details - Right side of poster */}
            <div className="flex-1 space-y-3 pt-8">
              {/* Title and Original Title */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-cuevana-white">{movie.title}</h1>
                <p className="text-cuevana-white/70 text-lg mt-1">{movie.original_title || movie.title}</p>
              </div>

              {/* Rating, Year, Duration in one line */}
              <div className="flex items-center gap-4 text-cuevana-white/90">
                {movie.rating && (
                  <div className="inline-flex items-center bg-cuevana-gold/20 text-cuevana-gold px-2 py-1 rounded">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    <span className="font-semibold text-sm">{movie.rating}%</span>
                  </div>
                )}
                <span className="text-sm">{releaseYear}</span>
                <span className="text-sm">{runtime}</span>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <ShareButton 
                  title={movie.title}
                  variant="outline"
                  className="text-cuevana-blue border-cuevana-blue hover:bg-cuevana-blue hover:text-white"
                />
              </div>
            </div>
          </div>

          {/* Synopsis - Full width below poster and details */}
          {movie.overview && (
            <div className="mt-8">
              <p className="text-cuevana-white/90 leading-relaxed text-base max-w-4xl">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Genres */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-cuevana-white/70 text-sm font-medium">Género:</span>
              <span className="text-cuevana-white/90 text-sm">{genres}</span>
            </div>
          </div>

          {/* Actors section if available */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="mt-4">
              <div className="flex items-start gap-2">
                <span className="text-cuevana-white/70 text-sm font-medium">Actores:</span>
                <span className="text-cuevana-white/90 text-sm">{movie.cast.slice(0, 5).join(', ')}</span>
              </div>
            </div>
          )}

          {/* Video Player */}
          <div className="mt-12">
            <VideoPlayer 
              title={movie.title}
              streamServers={movie.stream_servers || []}
              streamUrl={movie.stream_url || undefined}
            />
          </div>

          {/* Related Movies */}
          {relatedMovies.length > 0 && (
            <div className="mt-16">
              <MovieSection 
                title="Películas Relacionadas"
                movies={relatedMovies}
                isLoading={false}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MovieDetail;
