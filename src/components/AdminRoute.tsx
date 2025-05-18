
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminSession } from '@/services/movieService';
import { Loader2 } from 'lucide-react';

interface AdminRouteProps {
  element: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ element }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const adminSession = getAdminSession();
        console.log("Admin session check:", adminSession);
        setIsAuthenticated(!!adminSession?.authenticated);
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  console.log("Is authenticated:", isAuthenticated);
  return isAuthenticated ? element : <Navigate to="/admin/login" />;
};

export default AdminRoute;
