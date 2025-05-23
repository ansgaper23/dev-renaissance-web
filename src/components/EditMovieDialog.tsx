
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
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
    };
    
    updateMovieMutation.mutate(updateData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Película</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="stream_url" className="text-white">URL del Stream</Label>
            <Input 
              id="stream_url" 
              value={formData.stream_url}
              onChange={handleChange}
              placeholder="Enlace del servidor de reproducción"
              className="bg-gray-800 border-gray-700 text-white"
            />
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
