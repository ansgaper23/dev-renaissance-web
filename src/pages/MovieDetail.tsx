
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Star, Calendar, Clock, Play, Download, Heart, Share2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import RelatedMovies from '@/components/RelatedMovies';

// Mock movie data (en una app real, esto vendría de una API)
const movieData = {
  id: "123",
  title: "Dune",
  tagline: "El destino te espera más allá del miedo.",
  description: "Paul Atreides, un joven brillante y talentoso nacido en un gran destino más allá de su entendimiento, debe viajar al planeta más peligroso del universo para asegurar el futuro de su familia y de su pueblo. A medida que fuerzas malévolas estallan en conflicto por el suministro exclusivo del recurso más preciado que existe en el planeta, solo sobrevivirán aquellos que puedan conquistar su miedo.",
  posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
  backdropUrl: "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
  genre: "Ciencia ficción, Aventura, Drama",
  year: 2021,
  duration: "2h 35m",
  rating: 4.5,
  director: "Denis Villeneuve",
  cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Josh Brolin", "Stellan Skarsgård", "Zendaya"],
  trailerUrl: "https://www.youtube.com/embed/8g18jFHCLXk"
};

const relatedMovies = [
  {
    id: 2,
    title: "Blade Runner 2049",
    posterUrl: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    rating: 4.3,
    year: 2017
  },
  {
    id: 3,
    title: "Arrival",
    posterUrl: "https://image.tmdb.org/t/p/w500/yImmxRokQ48PD49ughXdpKTAsQU.jpg",
    rating: 4.2,
    year: 2016
  },
  {
    id: 4,
    title: "Interstellar",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 4.6,
    year: 2014
  },
  {
    id: 5,
    title: "Mad Max: Fury Road",
    posterUrl: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    rating: 4.5,
    year: 2015
  },
  {
    id: 6,
    title: "The Matrix",
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 4.7,
    year: 1999
  },
  {
    id: 7,
    title: "Inception",
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    rating: 4.8,
    year: 2010
  }
];

const MovieDetail = () => {
  const { id } = useParams();
  const movie = movieData;
  
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative">
        {/* Backdrop */}
        <div className="absolute inset-0 h-[50vh]">
          <img 
            src={movie.backdropUrl} 
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
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-64 mx-auto lg:mx-0 rounded-lg shadow-2xl border border-cuevana-gray-200"
              />
            </div>
            
            {/* Info */}
            <div className="flex-1 pt-16">
              <h1 className="text-3xl md:text-5xl font-bold mb-2 text-cuevana-white">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-xl text-cuevana-blue mb-4 italic">{movie.tagline}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center bg-cuevana-blue px-3 py-1 rounded">
                  <Star className="h-4 w-4 text-cuevana-gold mr-1 fill-current" />
                  <span className="font-semibold">{movie.rating}/5</span>
                </div>
                <div className="flex items-center text-cuevana-white/80">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center text-cuevana-white/80">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{movie.duration}</span>
                </div>
                <span className="bg-cuevana-gray-100 text-cuevana-white px-3 py-1 rounded text-sm">
                  {movie.genre}
                </span>
              </div>
              
              <p className="text-cuevana-white/90 mb-6 text-lg leading-relaxed">
                {movie.description}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white flex items-center gap-2 px-6 py-3">
                  <Play className="h-5 w-5" /> Ver Ahora
                </Button>
                <Button variant="outline" className="border-cuevana-gold text-cuevana-gold hover:bg-cuevana-gold hover:text-cuevana-bg flex items-center gap-2 px-6 py-3">
                  <Download className="h-5 w-5" /> Descargar
                </Button>
                <Button variant="outline" className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10 flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Favoritos
                </Button>
                <Button variant="outline" className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10 flex items-center gap-2">
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
              <VideoPlayer title={movie.title} />
            </section>
            
            {/* Trailer */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-cuevana-white">Trailer</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe 
                  src={movie.trailerUrl} 
                  title={`${movie.title} trailer`}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </section>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-cuevana-white">Detalles</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Director</h4>
                  <p className="text-cuevana-white">{movie.director}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Reparto</h4>
                  <div className="space-y-1">
                    {movie.cast.map((actor, index) => (
                      <p key={index} className="text-cuevana-white text-sm">{actor}</p>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Género</h4>
                  <p className="text-cuevana-white">{movie.genre}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Año</h4>
                  <p className="text-cuevana-white">{movie.year}</p>
                </div>
                
                <div>
                  <h4 className="text-cuevana-blue mb-2 font-medium">Duración</h4>
                  <p className="text-cuevana-white">{movie.duration}</p>
                </div>
              </div>
            </div>
            
            {/* Admin Edit Button */}
            <div className="bg-cuevana-gray-100 rounded-lg p-4 border border-cuevana-gray-200">
              <Link to="/admin">
                <Button variant="outline" className="w-full border-cuevana-blue text-cuevana-blue hover:bg-cuevana-blue hover:text-white">
                  Editar película (Admin)
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Related Movies */}
        <div className="mt-12">
          <RelatedMovies movies={relatedMovies} />
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
