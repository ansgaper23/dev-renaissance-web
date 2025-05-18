
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Star, Download, Calendar, Clock } from 'lucide-react';

// Mock movie data (in a real app, this would be fetched from an API)
const movieData = {
  id: "123",
  title: "Dune",
  tagline: "Beyond fear, destiny awaits.",
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

const MovieDetail = () => {
  const { id } = useParams();
  // In a real app, you would fetch movie data based on the ID
  // const movie = useMovie(id);
  const movie = movieData;
  
  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Hero backdrop */}
      <div className="relative w-full h-[70vh]">
        <div className="absolute inset-0">
          <img 
            src={movie.backdropUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        </div>
        
        {/* Movie info overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12 flex flex-col md:flex-row md:items-end gap-8">
            <div className="shrink-0 w-[200px] hidden md:block">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full rounded-lg shadow-lg border border-gray-800"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-xl text-gray-300 mb-4 italic">{movie.tagline}</p>
              )}
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 mr-1" />
                  <span>{movie.rating}/5</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{movie.year}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-400 mr-1" />
                  <span>{movie.duration}</span>
                </div>
                <span className="text-gray-300">{movie.genre}</span>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2">
                  <Play className="h-4 w-4" /> Ver ahora
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white/20 flex items-center gap-2">
                  <Download className="h-4 w-4" /> Descargar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile poster (only shown on mobile) */}
      <div className="md:hidden container mx-auto px-4 -mt-20 mb-8">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-[150px] rounded-lg shadow-lg border border-gray-800"
        />
      </div>
      
      {/* Content section */}
      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Sinopsis</h2>
            <p className="text-gray-300 mb-8">
              {movie.description}
            </p>
            
            {/* Trailer */}
            <h2 className="text-2xl font-semibold mb-4">Trailer</h2>
            <div className="aspect-video rounded-lg overflow-hidden mb-8">
              <iframe 
                src={movie.trailerUrl} 
                title={`${movie.title} trailer`}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h3 className="text-xl font-semibold mb-4">Detalles</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-gray-400 mb-1">Director</h4>
                  <p>{movie.director}</p>
                </div>
                
                <div>
                  <h4 className="text-gray-400 mb-2">Reparto</h4>
                  <div className="grid grid-cols-1 gap-1">
                    {movie.cast.map((actor, index) => (
                      <span key={index}>{actor}</span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-gray-400 mb-1">Género</h4>
                  <p>{movie.genre}</p>
                </div>
                
                <div>
                  <h4 className="text-gray-400 mb-1">Año</h4>
                  <p>{movie.year}</p>
                </div>
                
                <div>
                  <h4 className="text-gray-400 mb-1">Duración</h4>
                  <p>{movie.duration}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/admin">
                  <Button variant="outline" className="w-full">
                    Editar película
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
