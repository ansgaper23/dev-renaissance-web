import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importMovieFromTMDB, importMovieFromIMDBWithOMDb } from '@/services/movieService';
import { toast } from '@/hooks/use-toast';
import { Search, Download, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServerEntry {
  name: string;
  url: string;
  quality?: string;
  language?: string;
}

const QuickAddMovie = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [imdbId, setImdbId] = useState('');
  const [searchMode, setSearchMode] = useState<'tmdb' | 'imdb-tmdb' | 'imdb-omdb'>('tmdb');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [servers, setServers] = useState<ServerEntry[]>([
    { name: 'Servidor 1', url: '', quality: 'HD', language: 'Latino' }
  ]);

  const queryClient = useQueryClient();

  const addMovieMutation = useMutation({
    mutationFn: ({ movie, streamServers }: { movie: any, streamServers: ServerEntry[] }) => 
      importMovieFromTMDB(movie, streamServers),
    onSuccess: () => {
      toast({
        title: "Película agregada",
        description: "La película se ha agregado correctamente",
      });
      setSelectedMovie(null);
      setServers([{ name: 'Servidor 1', url: '', quality: 'HD', language: 'Latino' }]);
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

  const addMovieFromOMDbMutation = useMutation({
    mutationFn: ({ imdbId, streamServers }: { imdbId: string, streamServers: ServerEntry[] }) => 
      importMovieFromIMDBWithOMDb(imdbId, streamServers),
    onSuccess: () => {
      toast({
        title: "Película agregada desde OMDb",
        description: "La película se ha agregado correctamente usando OMDb",
      });
      setSelectedMovie(null);
      setServers([{ name: 'Servidor 1', url: '', quality: 'HD', language: 'Latino' }]);
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo agregar la película desde OMDb: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchMode === 'tmdb') {
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('tmdb-search', {
          body: { query: searchQuery }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        console.log("TMDB Search results:", data);
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
    } else if (searchMode === 'imdb-tmdb') {
      // IMDB search via TMDB
      if (!imdbId.trim()) return;
      
      setIsSearching(true);
      
      try {
        const { searchMovieByIMDBId } = await import('@/services/movieService');
        const movieData = await searchMovieByIMDBId(imdbId);
        console.log("IMDB Search result via TMDB:", movieData);
        setSelectedMovie(movieData);
        setImdbId('');
      } catch (error) {
        console.error('Error searching IMDB via TMDB:', error);
        toast({
          title: "Error de búsqueda IMDB (TMDB)",
          description: "No se pudo encontrar la película con ese IMDB ID en TMDB. Verifique el ID e intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    } else if (searchMode === 'imdb-omdb') {
      // IMDB search via OMDb
      if (!imdbId.trim()) return;
      
      setIsSearching(true);
      
      try {
        const { searchMovieByIMDBIdOMDb, convertOMDbToMovie } = await import('@/services/omdbService');
        const omdbData = await searchMovieByIMDBIdOMDb(imdbId);
        const movieData = convertOMDbToMovie(omdbData);
        console.log("IMDB Search result via OMDb:", movieData);
        setSelectedMovie({ ...movieData, source: 'omdb' });
        setImdbId('');
      } catch (error) {
        console.error('Error searching IMDB via OMDb:', error);
        toast({
          title: "Error de búsqueda IMDB (OMDb)",
          description: "No se pudo encontrar la película con ese IMDB ID en OMDb. Verifique el ID e intente nuevamente.",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelectMovie = async (movie: any) => {
    console.log("Selected movie from TMDB:", movie);
    
    // Get detailed movie info including runtime
    try {
      const { data: detailedMovie, error } = await supabase.functions.invoke('tmdb-import', {
        body: { tmdb_id: movie.id }
      });
      
      if (error) {
        console.error("Error getting detailed movie:", error);
        setSelectedMovie(movie);
      } else {
        console.log("Detailed movie data:", detailedMovie);
        setSelectedMovie(detailedMovie);
      }
    } catch (error) {
      console.error("Error getting detailed movie:", error);
      setSelectedMovie(movie);
    }
    
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddMovie = () => {
    if (!selectedMovie) return;

    const validServers = servers.filter(server => server.url.trim() !== '');
    console.log("Adding movie with servers:", validServers);

    if (selectedMovie.source === 'omdb') {
      // Use OMDb import
      const imdbIdFromSelection = selectedMovie.imdb_id || imdbId;
      addMovieFromOMDbMutation.mutate({ 
        imdbId: imdbIdFromSelection, 
        streamServers: validServers 
      });
    } else {
      // Use TMDB import
      addMovieMutation.mutate({ 
        movie: selectedMovie, 
        streamServers: validServers 
      });
    }
  };

  const addServer = () => {
    setServers(prev => [...prev, { 
      name: `Servidor ${prev.length + 1}`, 
      url: '', 
      quality: 'HD', 
      language: 'Latino' 
    }]);
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
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <h3 className="text-xl font-medium mb-4 text-white">Agregar Película Rápido</h3>
        
        {!selectedMovie ? (
          <>
            {/* Search Mode Toggle */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button
                type="button"
                onClick={() => setSearchMode('tmdb')}
                className={`${searchMode === 'tmdb' ? 'bg-cuevana-blue' : 'bg-gray-700'} hover:bg-cuevana-blue/90`}
              >
                Buscar en TMDB
              </Button>
              <Button
                type="button"
                onClick={() => setSearchMode('imdb-tmdb')}
                className={`${searchMode === 'imdb-tmdb' ? 'bg-cuevana-blue' : 'bg-gray-700'} hover:bg-cuevana-blue/90`}
              >
                IMDB → TMDB
              </Button>
              <Button
                type="button"
                onClick={() => setSearchMode('imdb-omdb')}
                className={`${searchMode === 'imdb-omdb' ? 'bg-cuevana-blue' : 'bg-gray-700'} hover:bg-cuevana-blue/90`}
              >
                IMDB → OMDb
              </Button>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  {searchMode === 'tmdb' ? (
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar película en TMDB..."
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  ) : (
                    <Input
                      value={imdbId}
                      onChange={(e) => setImdbId(e.target.value)}
                      placeholder="Ej: tt5950044"
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="bg-cuevana-blue hover:bg-cuevana-blue/90"
                  disabled={searchMode === 'tmdb' ? (!searchQuery.trim() || isSearching) : (!imdbId.trim() || isSearching)}
                >
                  {isSearching ? 'Buscando...' : (searchMode === 'tmdb' ? 'Buscar' : 'Importar')}
                </Button>
              </div>
              {searchMode !== 'tmdb' && (
                <p className="text-gray-400 text-xs mt-2">
                  Ingrese el ID de IMDB (ejemplo: tt5950044) - {searchMode === 'imdb-tmdb' ? 'usando TMDB' : 'usando OMDb'}
                </p>
              )}
            </form>

            {/* Search Results - solo para TMDB */}
            {searchMode === 'tmdb' && searchResults.length > 0 && (
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
                  {selectedMovie.runtime && ` • ${selectedMovie.runtime} min`}
                </p>
                {selectedMovie.genres && selectedMovie.genres.length > 0 && (
                  <p className="text-gray-300 text-sm">
                    {selectedMovie.genres.map((g: any) => g.name).join(', ')}
                  </p>
                )}
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
              <div className="flex items-center justify-between">
                <h5 className="text-white font-medium">Enlaces de Servidores:</h5>
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
                    <h6 className="text-white font-medium">Servidor {index + 1}</h6>
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

              <Button 
                onClick={handleAddMovie}
                disabled={addMovieMutation.isPending || !servers.some(s => s.url.trim() !== '')}
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
