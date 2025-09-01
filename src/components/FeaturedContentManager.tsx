import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Search, Plus, Film, Tv } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FeaturedItem {
  id: string;
  item_id: string;
  item_type: 'movie' | 'series';
  display_order: number;
  created_at?: string;
}

interface ContentItem {
  id: string;
  title: string;
  poster_path?: string;
  overview?: string;
  rating?: number;
}

const getPosterUrl = (posterPath: string | null): string | null => {
  if (!posterPath) return null;
  
  if (posterPath.startsWith('http')) {
    return posterPath;
  }
  
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

const FeaturedContentManager = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<'movie' | 'series'>('movie');
  const queryClient = useQueryClient();

  // Fetch featured items
  const { data: featuredItems = [], isLoading: featuredLoading } = useQuery({
    queryKey: ['featuredItems'],
    queryFn: async () => {
      // Primero obtenemos los featured items
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_items')
        .select('*')
        .order('display_order');
      
      if (featuredError) throw featuredError;

      // Luego obtenemos la información de cada item por separado
      const itemsWithContent = await Promise.all(
        featuredData.map(async (item) => {
          const table = item.item_type === 'movie' ? 'movies' : 'series';
          const { data: contentData, error: contentError } = await supabase
            .from(table)
            .select('id, title, poster_path, overview, rating')
            .eq('id', item.item_id)
            .single();

          if (contentError) {
            console.error(`Error fetching ${item.item_type}:`, contentError);
            return { ...item, content: null };
          }

          return { ...item, content: contentData };
        })
      );

      return itemsWithContent;
    }
  });

  // Fetch available content for search
  const { data: availableContent = [] } = useQuery({
    queryKey: ['availableContent', selectedContentType, searchQuery],
    queryFn: async () => {
      const table = selectedContentType === 'movie' ? 'movies' : 'series';
      let query = supabase
        .from(table)
        .select('id, title, poster_path, overview, rating')
        .limit(10);

      if (searchQuery.trim()) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: searchQuery.length > 2 || searchQuery.length === 0
  });

  // Add to featured
  const addToFeaturedMutation = useMutation({
    mutationFn: async ({ itemId, itemType }: { itemId: string; itemType: 'movie' | 'series' }) => {
      const nextOrder = Math.max(...featuredItems.map(item => item.display_order), 0) + 1;
      
      const { error } = await supabase
        .from('featured_items')
        .insert({
          item_id: itemId,
          item_type: itemType,
          display_order: nextOrder
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredItems'] });
      toast({
        title: "Éxito",
        description: "Contenido agregado al carrusel destacado",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo agregar el contenido al carrusel",
        variant: "destructive",
      });
    }
  });

  // Remove from featured
  const removeFromFeaturedMutation = useMutation({
    mutationFn: async (featuredId: string) => {
      const { error } = await supabase
        .from('featured_items')
        .delete()
        .eq('id', featuredId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featuredItems'] });
      toast({
        title: "Éxito",
        description: "Contenido removido del carrusel",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo remover el contenido",
        variant: "destructive",
      });
    }
  });

  const handleAddContent = (itemId: string) => {
    // Check if already featured
    const isAlreadyFeatured = featuredItems.some(
      item => item.item_id === itemId && item.item_type === selectedContentType
    );

    if (isAlreadyFeatured) {
      toast({
        title: "Aviso",
        description: "Este contenido ya está en el carrusel destacado",
        variant: "destructive",
      });
      return;
    }

    addToFeaturedMutation.mutate({ itemId, itemType: selectedContentType });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5" />
          Gestionar Carrusel Destacado
        </CardTitle>
        <CardDescription>
          Administra las películas y series que aparecen en el carrusel principal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Featured Items */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contenido Destacado Actual</h3>
          {featuredLoading ? (
            <p>Cargando...</p>
          ) : featuredItems.length === 0 ? (
            <p className="text-muted-foreground">No hay contenido destacado configurado</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredItems.map((item) => {
                if (!item.content) return null;
                
                const posterUrl = getPosterUrl(item.content.poster_path || null);
                
                return (
                  <div key={item.id} className="relative group border rounded-lg p-4 bg-background">
                    <div className="flex items-start gap-3">
                      {posterUrl && (
                        <img 
                          src={posterUrl} 
                          alt={item.content.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={item.item_type === 'movie' ? 'default' : 'secondary'}>
                            {item.item_type === 'movie' ? (
                              <><Film className="h-3 w-3 mr-1" /> Película</>
                            ) : (
                              <><Tv className="h-3 w-3 mr-1" /> Serie</>
                            )}
                          </Badge>
                        </div>
                        <h4 className="font-medium truncate">{item.content.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Orden: {item.display_order}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromFeaturedMutation.mutate(item.id)}
                        disabled={removeFromFeaturedMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Content */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Agregar Nuevo Contenido</h3>
          
          <div className="flex gap-4 mb-4">
            <Select value={selectedContentType} onValueChange={(value: 'movie' | 'series') => setSelectedContentType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="movie">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4" />
                    Películas
                  </div>
                </SelectItem>
                <SelectItem value="series">
                  <div className="flex items-center gap-2">
                    <Tv className="h-4 w-4" />
                    Series
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Buscar ${selectedContentType === 'movie' ? 'películas' : 'series'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableContent.map((content) => {
              const posterUrl = getPosterUrl(content.poster_path || null);
              const isAlreadyFeatured = featuredItems.some(
                item => item.item_id === content.id && item.item_type === selectedContentType
              );

              return (
                <div key={content.id} className="border rounded-lg p-4 bg-background">
                  <div className="flex items-start gap-3">
                    {posterUrl && (
                      <img 
                        src={posterUrl} 
                        alt={content.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{content.title}</h4>
                      {content.rating && (
                        <p className="text-sm text-muted-foreground">
                          ⭐ {content.rating}/10
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => handleAddContent(content.id)}
                        disabled={isAlreadyFeatured || addToFeaturedMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {isAlreadyFeatured ? 'Ya destacado' : 'Agregar'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedContentManager;