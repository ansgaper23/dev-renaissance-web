
import React from 'react';
import MovieTable from './MovieTable';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '@/services/movieService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { deleteMovie } from '@/services/movieService';

const MovieTableConnector = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const { data: movies, isLoading, isError, refetch } = useQuery({
    queryKey: ['movies', searchTerm],
    queryFn: () => fetchMovies(searchTerm)
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMovie(id);
      refetch();
      toast({
        title: 'Película eliminada',
        description: 'La película ha sido eliminada correctamente'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la película',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-purple" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-2">Error al cargar las películas</p>
        <button 
          className="text-brand-purple hover:text-brand-purple/80"
          onClick={() => refetch()}
        >
          Intentar nuevamente
        </button>
      </div>
    );
  }

  const movieData = movies?.map(movie => ({
    id: movie.id,
    title: movie.title,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A',
    rating: movie.rating || 'N/A',
    actions: {
      onView: () => {},
      onEdit: () => {},
      onDelete: (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="text-red-500 hover:text-red-400">Eliminar</button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-gray-900 border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Esta acción no se puede deshacer. Esto eliminará permanentemente la película.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white border-0">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction 
                className="bg-red-500 hover:bg-red-600" 
                onClick={() => handleDelete(movie.id)}
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  })) || [];

  return <MovieTable movies={movieData} />;
};

export default MovieTableConnector;
