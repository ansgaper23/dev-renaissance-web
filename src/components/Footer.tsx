
import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-cuevana-gray-100 border-t border-cuevana-gray-200 text-cuevana-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Film className="h-8 w-8 text-cuevana-blue" />
              <span className="text-xl font-bold text-cuevana-white">Cuevana3</span>
            </Link>
            <p className="text-cuevana-white/70 mb-4">
              Explora miles de películas y series online. Contenido de calidad con licencias apropiadas para tu entretenimiento.
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

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cuevana-blue">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-cuevana-white/70">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">info@cuevana3.com</span>
              </li>
              <li className="flex items-center text-cuevana-white/70">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center text-cuevana-white/70">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Ciudad, País</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cuevana-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-cuevana-white/70 text-sm mb-4 md:mb-0">
              © {currentYear} Cuevana3. Todos los derechos reservados.
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
