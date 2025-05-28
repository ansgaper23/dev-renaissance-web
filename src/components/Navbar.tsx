
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, Menu, X } from 'lucide-react';
import { getAdminSession, adminLogout } from '@/services/movieService';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/services/settingsService';
import MovieSearch from './MovieSearch';

const Navbar = () => {
  const navigate = useNavigate();
  const adminSession = getAdminSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const handleLogout = () => {
    adminLogout();
    navigate('/');
    window.location.reload();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const siteName = settings?.site_name || 'Cuevana3';
  const logoUrl = settings?.logo_url;

  return (
    <nav className="bg-cuevana-bg/95 backdrop-blur-sm border-b border-cuevana-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName}
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="text-2xl font-bold">
                <span className="text-cuevana-blue">{siteName.split('3')[0] || 'Cuevana'}</span>
                <span className="text-cuevana-white">{siteName.includes('3') ? '3' : ''}</span>
              </div>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-cuevana-white hover:text-cuevana-blue"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-cuevana-white hover:text-cuevana-blue transition-colors font-medium"
            >
              Inicio
            </Link>
            <Link 
              to="/movies" 
              className="text-cuevana-white hover:text-cuevana-blue transition-colors font-medium"
            >
              Películas
            </Link>
            <Link 
              to="/series" 
              className="text-cuevana-white hover:text-cuevana-blue transition-colors font-medium"
            >
              Series
            </Link>
            <Link 
              to="/genres" 
              className="text-cuevana-white hover:text-cuevana-blue transition-colors font-medium"
            >
              Géneros
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <MovieSearch />
          </div>

          {/* User Menu - Desktop - Only show if admin is authenticated */}
          <div className="hidden md:flex items-center space-x-4">
            {adminSession?.authenticated && (
              <div className="flex items-center space-x-2">
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-cuevana-white hover:text-cuevana-blue">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-cuevana-white hover:text-cuevana-blue"
                >
                  Salir
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-cuevana-gray-200 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="px-2">
              <MovieSearch />
            </div>
            
            {/* Mobile Navigation Links */}
            <div className="space-y-2">
              <Link 
                to="/" 
                onClick={closeMobileMenu}
                className="block px-4 py-2 text-cuevana-white hover:text-cuevana-blue hover:bg-cuevana-gray-100 rounded transition-colors font-medium"
              >
                Inicio
              </Link>
              <Link 
                to="/movies" 
                onClick={closeMobileMenu}
                className="block px-4 py-2 text-cuevana-white hover:text-cuevana-blue hover:bg-cuevana-gray-100 rounded transition-colors font-medium"
              >
                Películas
              </Link>
              <Link 
                to="/series" 
                onClick={closeMobileMenu}
                className="block px-4 py-2 text-cuevana-white hover:text-cuevana-blue hover:bg-cuevana-gray-100 rounded transition-colors font-medium"
              >
                Series
              </Link>
              <Link 
                to="/genres" 
                onClick={closeMobileMenu}
                className="block px-4 py-2 text-cuevana-white hover:text-cuevana-blue hover:bg-cuevana-gray-100 rounded transition-colors font-medium"
              >
                Géneros
              </Link>
            </div>

            {/* Mobile User Menu - Only show if admin is authenticated */}
            {adminSession?.authenticated && (
              <div className="border-t border-cuevana-gray-200 pt-4">
                <div className="space-y-2">
                  <Link to="/admin" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start text-cuevana-white hover:text-cuevana-blue">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full justify-start text-cuevana-white hover:text-cuevana-blue"
                  >
                    Salir
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
