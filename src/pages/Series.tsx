
import React from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Star } from 'lucide-react';

const Series = () => {
  // Mock data for series
  const series = [
    {
      id: 1,
      title: "Breaking Bad",
      posterUrl: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      year: 2008,
      rating: 9.5,
      genre: "Drama, Crimen"
    },
    {
      id: 2,
      title: "Game of Thrones",
      posterUrl: "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
      year: 2011,
      rating: 9.3,
      genre: "Drama, Fantasía"
    },
    {
      id: 3,
      title: "The Office",
      posterUrl: "https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
      year: 2005,
      rating: 8.7,
      genre: "Comedia"
    },
  ];

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Series</h1>
          <p className="text-cuevana-white/80 text-lg">Próximamente - Funcionalidad de series en desarrollo</p>
        </div>

        {/* Series Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {series.map((serie) => (
            <div key={serie.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg bg-cuevana-gray-100 aspect-[2/3] mb-3">
                <img 
                  src={serie.posterUrl} 
                  alt={serie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button size="sm" className="bg-cuevana-blue hover:bg-cuevana-blue/90">
                    <Play className="h-4 w-4 mr-2" />
                    Ver Serie
                  </Button>
                </div>
                <div className="absolute top-2 right-2 bg-cuevana-blue px-2 py-1 rounded text-xs font-semibold">
                  <Star className="h-3 w-3 inline mr-1" />
                  {serie.rating}
                </div>
              </div>
              <h3 className="font-semibold text-cuevana-white group-hover:text-cuevana-blue transition-colors truncate">
                {serie.title}
              </h3>
              <div className="flex items-center text-cuevana-white/70 text-sm mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{serie.year}</span>
                <span className="mx-2">•</span>
                <span>{serie.genre}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-cuevana-gray-100 rounded-lg p-8 border border-cuevana-gray-200">
            <h2 className="text-2xl font-bold mb-4">¡Próximamente!</h2>
            <p className="text-cuevana-white/80 mb-6">
              Estamos trabajando en traerte las mejores series. Muy pronto podrás disfrutar de tus series favoritas.
            </p>
            <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90">
              Notificarme cuando esté listo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Series;
