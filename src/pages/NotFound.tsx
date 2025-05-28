
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-cuevana-blue">404</h1>
          <p className="text-xl text-cuevana-white/80 mb-6">¡Oops! Página no encontrada</p>
          <p className="text-cuevana-white/60 mb-8">La página que buscas no existe o ha sido movida.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 font-semibold px-8 py-3">
                Volver al Inicio
              </Button>
            </Link>
            <Link to="/movies">
              <Button variant="outline" className="border-cuevana-blue text-cuevana-blue hover:bg-cuevana-blue hover:text-white font-semibold px-8 py-3">
                Ver Películas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
