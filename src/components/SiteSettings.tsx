
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';

const SiteSettings = () => {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings
  });

  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    logo_url: '',
    ads_code: ''
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        logo_url: settings.logo_url || '',
        ads_code: settings.ads_code || ''
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast({
        title: "Configuración actualizada",
        description: "Los cambios se han guardado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la configuración: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
            <span className="ml-2 text-white">Cargando configuración...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Configuración del Sitio</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site_name" className="text-gray-300">Nombre del Sitio</Label>
              <Input
                id="site_name"
                value={formData.site_name}
                onChange={(e) => setFormData(prev => ({ ...prev, site_name: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Cuevana3"
              />
            </div>
            
            <div>
              <Label htmlFor="logo_url" className="text-gray-300">URL del Logo</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="https://ejemplo.com/logo.png"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="site_description" className="text-gray-300">Descripción del Sitio</Label>
            <Textarea
              id="site_description"
              value={formData.site_description}
              onChange={(e) => setFormData(prev => ({ ...prev, site_description: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
              placeholder="Tu sitio de películas y series favorito"
            />
          </div>
          
          <div>
            <Label htmlFor="ads_code" className="text-gray-300">Código de Anuncios</Label>
            <Textarea
              id="ads_code"
              value={formData.ads_code}
              onChange={(e) => setFormData(prev => ({ ...prev, ads_code: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              rows={4}
              placeholder="Pega aquí tu código de Google AdSense u otros anuncios"
            />
          </div>

          {formData.logo_url && (
            <div>
              <Label className="text-gray-300">Vista previa del logo</Label>
              <div className="mt-2 p-4 bg-gray-800 rounded border border-gray-600">
                <img 
                  src={formData.logo_url} 
                  alt="Preview del logo" 
                  className="max-h-16 max-w-64 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SiteSettings;
