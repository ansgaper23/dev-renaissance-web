
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateMovie, Movie } from '@/services/movieService';
import { toast } from '@/hooks/use-toast';

interface EditMovieDialogProps {
  movie: {
    id: string;
    title: string;
    poster: string | null;
    year: string | number;
    rating: string | number;
  };
}

interface ServerEntry {
  name: string;
  url: string;
  quality?: string;
  language?: string;
}

const EditMovieDialog = ({ movie }: EditMovieDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: movie.title,
    release_date: '',
    poster_path: movie.poster || '',
    backdrop_path: '',
    overview: '',
    rating: movie.rating?.toString() || '',
    runtime: '',
    trailer_url: '',
    stream_url: '',
    genres: [] as string[]
  });

  const [servers, setServers] = useState<ServerEntry[]>([
    { name: 'Servidor 1', url: '', quality: 'HD', language: 'Latino' }
  ]);

  const queryClient = useQueryClient();

  const updateMovieMutation = useMutation({
    mutationFn: (data: Partial<Movie>) => updateMovie(movie.id, data),
    onSuccess: () => {
      toast({
        title: "Película actualizada",
        description: "La película se ha actualizado correctamente",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo actualizar la película: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...formData,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      runtime: formData.runtime ? parseInt(formData.runtime) : null,
      release_date: formData.release_date || null,
      stream_servers: servers.filter(server => server.url.trim() !== ''),
    };
    
    updateMovieMutation.mutate(updateData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const addServer = () => {
    setServers(prev => [...prev, { name: `Servidor ${prev.length + 1}`, url: '', quality: 'HD', language: 'Latino' }]);
  };

  const removeServer = (index: number) => {
    setServers(prev => prev.filter((_, i) => i !== index));
  };

  const updateServer = (index: number, field: keyof ServerEntry, value: string) => {
    setServers(prev => prev.map((server, i) => 
      i === index ? { ...server, [field]: value } : server
    ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Película</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Título</Label>
              <Input 
                id="title" 
                value={formData.title}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="release_date" className="text-white">Fecha de estreno</Label>
              <Input 
                id="release_date" 
                type="date"
                value={formData.release_date}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poster_path" className="text-white">URL del Póster</Label>
              <Input 
                id="poster_path" 
                value={formData.poster_path}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-white">Calificación</Label>
              <Input 
                id="rating" 
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="runtime" className="text-white">Duración (minutos)</Label>
              <Input 
                id="runtime" 
                type="number"
                value={formData.runtime}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trailer_url" className="text-white">URL del Trailer</Label>
              <Input 
                id="trailer_url" 
                value={formData.trailer_url}
                onChange={handleChange}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="overview" className="text-white">Sinopsis</Label>
            <Textarea 
              id="overview" 
              value={formData.overview}
              onChange={handleChange}
              className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
            />
          </div>
          
          {/* Servidores de Video */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white text-lg font-medium">Servidores de Video</Label>
              <Button
                type="button"
                onClick={addServer}
                className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servidor
              </Button>
            </div>
            
            {servers.map((server, index) => (
              <div key={index} className="border border-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Servidor {index + 1}</h4>
                  {servers.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeServer(index)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Nombre del Servidor</Label>
                    <Input
                      value={server.name}
                      onChange={(e) => updateServer(index, 'name', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Ej: Servidor HD"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white text-sm">URL del Video</Label>
                    <Input
                      value={server.url}
                      onChange={(e) => updateServer(index, 'url', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Calidad</Label>
                    <Input
                      value={server.quality || ''}
                      onChange={(e) => updateServer(index, 'quality', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="HD, 720p, 480p"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white text-sm">Idioma</Label>
                    <Input
                      value={server.language || ''}
                      onChange={(e) => updateServer(index, 'language', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="Latino, Subtitulado, Español"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-cuevana-blue hover:bg-cuevana-blue/90"
              disabled={updateMovieMutation.isPending}
            >
              {updateMovieMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMovieDialog;
