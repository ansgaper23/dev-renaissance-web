
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Settings } from 'lucide-react';
import { getAdminSession, adminLogout } from '@/services/movieService';
import MovieSearch from './MovieSearch';

const Navbar = () => {
  const navigate = useNavigate();
  const adminSession = getAdminSession();

  const handleLogout = () => {
    adminLogout();
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-cuevana-bg/95 backdrop-blur-sm border-b border-cuevana-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold">
              <span className="text-cuevana-blue">Cine</span>
              <span className="text-cuevana-white">Explorer</span>
            </div>
          </Link>

          {/* Navigation Menu */}
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

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <MovieSearch />
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {adminSession?.authenticated ? (
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
            ) : (
              <Link to="/admin/login">
                <Button variant="ghost" size="sm" className="text-cuevana-white hover:text-cuevana-blue">
                  <User className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
