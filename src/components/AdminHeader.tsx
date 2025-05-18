
import React from 'react';
import { Button } from '@/components/ui/button';
import { adminLogout, getAdminSession } from '@/services/movieService';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AdminHeader = () => {
  const navigate = useNavigate();
  const adminSession = getAdminSession();

  const handleLogout = () => {
    adminLogout();
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente"
    });
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Panel de Administración</h1>
        <p className="text-gray-400 mt-1">
          Gestiona el contenido de tu plataforma de películas | 
          <span className="text-brand-purple ml-1">
            {adminSession?.email}
          </span>
        </p>
      </div>
      <div className="mt-4 lg:mt-0 flex gap-2">
        <Button variant="outline" className="hover:bg-gray-800 border-gray-700" asChild>
          <a href="/">Volver al sitio</a>
        </Button>
        <Button 
          variant="destructive" 
          className="bg-red-500 hover:bg-red-600 text-white" 
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default AdminHeader;
