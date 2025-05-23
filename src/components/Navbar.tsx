
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film, Tv, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const genres = [
    'Acción', 'Aventura', 'Comedia', 'Drama', 'Terror', 'Ciencia Ficción',
    'Romance', 'Thriller', 'Animación', 'Documentales'
  ];

  return (
    <nav className="bg-cuevana-bg border-b border-cuevana-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Film className="h-8 w-8 text-cuevana-blue" />
            <span className="text-xl font-bold text-cuevana-white">CineExplorer</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/" className="text-cuevana-white hover:text-cuevana-blue transition-colors">
              Inicio
            </Link>
            <div className="relative group">
              <button className="text-cuevana-white hover:text-cuevana-blue transition-colors flex items-center">
                Películas
              </button>
            </div>
            <div className="relative group">
              <button className="text-cuevana-white hover:text-cuevana-blue transition-colors flex items-center">
                Series
              </button>
            </div>
            <div className="relative group">
              <button className="text-cuevana-white hover:text-cuevana-blue transition-colors">
                Géneros
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-cuevana-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {genres.map((genre) => (
                    <Link
                      key={genre}
                      to={`/genre/${genre.toLowerCase()}`}
                      className="text-cuevana-white hover:text-cuevana-blue text-sm py-1 transition-colors"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Buscar películas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-cuevana-gray-100 border-cuevana-gray-200 text-cuevana-white placeholder-gray-400 pr-10"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cuevana-blue"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-cuevana-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-cuevana-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-cuevana-white hover:text-cuevana-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/movies"
                className="text-cuevana-white hover:text-cuevana-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Películas
              </Link>
              <Link
                to="/series"
                className="text-cuevana-white hover:text-cuevana-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Series
              </Link>
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative mt-4">
                <Input
                  type="text"
                  placeholder="Buscar películas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-cuevana-gray-100 border-cuevana-gray-200 text-cuevana-white placeholder-gray-400 pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cuevana-blue"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
