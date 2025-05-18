
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

// Featured movie data (in a real app, this would come from an API)
const featuredMovie = {
  id: 1,
  title: "Avengers: Endgame",
  description: "Después de los devastadores eventos de 'Vengadores: Infinity War', el universo está en ruinas. Con la ayuda de los aliados que quedaron, los Vengadores se reúnen una vez más para intentar deshacer las acciones de Thanos y restaurar el equilibrio del universo.",
  backdropUrl: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
  rating: 4.8,
  year: 2019,
  duration: "3h 1m",
  genre: "Acción, Aventura, Ciencia ficción"
};

const FeaturedMovie = () => {
  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {/* Backdrop image */}
      <div className="absolute inset-0">
        <img 
          src={featuredMovie.backdropUrl} 
          alt={featuredMovie.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
      </div>

      {/* Content overlay */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{featuredMovie.title}</h1>
          <div className="flex items-center mb-4 space-x-4">
            <span className="bg-brand-purple px-2 py-0.5 rounded text-sm">{featuredMovie.rating} ★</span>
            <span className="text-gray-300 text-sm">{featuredMovie.year}</span>
            <span className="text-gray-300 text-sm">{featuredMovie.duration}</span>
          </div>
          <p className="text-gray-300 mb-6 line-clamp-3 md:line-clamp-none">
            {featuredMovie.description}
          </p>
          <div className="flex space-x-4">
            <Button className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2">
              <Play className="h-4 w-4" /> Reproducir
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/20">
              Más información
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMovie;
