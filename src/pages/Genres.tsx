
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';

const Genres = () => {
  const genres = [
    { id: 1, name: 'Acción', icon: '💥', count: 245 },
    { id: 2, name: 'Aventura', icon: '🗺️', count: 189 },
    { id: 3, name: 'Comedia', icon: '😂', count: 156 },
    { id: 4, name: 'Drama', icon: '🎭', count: 298 },
    { id: 5, name: 'Horror', icon: '👻', count: 87 },
    { id: 6, name: 'Romance', icon: '💕', count: 134 },
    { id: 7, name: 'Ciencia Ficción', icon: '🚀', count: 123 },
    { id: 8, name: 'Suspenso', icon: '🔍', count: 176 },
    { id: 9, name: 'Animación', icon: '🎨', count: 98 },
    { id: 10, name: 'Fantasía', icon: '🦄', count: 112 },
    { id: 11, name: 'Crimen', icon: '🔫', count: 145 },
    { id: 12, name: 'Documental', icon: '📹', count: 67 },
  ];

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Géneros</h1>
          <p className="text-cuevana-white/80 text-lg">Explora películas por categoría</p>
        </div>

        {/* Genres Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {genres.map((genre) => (
            <Link 
              key={genre.id} 
              to={`/genre/${genre.id}`} 
              className="group"
            >
              <div className="bg-cuevana-gray-100 rounded-lg p-6 border border-cuevana-gray-200 hover:border-cuevana-blue transition-all duration-300 hover:bg-cuevana-gray-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">{genre.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-cuevana-blue transition-colors">
                    {genre.name}
                  </h3>
                  <p className="text-cuevana-white/70 text-sm">
                    {genre.count} películas
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured Genre Section */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-cuevana-blue to-cuevana-blue/80 rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿No encuentras lo que buscas?</h2>
            <p className="text-lg mb-6 opacity-90">
              Usa nuestro buscador avanzado para encontrar exactamente lo que quieres ver
            </p>
            <Link to="/movies">
              <Button className="bg-white text-cuevana-blue hover:bg-gray-100 font-semibold px-8 py-3">
                Explorar todas las películas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Genres;
