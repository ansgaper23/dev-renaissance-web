
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMovies } from '@/services/movieService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, Plus, X, Star } from 'lucide-react';

interface FeaturedMovie {
  id: string;
  movie_id: string;
  display_order: number;
  created_at?: string;
}

const FeaturedMoviesManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch featured movies
  const { data: featuredMovies = [], isLoading: loadingFeatured } = useQuery({
    queryKey: ['featuredMovies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('featured_movies')
        .select(`
          *,
          movies (
            id,
            title,
            poster_path,
            rating,
            release_date
          )
        `)
        .order('display_order');
        
      if (error) throw new Error(error.message);
      return data as (FeaturedMovie & { movies: any })[];
    }
  });

  // Fetch available movies for selection
  const { data: availableMovies = [] } = useQuery({
    queryKey: ['movies', searchTerm],
    queryFn: () => fetchMovies(searchTerm),
    enabled: searchTerm.length > 0
  });

  // Add movie to featured
  const addToFeaturedMutation = useMutation({
    mutationFn: async (movieId: string) => {
      const nextOrder = Math.max(...featuredMovies.map(f => f.display_order), 0) + 1;
      
      const { data, error } = await supabase
        .from('featured_movies')
        .insert({
          movie_id: movieId,
          display_order: nextOrder
        })
        .select()
        .single();
        
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Película agregada",
        description: "La película se agregó al carrusel destacado",
      });
      queryClient.invalidateQueries({ queryKey: ['featuredMovies'] });
      setSearchTerm('');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo agregar la película: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  // Remove movie from featured
  const removeFromFeaturedMutation = useMutation({
    mutationFn: async (featuredId: string) => {
      const { error } = await supabase
        .from('featured_movies')
        .delete()
        .eq('id', featuredId);
        
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Película removida",
        description: "La película se removió del carrusel destacado",
      });
      queryClient.invalidateQueries({ queryKey: ['featuredMovies'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo remover la película: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleAddMovie = (movieId: string) => {
    // Check if movie is already featured
    const isAlreadyFeatured = featuredMovies.some(f => f.movie_id === movieId);
    if (isAlreadyFeatured) {
      toast({
        title: "Error",
        description: "Esta película ya está en el carrusel destacado",
        variant: "destructive"
      });
      return;
    }
    
    addToFeaturedMutation.mutate(movieId);
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Gestionar Carrusel Destacado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Featured Movies */}
        <div>
          <h4 className="text-white font-medium mb-3">Películas en el Carrusel ({featuredMovies.length})</h4>
          {loadingFeatured ? (
            <p className="text-gray-400">Cargando...</p>
          ) : featuredMovies.length === 0 ? (
            <p className="text-gray-400">No hay películas destacadas configuradas</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {featuredMovies.map((featured) => (
                <div key={featured.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                  {featured.movies?.poster_path && (
                    <img
                      src={featured.movies.poster_path.startsWith('http') 
                        ? featured.movies.poster_path 
                        : `https://image.tmdb.org/t/p/w92${featured.movies.poster_path}`}
                      alt={featured.movies?.title}
                      className="w-12 h-18 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h5 className="text-white font-medium">{featured.movies?.title}</h5>
                    <p className="text-gray-400 text-sm">
                      Orden: {featured.display_order}
                      {featured.movies?.rating && (
                        <span className="ml-2">
                          <Star className="h-3 w-3 inline mr-1" />
                          {featured.movies.rating}
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeFromFeaturedMutation.mutate(featured.id)}
                    disabled={removeFromFeaturedMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Movie */}
        <div>
          <h4 className="text-white font-medium mb-3">Agregar Película al Carrusel</h4>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar películas para agregar al carrusel..."
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            {searchTerm && availableMovies.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableMovies.slice(0, 5).map((movie) => {
                  const isAlreadyFeatured = featuredMovies.some(f => f.movie_id === movie.id);
                  return (
                    <div key={movie.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                      {movie.poster_path && (
                        <img
                          src={movie.poster_path.startsWith('http') 
                            ? movie.poster_path 
                            : `https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          className="w-12 h-18 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="text-white font-medium">{movie.title}</h5>
                        <p className="text-gray-400 text-sm">
                          {movie.release_date && new Date(movie.release_date).getFullYear()}
                          {movie.rating && (
                            <span className="ml-2">
                              <Star className="h-3 w-3 inline mr-1" />
                              {movie.rating}
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleAddMovie(movie.id)}
                        disabled={isAlreadyFeatured || addToFeaturedMutation.isPending}
                        className="bg-cuevana-blue hover:bg-cuevana-blue/90"
                        size="sm"
                      >
                        {isAlreadyFeatured ? 'Ya agregada' : <Plus className="h-4 w-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedMoviesManager;
