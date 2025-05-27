
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSeries } from '@/services/seriesService';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Series {
  id: string;
  title: string;
  original_title?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  first_air_date?: string;
  rating?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status?: string;
  genres?: string[];
  stream_servers?: Array<{
    name: string;
    url: string;
    language?: string;
  }>;
}

interface EditSeriesDialogProps {
  series: Series;
  onClose: () => void;
}

const EditSeriesDialog = ({ series, onClose }: EditSeriesDialogProps) => {
  const [formData, setFormData] = useState({
    title: series.title || '',
    original_title: series.original_title || '',
    poster_path: series.poster_path || '',
    backdrop_path: series.backdrop_path || '',
    overview: series.overview || '',
    first_air_date: series.first_air_date || '',
    rating: series.rating || 0,
    number_of_seasons: series.number_of_seasons || 0,
    number_of_episodes: series.number_of_episodes || 0,
    status: series.status || '',
    genres: series.genres || [],
  });

  const [streamServers, setStreamServers] = useState(
    series.stream_servers || [{ name: '', url: '', language: 'Español Latino' }]
  );

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return updateSeries(series.id, {
        ...data,
        stream_servers: streamServers.filter(server => server.name && server.url),
      });
    },
    onSuccess: () => {
      toast({
        title: "Serie actualizada",
        description: "La serie se ha actualizado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['series'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la serie: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addStreamServer = () => {
    setStreamServers(prev => [...prev, { name: '', url: '', language: 'Español Latino' }]);
  };

  const removeStreamServer = (index: number) => {
    setStreamServers(prev => prev.filter((_, i) => i !== index));
  };

  const updateStreamServer = (index: number, field: string, value: string) => {
    setStreamServers(prev => prev.map((server, i) => 
      i === index ? { ...server, [field]: value } : server
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle>Editar Serie: {series.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="bg-gray-800 border-gray-600"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="original_title">Título Original</Label>
              <Input
                id="original_title"
                value={formData.original_title}
                onChange={(e) => handleInputChange('original_title', e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="poster_path">URL del Poster</Label>
              <Input
                id="poster_path"
                value={formData.poster_path}
                onChange={(e) => handleInputChange('poster_path', e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="backdrop_path">URL del Backdrop</Label>
              <Input
                id="backdrop_path"
                value={formData.backdrop_path}
                onChange={(e) => handleInputChange('backdrop_path', e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="first_air_date">Fecha de Estreno</Label>
              <Input
                id="first_air_date"
                type="date"
                value={formData.first_air_date}
                onChange={(e) => handleInputChange('first_air_date', e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="rating">Calificación</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', parseFloat(e.target.value))}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="number_of_seasons">Número de Temporadas</Label>
              <Input
                id="number_of_seasons"
                type="number"
                min="0"
                value={formData.number_of_seasons}
                onChange={(e) => handleInputChange('number_of_seasons', parseInt(e.target.value))}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <div>
              <Label htmlFor="number_of_episodes">Número de Episodios</Label>
              <Input
                id="number_of_episodes"
                type="number"
                min="0"
                value={formData.number_of_episodes}
                onChange={(e) => handleInputChange('number_of_episodes', parseInt(e.target.value))}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="status">Estado</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="bg-gray-800 border-gray-600"
                placeholder="En emisión, Finalizada, Cancelada, etc."
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="overview">Sinopsis</Label>
            <Textarea
              id="overview"
              value={formData.overview}
              onChange={(e) => handleInputChange('overview', e.target.value)}
              className="bg-gray-800 border-gray-600"
              rows={4}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Servidores de Streaming</Label>
              <Button type="button" onClick={addStreamServer} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servidor
              </Button>
            </div>
            
            {streamServers.map((server, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3 p-3 border border-gray-700 rounded">
                <Input
                  placeholder="Nombre del servidor"
                  value={server.name}
                  onChange={(e) => updateStreamServer(index, 'name', e.target.value)}
                  className="bg-gray-800 border-gray-600"
                />
                <Input
                  placeholder="URL del servidor"
                  value={server.url}
                  onChange={(e) => updateStreamServer(index, 'url', e.target.value)}
                  className="bg-gray-800 border-gray-600"
                />
                <select
                  value={server.language}
                  onChange={(e) => updateStreamServer(index, 'language', e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="Español Latino">Español Latino</option>
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                  <option value="Subtitulado">Subtitulado</option>
                </select>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeStreamServer(index)}
                  disabled={streamServers.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Serie'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSeriesDialog;
