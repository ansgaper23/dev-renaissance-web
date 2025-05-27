
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Star, Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import EditSeriesDialog from './EditSeriesDialog';

interface Series {
  id: string;
  title: string;
  original_title?: string;
  poster_path?: string;
  first_air_date?: string;
  rating?: number;
  number_of_seasons?: number;
  status?: string;
  created_at: string;
}

interface SeriesTableProps {
  searchTerm: string;
}

const SeriesTable = ({ searchTerm }: SeriesTableProps) => {
  const queryClient = useQueryClient();
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);

  // Fetch series
  const { data: series = [], isLoading } = useQuery({
    queryKey: ['series', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Series[];
    }
  });

  // Delete series mutation
  const deleteSeriesMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', id);
        
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast({
        title: "Serie eliminada",
        description: "La serie se ha eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['series'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `No se pudo eliminar la serie: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta serie?')) {
      deleteSeriesMutation.mutate(id);
    }
  };

  const handleEdit = (serie: Series) => {
    setEditingSeries(serie);
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <p className="text-white text-center">Cargando series...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Series ({series.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No hay series agregadas</p>
              <p className="text-gray-500 text-sm">Usa la pestaña "Agregar Serie" para empezar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-300">Poster</th>
                    <th className="text-left p-3 text-gray-300">Título</th>
                    <th className="text-left p-3 text-gray-300">Año</th>
                    <th className="text-left p-3 text-gray-300">Rating</th>
                    <th className="text-left p-3 text-gray-300">Temporadas</th>
                    <th className="text-left p-3 text-gray-300">Estado</th>
                    <th className="text-left p-3 text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((serie) => (
                    <tr key={serie.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3">
                        {serie.poster_path ? (
                          <img
                            src={serie.poster_path.startsWith('http') 
                              ? serie.poster_path 
                              : `https://image.tmdb.org/t/p/w92${serie.poster_path}`}
                            alt={serie.title}
                            className="w-12 h-18 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-18 rounded bg-gray-700 flex items-center justify-center">
                            <span className="text-xs text-gray-500">N/A</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div>
                          <h3 className="text-white font-medium">{serie.title}</h3>
                          {serie.original_title && serie.original_title !== serie.title && (
                            <p className="text-gray-400 text-sm">{serie.original_title}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="h-4 w-4 mr-2" />
                          {serie.first_air_date ? new Date(serie.first_air_date).getFullYear() : 'N/A'}
                        </div>
                      </td>
                      <td className="p-3">
                        {serie.rating ? (
                          <div className="flex items-center text-yellow-400">
                            <Star className="h-4 w-4 mr-1" />
                            {serie.rating}
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-gray-300">{serie.number_of_seasons || 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <span className="text-gray-300">{serie.status || 'N/A'}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <Link to={`/series/${serie.id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300"
                            onClick={() => handleEdit(serie)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(serie.id)}
                            disabled={deleteSeriesMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {editingSeries && (
        <EditSeriesDialog
          series={editingSeries}
          onClose={() => setEditingSeries(null)}
        />
      )}
    </>
  );
};

export default SeriesTable;
