
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { adminLogin, AdminCredentials, getAdminSession } from '@/services/movieService';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState<AdminCredentials>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const session = getAdminSession();
    if (session?.authenticated) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user changes input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", credentials.email);
      await adminLogin(credentials);
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al panel de administración"
      });
      navigate('/admin');
    } catch (error) {
      console.error("Login error:", error);
      setError('Credenciales inválidas. Intente nuevamente.');
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales inválidas. Intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center border-b border-gray-800 pb-6">
          <CardTitle className="text-2xl font-bold gradient-text">Panel de Administración</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-900 rounded-md text-red-200 text-sm mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Correo Electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="admin@ejemplo.com"
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="bg-gray-800 border-gray-700"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t border-gray-800 pt-4 text-center text-xs text-gray-500">
          Acceso exclusivo para administradores
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLogin;
