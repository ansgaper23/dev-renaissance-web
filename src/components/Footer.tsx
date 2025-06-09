
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/services/settingsService';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const logoUrl = settings?.logo_url || '/placeholder.svg';
  const siteName = settings?.site_name || 'Cuevana3';

  return (
    <footer className="bg-cuevana-gray-100 border-t border-cuevana-gray-200 text-cuevana-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img 
                src={logoUrl} 
                alt={siteName}
                className="h-8 w-auto"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <span className="text-xl font-bold text-cuevana-white">{siteName}</span>
            </Link>
            <p className="text-cuevana-white/70 mb-4">
              La mejor plataforma para ver películas y series online gratis en HD. Contenido actualizado diariamente con los últimos estrenos y clásicos del cine.
            </p>
            <div className="flex items-center text-cuevana-white/70">
              <Heart className="h-4 w-4 mr-2 text-cuevana-gold" />
              <span className="text-sm">Hecho con amor para cinéfilos</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cuevana-blue">Navegación</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Películas
                </Link>
              </li>
              <li>
                <Link to="/series" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Series
                </Link>
              </li>
              <li>
                <Link to="/genres" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Géneros
                </Link>
              </li>
              <li>
                <Link to="/latest" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Últimas
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cuevana-blue">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-cuevana-white/70 hover:text-cuevana-blue transition-colors">
                  Aviso DMCA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cuevana-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-cuevana-white/70 text-sm mb-4 md:mb-0">
              © {currentYear} {siteName}. Todos los derechos reservados.
            </div>
            <div className="bg-cuevana-gray-200 text-cuevana-white text-xs px-4 py-2 rounded-full">
              🚨 Este sitio no aloja ningún video. Todo el contenido proviene de fuentes públicas.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
