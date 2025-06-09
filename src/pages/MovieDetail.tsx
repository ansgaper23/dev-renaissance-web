
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMovieBySlug } from '@/services/movieService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/VideoPlayer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Play, Star, Calendar, Clock, Tag, Heart } from 'lucide-react';
import ShareButton from '@/components/ShareButton';
import MovieSection from '@/components/MovieSection';
import { recordMovieView, fetchRelatedMovies } from '@/services/movieService';

const MovieDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedServer, setSelectedServer] = useState(0);

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => fetchMovieBySlug(slug!),
    enabled: !!slug,
  });

  // Query para películas relacionadas
  const { data: relatedMovies = [] } = useQuery({
    queryKey: ['relatedMovies', movie?.id, movie?.genres],
    queryFn: () => fetchRelatedMovies(movie!.id, movie?.genres || []),
    enabled: !!movie,
  });

  // Registrar vista cuando se carga la película
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
          Cargando...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          Error al cargar la película
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

  // Transformar películas relacionadas para MovieSection
  const transformedRelatedMovies = relatedMovies.map(relatedMovie => ({
    id: relatedMovie.id,
    title: relatedMovie.title,
    posterUrl: relatedMovie.poster_path ? 
      (relatedMovie.poster_path.startsWith('http') ? relatedMovie.poster_path : `https://image.tmdb.org/t/p/w500${relatedMovie.poster_path}`) : 
      '/placeholder.svg',
    rating: relatedMovie.rating || 0,
    year: relatedMovie.release_date ? new Date(relatedMovie.release_date).getFullYear() : new Date().getFullYear(),
    genre: relatedMovie.genres ? relatedMovie.genres[0] : 'Sin género'
  }));

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      <SEOHead 
        title={movie.title}
        description={movie.overview || `Mira ${movie.title} online gratis`}
        image={posterUrl}
        type="movie"
      />
      
      <div className="relative">
        {/* Backdrop */}
        <div className="relative h-[60vh] overflow-hidden">
          <img 
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-cuevana-bg/60 to-transparent" />
        </div>

        {/* Movie Info */}
        <div className="container mx-auto px-4 -mt-32 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Poster */}
            <div className="flex-shrink-0">
              <img 
                src={posterUrl}
                alt={movie.title}
                className="w-64 h-96 object-cover rounded-lg shadow-2xl mx-auto lg:mx-0"
              />
            </div>

            {/* Details */}
            <div className="flex-1 lg:ml-8">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{movie.title}</h1>
              
              {/* Sinopsis debajo del título */}
              {movie.overview && (
                <p className="text-cuevana-white/90 text-lg leading-relaxed mb-6">
                  {movie.overview}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 mb-6">
                {movie.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-cuevana-gold fill-current" />
                    <span className="text-lg font-semibold">{movie.rating}/10</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cuevana-blue" />
                  <span>{releaseYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-cuevana-blue" />
                  <span>{runtime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-cuevana-blue" />
                  <span>{genres}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Ver Película
                </Button>
                <ShareButton 
                  title={movie.title}
                />
                <Button variant="outline" className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10">
                  <Heart className="h-5 w-5 mr-2" />
                  Favoritos
                </Button>
              </div>
            </div>
          </div>

          {/* Video Player */}
          <div className="mt-12">
            <VideoPlayer 
              title={movie.title}
              streamServers={movie.stream_servers || []}
              streamUrl={movie.stream_url || undefined}
            />
          </div>

          {/* Related Movies */}
          {transformedRelatedMovies.length > 0 && (
            <div className="mt-16">
              <MovieSection 
                title="Películas Relacionadas"
                movies={transformedRelatedMovies}
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
