import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieBySlug } from '@/services/movieService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import SEOHead from '@/components/SEOHead';
import AdInjector from '@/components/AdInjector';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import MovieSection from '@/components/MovieSection';
import { recordMovieView, fetchRelatedMovies } from '@/services/movieService';
import { useSettings } from '@/hooks/useSettings';

const MovieDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: settings } = useSettings();

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => fetchMovieBySlug(slug!),
    enabled: !!slug,
    retry: (failureCount) => failureCount < 2,
  });

  const { data: relatedMovies = [] } = useQuery({
    queryKey: ['relatedMovies', movie?.id, movie?.genres],
    queryFn: () => fetchRelatedMovies(movie!.id, movie?.genres || []),
    enabled: !!movie,
  });

  useEffect(() => {
    if (movie?.id) recordMovieView(movie.id);
  }, [movie?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cuevana-blue mx-auto" />
          <p className="text-lg mt-4">Cargando película...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Error al cargar la película</h2>
          <p className="text-cuevana-white/70">{error?.message || 'No se pudo encontrar la película'}</p>
          <Button onClick={() => navigate('/')} className="bg-cuevana-blue hover:bg-cuevana-blue/90">
            <ArrowLeft className="h-5 w-5 mr-2" />Volver al inicio
          </Button>
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

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      <SEOHead title={movie.title} description={movie.overview || `Mira ${movie.title} online gratis`} image={posterUrl} type="movie" siteName={settings?.site_name} logoUrl={settings?.logo_url} />
      <AdInjector scope="playback" />

      {/* Hero Banner */}
      <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
        <img src={backdropUrl} alt={movie.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-cuevana-bg/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-cuevana-bg/80 via-transparent to-transparent" />
      </div>

      {/* Content overlapping banner */}
      <div className="container mx-auto px-4 -mt-[35vh] md:-mt-[40vh] relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-40 md:w-52 h-auto rounded-lg shadow-2xl border-2 border-white/10"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-2 md:pt-8">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight mb-2">{movie.title}</h1>
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="text-cuevana-white/60 text-sm md:text-base mb-2">{movie.original_title}</p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm md:text-base">
              {movie.rating && (
                <div className="w-10 h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center bg-cuevana-bg text-yellow-300 font-bold text-xs">
                  {movie.rating}%
                </div>
              )}
              <span className="text-cuevana-white/80">
                {movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min` : ''}
              </span>
              <span className="text-cuevana-white/80">{releaseYear}</span>
            </div>

            {/* Description */}
            {movie.overview && (
              <p className="text-cuevana-white/90 text-sm md:text-base leading-relaxed mb-4 max-w-3xl">
                {movie.overview}
              </p>
            )}

            {/* Genres */}
            <div className="mb-4">
              <span className="font-semibold text-cuevana-white/80 text-sm">Género: </span>
              <span className="text-cuevana-white/60 text-sm">{genres}</span>
            </div>

            {/* Share buttons */}
            <div className="flex items-center gap-2">
              <ShareButton title={movie.title} variant="outline" className="text-cuevana-blue border-cuevana-blue hover:bg-cuevana-blue hover:text-white px-3 py-1" />
              <a href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center">
                <span className="sr-only">Facebook</span>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.07C22 6.485 17.522 2 12 2S2 6.485 2 12.07c0 5.057 3.657 9.248 8.438 9.879v-6.988h-2.54v-2.89h2.54v-2.205c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.457h-1.261c-1.242 0-1.631.771-1.631 1.562v1.881h2.773l-.443 2.89h-2.33V21.95C18.343 21.317 22 17.126 22 12.07"/></svg>
              </a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mira ${movie.title}`)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-blue-400 hover:bg-blue-500 flex items-center">
                <span className="sr-only">Twitter</span>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 5.924c-.793.352-1.647.59-2.543.697a4.462 4.462 0 0 0 1.97-2.466 8.862 8.862 0 0 1-2.826 1.084C17.052 4.443 16.072 4 15.01 4c-2.053 0-3.715 1.698-3.715 3.792 0 .297.033.587.099.866C7.597 8.496 4.926 7.028 2.98 4.846c-.325.573-.511 1.234-.511 1.942 0 1.338.663 2.522 1.672 3.215-.616-.019-1.195-.198-1.701-.47v.048c0 1.87 1.288 3.428 2.995 3.783-.327.093-.673.143-1.03.143-.251 0-.494-.026-.731-.07.494 1.579 1.922 2.727 3.617 2.757A8.989 8.989 0 0 1 2 19.083a12.825 12.825 0 0 0 6.995 2.084c8.395 0 12.99-7.1 12.99-13.26 0-.202-.004-.403-.014-.604.892-.651 1.668-1.464 2.279-2.388z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Video Player with language tabs */}
        <div className="mt-8">
          <VideoPlayer title={movie.title} streamServers={movie.stream_servers || []} streamUrl={movie.stream_url || undefined} />
        </div>

        {/* Related Movies */}
        {relatedMovies.length > 0 && (
          <div className="mt-16">
            <MovieSection title="Películas Relacionadas" movies={relatedMovies} isLoading={false} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MovieDetail;
