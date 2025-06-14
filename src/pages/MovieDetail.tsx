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
  // Suponiendo que `cast` no existe en movie, mostrar solo géneros (como en tu referencia)  
  const genres = Array.isArray(movie.genres) ? movie.genres.join(', ') : 'Sin género';
  // Si tuvieras un array `movie.cast`, podrías hacer: movie.cast.map(...).join(', ')
  // Por ahora solo géneros, como en la referencia

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
        <div className="relative h-[30vh] md:h-[50vh] overflow-hidden">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-cuevana-bg/80 to-transparent" />
        </div>

        {/* --- MOBILE CARD SOBRE EL BANNER --- */}
        <div
          className="block md:hidden absolute left-1/2 -translate-x-1/2 top-[calc(62px-1.5rem)] w-[95%] bg-[rgba(20,25,35,0.6)] rounded-2xl shadow-xl px-4 pt-2 pb-4 z-30"
          style={{ maxWidth: 420 }}
        >
          {/* Mobile card content */}
          <div className="flex gap-4">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-24 h-36 object-cover rounded-lg shadow-lg flex-shrink-0"
            />
            <div className="flex flex-col flex-1 justify-center">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold leading-tight">{movie.title}</h1>
              </div>
              {movie.original_title && movie.original_title !== movie.title && (
                <div className="text-cuevana-white/70 text-sm mb-2">
                  {movie.original_title}
                </div>
              )}
              <div className="flex items-center gap-4 mb-1">
                {movie.rating && (
                  <div className="w-10 h-10 rounded-full border-2 border-yellow-400 flex items-center justify-center bg-cuevana-bg text-yellow-300 font-bold text-xs">
                    {movie.rating}%
                  </div>
                )}
                <span className="text-cuevana-white/80 text-xs">{movie.runtime ? Math.floor(movie.runtime / 60) + "h " + (movie.runtime % 60) + "min" : "Duración no disponible"}</span>
                <span className="text-cuevana-white/80 text-xs">{releaseYear}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <ShareButton
                  title={movie.title}
                  variant="outline"
                  className="text-cuevana-blue border-cuevana-blue hover:bg-cuevana-blue hover:text-white px-3 py-1"
                />
                {/* Facebook */}
                <a
                  href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center"
                >
                  <span className="sr-only">Compartir en Facebook</span>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12.07C22 6.485 17.522 2 12 2S2 6.485 2 12.07c0 5.057 3.657 9.248 8.438 9.879v-6.988h-2.54v-2.89h2.54v-2.205c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.457h-1.261c-1.242 0-1.631.771-1.631 1.562v1.881h2.773l-.443 2.89h-2.33V21.95C18.343 21.317 22 17.126 22 12.07"/></svg>
                </a>
                {/* Twitter */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Mira ${movie.title} en Cuevana3`)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-400 hover:bg-blue-500 flex items-center"
                >
                  <span className="sr-only">Compartir en Twitter</span>
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M22 5.924c-.793.352-1.647.59-2.543.697a4.462 4.462 0 0 0 1.97-2.466 8.862 8.862 0 0 1-2.826 1.084C17.052 4.443 16.072 4 15.01 4c-2.053 0-3.715 1.698-3.715 3.792 0 .297.033.587.099.866C7.597 8.496 4.926 7.028 2.98 4.846c-.325.573-.511 1.234-.511 1.942 0 1.338.663 2.522 1.672 3.215-.616-.019-1.195-.198-1.701-.47v.048c0 1.87 1.288 3.428 2.995 3.783-.327.093-.673.143-1.03.143-.251 0-.494-.026-.731-.07.494 1.579 1.922 2.727 3.617 2.757A8.989 8.989 0 0 1 2 19.083a12.825 12.825 0 0 0 6.995 2.084c8.395 0 12.99-7.1 12.99-13.26 0-.202-.004-.403-.014-.604.892-.651 1.668-1.464 2.279-2.388z"/></svg>
                </a>
              </div>
            </div>
          </div>
          {movie.overview && (
            <div className="mt-3 text-cuevana-white/90 text-sm">{movie.overview}</div>
          )}
          <div className="mt-2">
            <span className="font-semibold text-cuevana-white/80 text-sm">Género: </span>
            <span className="text-cuevana-white/60 text-sm">{genres}</span>
          </div>
          {/* Si hubiera actores agregar aquí */}
        </div>

        {/* -- SPACER PARA QUE LOS SERVIDORES NO QUEDEN TAPADOS (solo en mobile, hidden en desktop) -- */}
        <div className="block md:hidden" style={{ height: 80 }} />

        {/* DESKTOP AND TABLET LAYOUT with transparent card - Now positioned absolutely over the backdrop */}
        <div className="hidden md:block absolute inset-x-0 top-[20vh] container mx-auto px-4 z-30">
          <div className="bg-[rgba(20,25,35,0.6)] rounded-2xl shadow-xl p-8 mx-auto max-w-6xl">
            <div className="flex flex-row gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <img 
                  src={posterUrl}
                  alt={movie.title}
                  className="w-48 h-72 object-cover rounded-lg shadow-2xl"
                />
              </div>

              {/* Movie Details - Right side of poster */}
              <div className="flex-1 space-y-4 pt-8">
                {/* Title */}
                <h1 className="text-4xl lg:text-5xl font-bold text-cuevana-white leading-tight">
                  {movie.title}
                </h1>
                {/* Original Title */}
                <p className="text-cuevana-white/70 text-xl">
                  {movie.original_title || movie.title}
                </p>

                {/* Overview */}
                {movie.overview && (
                  <div className="text-cuevana-white/90 text-lg leading-relaxed">
                    {movie.overview}
                  </div>
                )}

                {/* Genres */}
                <div className="text-cuevana-white/80">
                  <span className="font-semibold">Género: </span>
                  <span className="text-cuevana-white/70">{genres}</span>
                </div>

                {/* Rating with circle and percentage */}
                {movie.rating && (
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12">
                      <div className="w-12 h-12 rounded-full border-4 border-cuevana-gold flex items-center justify-center bg-cuevana-bg">
                        <span className="text-cuevana-gold font-bold text-sm">{movie.rating}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Year and Duration in separate lines */}
                <div className="space-y-1">
                  <div className="text-cuevana-white/90 text-lg">
                    <span>{movie.runtime ? Math.floor(movie.runtime / 60) + "h " + (movie.runtime % 60) + "min" : "Duración no disponible"}</span>
                  </div>
                  <div className="text-cuevana-white/90 text-lg">
                    <span>{releaseYear}</span>
                  </div>
                </div>

                {/* Share Button - Moved inside the card */}
                <div className="flex items-center gap-3">
                  <ShareButton 
                    title={movie.title}
                    variant="outline"
                    className="text-cuevana-blue border-cuevana-blue hover:bg-cuevana-blue hover:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for desktop to push content below the overlay */}
        <div className="hidden md:block" style={{ height: '25vh' }} />

        {/* Video Player y servidores */}
        <div className="mt-8">
          <VideoPlayer
            title={movie.title}
            streamServers={movie.stream_servers || []}
            streamUrl={movie.stream_url || undefined}
          />
        </div>
        {/* Related Movies (sigue igual) */}
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
