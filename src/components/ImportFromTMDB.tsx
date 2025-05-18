
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, Download, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';

const ImportFromTMDB = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  
  // Search TMDB
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
  
  // Handle movie selection
  const handleToggleSelect = (id: number) => {
    const newSelection = new Set(selectedMovies);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedMovies(newSelection);
  };
  
  // Import selected movies
  const importMoviesMutation = useMutation({
    mutationFn: async (movieIds: number[]) => {
      setIsImporting(true);
      const { data, error } = await supabase.functions.invoke('tmdb-import', {
        body: { movieIds }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Importación exitosa",
        description: `${data.total.success} películas importadas correctamente. ${data.total.failed} fallaron.`,
      });
      
      setSelectedMovies(new Set());
      if (data.total.failed > 0) {
        console.error("Failed imports:", data.errors);
      }
    },
    onError: (error) => {
      toast({
        title: "Error de importación",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsImporting(false);
    }
  });
  
  const handleImport = () => {
    if (selectedMovies.size === 0) {
      toast({
        title: "Selección vacía",
        description: "Selecciona al menos una película para importar",
        variant: "destructive"
      });
      return;
    }
    
    const movieIds = Array.from(selectedMovies);
    importMoviesMutation.mutate(movieIds);
  };
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Importar desde TMDB</h3>
          <p className="text-gray-400">Busca y selecciona películas de The Movie Database para importar a tu sitio.</p>
        </div>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar películas en TMDB..."
                className="pl-10 bg-gray-800 border-gray-700"
              />
            </div>
            <Button 
              type="submit" 
              className="bg-brand-blue hover:bg-brand-blue/90"
              disabled={!searchQuery.trim() || isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : "Buscar"}
            </Button>
          </div>
        </form>
        
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                {selectedMovies.size} películas seleccionadas
              </div>
              <Button 
                onClick={handleImport}
                disabled={selectedMovies.size === 0 || isImporting}
                className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Download size={16} /> Importar seleccionadas
                  </>
                )}
              </Button>
            </div>
            
            <div className="rounded-md border border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="hover:bg-gray-900/90 border-gray-800">
                    <TableHead className="w-12 text-gray-400"></TableHead>
                    <TableHead className="text-gray-400">Título</TableHead>
                    <TableHead className="text-gray-400 hidden md:table-cell">Año</TableHead>
                    <TableHead className="text-gray-400 hidden md:table-cell">Calificación</TableHead>
                    <TableHead className="text-gray-400 text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchResults.map((movie) => (
                    <TableRow key={movie.id} className="hover:bg-gray-900/50 border-gray-800">
                      <TableCell className="pr-0">
                        <input
                          type="checkbox"
                          checked={selectedMovies.has(movie.id)}
                          onChange={() => handleToggleSelect(movie.id)}
                          className="rounded border-gray-700 bg-gray-800 text-brand-purple focus:ring-brand-purple"
                        />
                      </TableCell>
                      <TableCell className="font-medium flex items-center gap-3">
                        {movie.poster_path ? (
                          <img 
                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                            alt={movie.title} 
                            className="h-12 w-8 rounded object-cover hidden sm:block" 
                          />
                        ) : (
                          <div className="h-12 w-8 rounded bg-gray-700 flex items-center justify-center hidden sm:flex">
                            <span className="text-xs text-gray-500">N/A</span>
                          </div>
                        )}
                        <div>
                          <div>{movie.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[180px] md:max-w-[300px] lg:max-w-[400px]">
                            {movie.overview || "Sin descripción disponible"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {movie.release_date ? movie.release_date.split('-')[0] : "N/A"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {movie.vote_average ? `${movie.vote_average} ★` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 text-brand-blue hover:text-brand-purple"
                          onClick={() => {
                            handleToggleSelect(movie.id);
                            toast({
                              title: selectedMovies.has(movie.id) 
                                ? "Película eliminada" 
                                : "Película agregada",
                              description: `${movie.title} se ha ${selectedMovies.has(movie.id) ? "eliminado de" : "agregado a"} la selección`,
                            });
                          }}
                        >
                          <Plus size={16} /> Agregar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-10 text-gray-400 border border-gray-800 rounded-lg">
            No se encontraron resultados para "{searchQuery}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportFromTMDB;
