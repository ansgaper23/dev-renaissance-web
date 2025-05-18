
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
import { Search, Download, Plus } from 'lucide-react';

const ImportFromTMDB = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Set<number>>(new Set());
  
  // Simulate a search on TMDB
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Mock API response for demonstration
      const results = [
        {
          id: 123,
          title: "Inception",
          poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
          release_date: "2010-07-16",
          vote_average: 8.3,
          overview: "Dom Cobb es un ladrón con una extraña habilidad para entrar a los sueños de la gente y robarles los secretos de sus subconscientes."
        },
        {
          id: 124,
          title: "Interstellar",
          poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
          release_date: "2014-11-05",
          vote_average: 8.4,
          overview: "Un grupo de exploradores emprenden un viaje interestelar para encontrar un nuevo hogar para la humanidad."
        },
        {
          id: 125,
          title: "The Dark Knight",
          poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
          release_date: "2008-07-18",
          vote_average: 8.5,
          overview: "Batman se enfrenta al Joker, un criminal psicópata que busca sumir Gotham City en el caos."
        }
      ];
      
      setSearchResults(results);
      setIsSearching(false);
    }, 1000);
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
  
  // Handle import selected movies
  const handleImport = () => {
    if (selectedMovies.size === 0) {
      toast({
        title: "Selección vacía",
        description: "Selecciona al menos una película para importar",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Importación exitosa",
      description: `${selectedMovies.size} películas importadas correctamente`,
    });
    
    // Reset state after import
    setSelectedMovies(new Set());
    setSearchResults([]);
    setSearchQuery('');
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
              {isSearching ? "Buscando..." : "Buscar"}
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
                disabled={selectedMovies.size === 0}
                className="bg-brand-purple hover:bg-brand-purple/90 flex items-center gap-2"
              >
                <Download size={16} /> Importar seleccionadas
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
                        <img 
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                          alt={movie.title} 
                          className="h-12 w-8 rounded object-cover hidden sm:block" 
                        />
                        <div>
                          <div>{movie.title}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[180px] md:max-w-[300px] lg:max-w-[400px]">
                            {movie.overview}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {movie.release_date?.split('-')[0]}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {movie.vote_average} ★
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-1 text-brand-blue hover:text-brand-purple"
                          onClick={() => {
                            handleToggleSelect(movie.id);
                            toast({
                              title: "Película agregada",
                              description: `${movie.title} se ha agregado a la selección`,
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
