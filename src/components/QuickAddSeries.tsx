
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Json } from '@/integrations/supabase/types';

interface ServerEntry {
  name: string;
  url: string;
  quality?: string;
  language?: string;
  [key: string]: string | undefined;
}

const QuickAddSeries = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<any>(null);
  const [servers, setServers] = useState<ServerEntry[]>([
    { name: 'Servidor 1', url: '', quality: 'HD', language: 'Latino' }
  ]);

  const queryClient = useQueryClient();

  const addSeriesMutation = useMutation({
    mutationFn: async (seriesData: any) => {
      const { data, error } = await supabase
        .from('series')
        .insert(seriesData)
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Serie agregada",
        description: "La serie se ha agregado correctamente",
      });
      setSelectedSeries(null);
      setServers([{ name: 'Servidor 1', url: '', quality: 'HD', language: 'Latino' }]);
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo agregar la serie: ${error.message}`,
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
        body: { query: searchQuery, type: 'tv' }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("TMDB Series Search results:", data);
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching TMDB for series:', error);
      toast({
        title: "Error de búsqueda",
        description: "No se pudo conectar a la API de TMDB. Intente más tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSeries = (series: any) => {
    console.log("Selected series from TMDB:", series);
    setSelectedSeries(series);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddSeries = () => {
    if (!selectedSeries) return;

    const validServers = servers.filter(server => server.url.trim() !== '');
    console.log("Adding series with servers:", validServers);

    // Map genre IDs to genre names
    const genreNames = selectedSeries.genre_ids ? 
      selectedSeries.genre_ids.map((id: number) => {
        const genres: { [key: number]: string } = {
          10759: "Acción y Aventura",
          16: "Animación",
          35: "Comedia",
          80: "Crimen",
          99: "Documental",
          18: "Drama",
          10751: "Familia",
          14: "Fantasía",
          10762: "Infantil",
          9648: "Misterio",
          10763: "Noticias",
          10764: "Reality",
          10765: "Ciencia Ficción y Fantasía",
          10766: "Telenovela",
          10767: "Talk Show",
          10768: "Bélica y Política",
          37: "Western"
        };
        return genres[id];
      }).filter(Boolean) : [];

    const seriesData = {
      title: selectedSeries.name,
      original_title: selectedSeries.original_name,
      tmdb_id: selectedSeries.id,
      poster_path: selectedSeries.poster_path,
      backdrop_path: selectedSeries.backdrop_path,
      overview: selectedSeries.overview,
      first_air_date: selectedSeries.first_air_date,
      rating: selectedSeries.vote_average,
      genres: genreNames,
      stream_servers: validServers as Json,
    };

    addSeriesMutation.mutate(seriesData);
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
        <h3 className="text-xl font-medium mb-4 text-white">Agregar Serie</h3>
        
        {!selectedSeries ? (
          <>
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar serie en TMDB..."
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
                {searchResults.slice(0, 5).map((series) => (
                  <div 
                    key={series.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => handleSelectSeries(series)}
                  >
                    {series.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w92${series.poster_path}`} 
                        alt={series.name} 
                        className="w-12 h-18 rounded object-cover" 
                      />
                    ) : (
                      <div className="w-12 h-18 rounded bg-gray-700 flex items-center justify-center">
                        <span className="text-xs text-gray-500">N/A</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{series.name}</h5>
                      <p className="text-gray-400 text-sm">
                        {series.first_air_date ? series.first_air_date.split('-')[0] : 'Sin fecha'} • 
                        {series.vote_average ? ` ${series.vote_average} ★` : ' Sin calificación'}
                      </p>
                      <p className="text-gray-500 text-xs line-clamp-2">
                        {series.overview || "Sin descripción disponible"}
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
              {selectedSeries.poster_path && (
                <img 
                  src={`https://image.tmdb.org/t/p/w154${selectedSeries.poster_path}`} 
                  alt={selectedSeries.name} 
                  className="w-20 h-30 rounded object-cover" 
                />
              )}
              <div className="flex-1">
                <h4 className="text-white font-bold text-lg">{selectedSeries.name}</h4>
                <p className="text-gray-400">
                  {selectedSeries.first_air_date ? selectedSeries.first_air_date.split('-')[0] : 'Sin fecha'} • 
                  {selectedSeries.vote_average ? ` ${selectedSeries.vote_average} ★` : ' Sin calificación'}
                </p>
                <p className="text-gray-300 text-sm mt-2 line-clamp-3">
                  {selectedSeries.overview || "Sin descripción disponible"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedSeries(null)}
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
                onClick={handleAddSeries}
                disabled={!servers.some(s => s.url.trim() !== '') || addSeriesMutation.isPending}
                className="w-full bg-cuevana-blue hover:bg-cuevana-blue/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                {addSeriesMutation.isPending ? 'Agregando...' : 'Agregar Serie'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickAddSeries;
