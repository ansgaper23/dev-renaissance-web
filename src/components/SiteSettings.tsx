
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, Plus, Trash2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    ads_code: '',
    telegram_url: ''
  });
  const [uploading, setUploading] = useState(false);

  // Lista de anuncios (Anuncio 1, Anuncio 2, ...)
  const [adsList, setAdsList] = useState<string[]>(['']);

  React.useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || '',
        site_description: settings.site_description || '',
        logo_url: settings.logo_url || '',
        ads_code: settings.ads_code || '',
        telegram_url: settings.telegram_url || ''
      });

      const raw = settings.ads_code || '';
      const parts = raw.split('<!--AD_SPLIT-->').map(s => s.trim()).filter(Boolean);
      setAdsList(parts.length ? parts : [raw]);
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 2MB",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      
      toast({
        title: "Logo subido",
        description: "El logo se ha subido correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Error al subir el logo: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

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
    const joinedAds = adsList.join('\n<!--AD_SPLIT-->\n');
    updateMutation.mutate({ ...formData, ads_code: joinedAds });
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
              <Label htmlFor="telegram_url" className="text-gray-300">URL de Telegram</Label>
              <Input
                id="telegram_url"
                value={formData.telegram_url}
                onChange={(e) => setFormData(prev => ({ ...prev, telegram_url: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="https://t.me/tu_canal"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Logo del Sitio</Label>
            <div className="space-y-3">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor="logo_url" className="text-gray-400 text-sm">URL del Logo</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_file" className="cursor-pointer">
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={uploading}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-200"
                      onClick={() => document.getElementById('logo_file')?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-1" />
                          Subir Logo
                        </>
                      )}
                    </Button>
                  </Label>
                  <input
                    id="logo_file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">Puedes pegar una URL o subir un archivo (máx. 2MB)</p>
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
            <Label className="text-gray-300">Bloques de Anuncios (múltiples dominios)</Label>
            <p className="text-sm text-gray-400 mb-2">Agrega uno o más códigos de anuncio. Se inyectarán todos; tu red mostrará el que corresponda al dominio.</p>
            <div className="space-y-4">
              {adsList.map((ad, idx) => (
                <div key={idx} className="p-3 bg-gray-800 border border-gray-700 rounded">
                  <Label className="text-gray-400">Anuncio {idx + 1}</Label>
                  <Textarea
                    value={ad}
                    onChange={(e) => {
                      const next = [...adsList];
                      next[idx] = e.target.value;
                      setAdsList(next);
                    }}
                    className="bg-gray-900 border-gray-600 text-white mt-1"
                    rows={4}
                    placeholder="<script>...</script>"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      onClick={() => setAdsList(adsList.filter((_, i) => i !== idx))}
                      disabled={adsList.length <= 1}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-200"
                onClick={() => setAdsList([...adsList, ''])}
              >
                <Plus className="h-4 w-4 mr-1" /> Agregar anuncio
              </Button>
            </div>
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
