import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSeries, type SeriesCreate } from '@/services/seriesService';
import { Search, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServerEntry {
  name: string;
  url: string;
  quality: string;
  language: string;
}

interface TMDBSeries {
  id: number;
  name: string;
  original_name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
}

const GENRE_MAP: { [key: number]: string } = {
  10759: "Acción y Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  14: "Fantasía",
  36: "Historia",
  27: "Horror",
  10762: "Infantil",
  9648: "Misterio",
  10763: "Noticias",
  10764: "Reality",
  878: "Ciencia ficción",
  10766: "Telenovela",
  10767: "Talk",
  10768: "Guerra y Política",
  37: "Western"
};

const QuickAddSeries = () => {
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [firstAirDate, setFirstAirDate] = useState('');
  const [rating, setRating] = useState('');
  const [genres, setGenres] = useState('');
  const [servers, setServers] = useState<ServerEntry[]>([]);
  const [posterPath, setPosterPath] = useState('');
  const [backdropPath, setBackdropPath] = useState('');
  
  // TMDB Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBSeries[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<TMDBSeries | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (seriesData: SeriesCreate) => {
      console.log("Mutation function called with:", seriesData);
      return addSeries(seriesData);
    },
    onSuccess: () => {
      toast({
        title: "Serie agregada",
        description: "La serie se ha agregado correctamente.",
      });
      
      // Reset form
      setTitle('');
      setOriginalTitle('');
      setOverview('');
      setFirstAirDate('');
      setRating('');
      setGenres('');
      setServers([]);
      setPosterPath('');
      setBackdropPath('');
      setSelectedSeries(null);
      
      // Invalidate queries to refresh the series list
      queryClient.invalidateQueries({ queryKey: ['totalSeries'] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la serie. " + error.message,
        variant: "destructive"
      });
    }
  });

  const addServer = () => {
    setServers([...servers, { name: '', url: '', quality: 'HD', language: 'Latino' }]);
  };

  const updateServer = (index: number, field: keyof ServerEntry, value: string) => {
    const updatedServers = servers.map((server, i) => 
      i === index ? { ...server, [field]: value } : server
    );
    setServers(updatedServers);
  };

  const removeServer = (index: number) => {
    setServers(servers.filter((_, i) => i !== index));
  };

  const searchTMDB = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('tmdb-search', {
        body: { query: searchQuery, type: 'tv' }
      });
      
      if (error) throw error;
      
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Error searching TMDB:', error);
      toast({
        title: "Error de búsqueda",
        description: "No se pudo buscar en TMDB",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectSeriesFromTMDB = (series: TMDBSeries) => {
    console.log("Selected series from TMDB:", series);
    setSelectedSeries(series);
    setTitle(series.name);
    setOriginalTitle(series.original_name);
    setOverview(series.overview);
    setFirstAirDate(series.first_air_date);
    setRating(series.vote_average.toString());
    
    // Map genre IDs to genre names
    const genreNames = series.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean);
    setGenres(genreNames.join(', '));
    
    setPosterPath(series.poster_path);
    setBackdropPath(series.backdrop_path);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "El título es requerido",
        variant: "destructive"
      });
      return;
    }

    console.log("Adding series with servers:", servers);

    const seriesData: SeriesCreate = {
      title: title.trim(),
      original_title: originalTitle.trim() || undefined,
      overview: overview.trim() || undefined,
      first_air_date: firstAirDate || undefined,
      rating: rating ? parseFloat(rating) : undefined,
      genres: genres ? genres.split(',').map(g => g.trim()).filter(Boolean) : undefined,
      poster_path: posterPath || undefined,
      backdrop_path: backdropPath || undefined,
      stream_servers: servers.filter(server => server.url.trim() !== '') as any,
      ...(selectedSeries && { tmdb_id: selectedSeries.id })
    };

    console.log("Final series data to send:", seriesData);
    mutation.mutate(seriesData);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Agregar Serie Rápidamente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* TMDB Search */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar serie en TMDB..."
              className="bg-gray-800 border-gray-700 text-white"
              onKeyDown={(e) => e.key === 'Enter' && searchTMDB()}
            />
            <Button 
              onClick={searchTMDB} 
              disabled={isSearching}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto bg-gray-800 rounded p-2">
              {searchResults.map((series) => (
                <div
                  key={series.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-700 cursor-pointer rounded"
                  onClick={() => selectSeriesFromTMDB(series)}
                >
                  {series.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${series.poster_path}`}
                      alt={series.name}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <div className="text-white font-medium">{series.name}</div>
                    <div className="text-gray-400 text-sm">{series.first_air_date?.split('-')[0]} • ⭐ {series.vote_average}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título de la serie"
              className="bg-gray-800 border-gray-700 text-white"
              required
            />
            <Input
              value={originalTitle}
              onChange={(e) => setOriginalTitle(e.target.value)}
              placeholder="Título original"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <Textarea
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Sinopsis"
            className="bg-gray-800 border-gray-700 text-white"
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="date"
              value={firstAirDate}
              onChange={(e) => setFirstAirDate(e.target.value)}
              placeholder="Fecha de estreno"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Calificación (0-10)"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Géneros (separados por coma)"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              value={posterPath}
              onChange={(e) => setPosterPath(e.target.value)}
              placeholder="URL del póster"
              className="bg-gray-800 border-gray-700 text-white"
            />
            <Input
              value={backdropPath}
              onChange={(e) => setBackdropPath(e.target.value)}
              placeholder="URL del fondo"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Stream Servers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Servidores de Video</h4>
              <Button type="button" onClick={addServer} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Servidor
              </Button>
            </div>
            
            {servers.map((server, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-gray-800 rounded">
                <Input
                  value={server.name}
                  onChange={(e) => updateServer(index, 'name', e.target.value)}
                  placeholder="Nombre del servidor"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  value={server.url}
                  onChange={(e) => updateServer(index, 'url', e.target.value)}
                  placeholder="URL del video"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <select
                  value={server.quality}
                  onChange={(e) => updateServer(index, 'quality', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                >
                  <option value="HD">HD</option>
                  <option value="1080p">1080p</option>
                  <option value="720p">720p</option>
                  <option value="480p">480p</option>
                </select>
                <select
                  value={server.language}
                  onChange={(e) => updateServer(index, 'language', e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white rounded px-3 py-2"
                >
                  <option value="Latino">Latino</option>
                  <option value="Subtitulado">Subtitulado</option>
                  <option value="Español">Español</option>
                  <option value="Inglés">Inglés</option>
                </select>
                <Button
                  type="button"
                  onClick={() => removeServer(index)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando...
              </>
            ) : (
              'Agregar Serie'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickAddSeries;
