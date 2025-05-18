
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import ImportFromTMDB from '@/components/ImportFromTMDB';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Upload } from 'lucide-react';
import MovieTableConnector from '@/components/MovieTableConnector';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMovie } from '@/services/movieService';

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newMovie, setNewMovie] = useState({
    title: '',
    release_date: '',
    poster_path: '',
    backdrop_path: '',
    genres: [],
    runtime: null,
    rating: null,
    overview: '',
    trailer_url: '',
    stream_url: ''
  });
  
  const queryClient = useQueryClient();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewMovie(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const addMovieMutation = useMutation({
    mutationFn: addMovie,
    onSuccess: () => {
      toast({
        title: "Película agregada",
        description: "La película se ha agregado correctamente",
      });
      setNewMovie({
        title: '',
        release_date: '',
        poster_path: '',
        backdrop_path: '',
        genres: [],
        runtime: null,
        rating: null,
        overview: '',
        trailer_url: '',
        stream_url: ''
      });
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo agregar la película: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMovie.title.trim()) {
      toast({
        title: "Error",
        description: "El título es obligatorio",
        variant: "destructive"
      });
      return;
    }
    
    // Convert string fields to appropriate types
    const movieData = {
      ...newMovie,
      rating: newMovie.rating ? parseFloat(newMovie.rating as unknown as string) : null,
      runtime: newMovie.runtime ? parseInt(newMovie.runtime as unknown as string) : null,
      release_date: newMovie.release_date || null,
      genres: newMovie.genres || []
    };
    
    addMovieMutation.mutate(movieData);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Panel de Administración</h1>
            <p className="text-gray-400 mt-1">Gestiona el contenido de tu plataforma de películas</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Button variant="outline" className="hover:bg-gray-800 border-gray-700">
              Volver al sitio
            </Button>
          </div>
        </div>

        <Tabs defaultValue="movies" className="space-y-6">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="movies" className="data-[state=active]:bg-gray-800">
              Películas
            </TabsTrigger>
            <TabsTrigger value="add-movie" className="data-[state=active]:bg-gray-800">
              Agregar película
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-gray-800">
              Importar de TMDB
            </TabsTrigger>
          </TabsList>
          
          {/* Movies Tab */}
          <TabsContent value="movies" className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input 
                  placeholder="Buscar películas..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-900 border-gray-800 w-full md:w-80"
                />
              </div>
              <Button className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2">
                <Plus size={16} /> Agregar película
              </Button>
            </div>
            
            <MovieTableConnector searchTerm={searchTerm} />
          </TabsContent>
          
          {/* Add Movie Tab */}
          <TabsContent value="add-movie">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <form onSubmit={handleAddMovie} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input 
                        id="title" 
                        placeholder="Título de la película" 
                        className="bg-gray-800 border-gray-700"
                        value={newMovie.title}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="release_date">Año</Label>
                      <Input 
                        id="release_date" 
                        placeholder="YYYY-MM-DD" 
                        type="date" 
                        className="bg-gray-800 border-gray-700"
                        value={newMovie.release_date}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="poster_path">URL del Póster</Label>
                      <Input 
                        id="poster_path" 
                        placeholder="https://..." 
                        className="bg-gray-800 border-gray-700"
                        value={newMovie.poster_path}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="backdrop_path">URL del Fondo</Label>
                      <Input 
                        id="backdrop_path" 
                        placeholder="https://..." 
                        className="bg-gray-800 border-gray-700"
                        value={newMovie.backdrop_path}
                        onChange={handleChange} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="genres">Género</Label>
                      <Input 
                        id="genres" 
                        placeholder="Acción, Aventura, etc." 
                        className="bg-gray-800 border-gray-700"
                        onChange={(e) => {
                          setNewMovie(prev => ({
                            ...prev,
                            genres: e.target.value.split(',').map(item => item.trim())
                          }));
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="runtime">Duración (minutos)</Label>
                      <Input 
                        id="runtime" 
                        placeholder="120" 
                        type="number"
                        className="bg-gray-800 border-gray-700"
                        value={newMovie.runtime || ''}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="rating">Calificación</Label>
                      <Input 
                        id="rating" 
                        placeholder="4.5" 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="10"
                        className="bg-gray-800 border-gray-700"
                        value={newMovie.rating || ''}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trailer_url">URL del Trailer</Label>
                      <Input 
                        id="trailer_url" 
                        placeholder="https://youtube.com/..." 
                        className="bg-gray-800 border-gray-700"
                        value={newMovie.trailer_url}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="overview">Descripción</Label>
                    <Textarea 
                      id="overview" 
                      placeholder="Descripción de la película..." 
                      className="bg-gray-800 border-gray-700 min-h-[120px]"
                      value={newMovie.overview}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="stream_url">URL del Stream</Label>
                    <Input 
                      id="stream_url" 
                      placeholder="https://..." 
                      className="bg-gray-800 border-gray-700"
                      value={newMovie.stream_url}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90"
                    disabled={addMovieMutation.isPending}
                  >
                    {addMovieMutation.isPending ? 'Guardando...' : 'Guardar película'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Import Tab */}
          <TabsContent value="import">
            <ImportFromTMDB />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
