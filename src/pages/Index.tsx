
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MovieGrid from '@/components/MovieGrid';
import FeaturedMovie from '@/components/FeaturedMovie';
import { Search } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white pb-12">
      {/* Hero Section with Featured Movie */}
      <FeaturedMovie />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 mt-8">
        {/* Search & Categories Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Películas Populares</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar películas..." 
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-purple"
              />
            </div>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              Categorías
            </Button>
          </div>
        </div>

        {/* Movie Grid */}
        <MovieGrid />

        {/* Admin Access */}
        <Card className="mt-16 bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold gradient-text">Panel de Administración</h3>
                <p className="text-gray-400 mt-2">Gestiona el contenido de la plataforma</p>
              </div>
              <Link to="/admin">
                <Button className="bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90">
                  Acceder al Panel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
