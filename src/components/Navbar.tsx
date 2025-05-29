
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/services/settingsService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  const logoUrl = settings?.logo_url;
  const siteName = settings?.site_name || 'Cuevana3';
  const hasLogo = logoUrl && logoUrl !== '/placeholder.svg';

  return (
    <nav className="bg-cuevana-bg border-b border-cuevana-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {hasLogo ? (
              <img 
                src={logoUrl} 
                alt={siteName}
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            ) : (
              <span className="text-cuevana-white text-xl font-bold">{siteName}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`text-cuevana-white hover:text-cuevana-blue transition-colors ${
                isActive('/') ? 'text-cuevana-blue' : ''
              }`}
            >
              Inicio
            </Link>
            
            {/* Movies Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`text-cuevana-white hover:text-cuevana-blue hover:bg-transparent flex items-center gap-1 ${
                    location.pathname.includes('/movie') ? 'text-cuevana-blue' : ''
                  }`}
                >
                  Películas
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-cuevana-gray-100 border-cuevana-gray-200 z-50">
                <DropdownMenuItem asChild>
                  <Link to="/movies" className="text-cuevana-white hover:text-cuevana-blue">
                    Últimas publicadas
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/movies?filter=popular" className="text-cuevana-white hover:text-cuevana-blue">
                    Estrenos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/movies?filter=trending" className="text-cuevana-white hover:text-cuevana-blue">
                    Tendencias semana
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/movies?filter=daily" className="text-cuevana-white hover:text-cuevana-blue">
                    Tendencias día
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link 
              to="/genres" 
              className={`text-cuevana-white hover:text-cuevana-blue transition-colors ${
                isActive('/genres') ? 'text-cuevana-blue' : ''
              }`}
            >
              Géneros
            </Link>

            {/* Series Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`text-cuevana-white hover:text-cuevana-blue hover:bg-transparent flex items-center gap-1 ${
                    location.pathname.includes('/series') ? 'text-cuevana-blue' : ''
                  }`}
                >
                  Series
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-cuevana-gray-100 border-cuevana-gray-200 z-50">
                <DropdownMenuItem asChild>
                  <Link to="/series" className="text-cuevana-white hover:text-cuevana-blue">
                    Series
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/series?filter=popular" className="text-cuevana-white hover:text-cuevana-blue">
                    Estrenos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/series?filter=episodes" className="text-cuevana-white hover:text-cuevana-blue">
                    Episodios
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/series?filter=trending" className="text-cuevana-white hover:text-cuevana-blue">
                    Tendencias día
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/series?filter=weekly" className="text-cuevana-white hover:text-cuevana-blue">
                    Tendencias semana
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="flex">
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-cuevana-gray-100 border-cuevana-gray-200 text-cuevana-white placeholder-cuevana-white/60"
              />
              <Button 
                type="submit" 
                className="ml-2 bg-cuevana-blue hover:bg-cuevana-blue/90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-cuevana-white hover:text-cuevana-blue"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-cuevana-gray-200">
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
                to="/genres" 
                className="text-cuevana-white hover:text-cuevana-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Géneros
              </Link>
              <Link 
                to="/series" 
                className="text-cuevana-white hover:text-cuevana-blue transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Series
              </Link>
              
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="flex pt-4">
                <Input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-cuevana-gray-100 border-cuevana-gray-200 text-cuevana-white placeholder-cuevana-white/60"
                />
                <Button 
                  type="submit" 
                  className="ml-2 bg-cuevana-blue hover:bg-cuevana-blue/90"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
