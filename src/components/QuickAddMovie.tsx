
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMovie, MovieCreate } from '@/services/movieService';
import { toast } from '@/hooks/use-toast';
import { Search, Download, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const QuickAddMovie = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [streamUrls, setStreamUrls] = useState({
    latino: '',
    subtitulado: '',
    original: ''
  });

  const queryClient = useQueryClient();

  const addMovieMutation = useMutation({
    mutationFn: addMovie,
    onSuccess: () => {
      toast({
        title: "Película agregada",
        description: "La película se ha agregado correctamente",
      });
      setSelectedMovie(null);
      setStreamUrls({ latino: '', subtitulado: '', original: '' });
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('tmdb-search', {
        body: { query: searchQuery }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching TMDB:', error);
      toast({
        title: "Error de búsqueda",
        description: "No se pudo conectar a la API de TMDB. Intente más tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectMovie = (movie: any) => {
    setSelectedMovie(movie);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddMovie = () => {
    if (!selectedMovie) return;

    const movieData: MovieCreate = {
      title: selectedMovie.title,
      original_title: selectedMovie.original_title,
      tmdb_id: selectedMovie.id,
      poster_path: selectedMovie.poster_path,
      backdrop_path: selectedMovie.backdrop_path,
      overview: selectedMovie.overview,
      release_date: selectedMovie.release_date,
      rating: selectedMovie.vote_average,
      stream_url: JSON.stringify(streamUrls), // Guardar como JSON
      genre_ids: selectedMovie.genre_ids || []
    };

    addMovieMutation.mutate(movieData);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-4 text-white">Agregar Película Rápido</h3>
        
        {!selectedMovie ? (
          <>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar película en TMDB..."
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="bg-cuevana-blue hover:bg-cuevana-blue/90"
                  disabled={!searchQuery.trim() || isSearching}
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="text-white font-medium">Resultados:</h4>
                {searchResults.slice(0, 5).map((movie) => (
                  <div 
                    key={movie.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSelectMovie(movie)}
                  >
                    {movie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                        alt={movie.title} 
                        className="w-12 h-18 rounded object-cover" 
                      />
                    ) : (
                      <div className="w-12 h-18 rounded bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-500">N/A</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{movie.title}</h5>
                      <p className="text-gray-400 text-sm">
                        {movie.release_date ? movie.release_date.split('-')[0] : 'Sin fecha'} • 
                        {movie.vote_average ? ` ${movie.vote_average} ★` : ' Sin calificación'}
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-2">
                        {movie.overview || "Sin descripción disponible"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-800 rounded">
              {selectedMovie.poster_path && (
                <img 
                  src={`https://image.tmdb.org/t/p/w154${selectedMovie.poster_path}`} 
                  alt={selectedMovie.title} 
                  className="w-20 h-30 rounded object-cover" 
                />
              )}
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg">{selectedMovie.title}</h4>
                <p className="text-gray-400">
                  {selectedMovie.release_date ? selectedMovie.release_date.split('-')[0] : 'Sin fecha'} • 
                  {selectedMovie.vote_average ? ` ${selectedMovie.vote_average} ★` : ' Sin calificación'}
                </p>
                <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                  {selectedMovie.overview || "Sin descripción disponible"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedMovie(null)}
                className="border-gray-600 text-gray-300"
              >
                Cambiar
              </Button>
            </div>

            <div className="space-y-4">
              <h5 className="text-white font-medium">Enlaces de Servidores:</h5>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="latino" className="text-white">Español Latino</Label>
                  <Input 
                    id="latino"
                    value={streamUrls.latino}
                    onChange={(e) => setStreamUrls(prev => ({ ...prev, latino: e.target.value }))}
                    placeholder="https://servidor.com/pelicula-latino"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="subtitulado" className="text-white">Subtitulado</Label>
                  <Input 
                    id="subtitulado"
                    value={streamUrls.subtitulado}
                    onChange={(e) => setStreamUrls(prev => ({ ...prev, subtitulado: e.target.value }))}
                    placeholder="https://servidor.com/pelicula-sub"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="original" className="text-white">Idioma Original</Label>
                  <Input 
                    id="original"
                    value={streamUrls.original}
                    onChange={(e) => setStreamUrls(prev => ({ ...prev, original: e.target.value }))}
                    placeholder="https://servidor.com/pelicula-original"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddMovie}
                disabled={addMovieMutation.isPending || (!streamUrls.latino && !streamUrls.subtitulado && !streamUrls.original)}
                className="w-full bg-cuevana-blue hover:bg-cuevana-blue/90"
              >
                {addMovieMutation.isPending ? 'Agregando...' : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Película
                  </>
                )}
              </Button>
              
              <p className="text-gray-400 text-xs text-center">
                Agrega al menos un enlace de servidor para continuar
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickAddMovie;
