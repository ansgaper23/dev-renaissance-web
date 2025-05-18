
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface MovieTableProps {
  movies: {
    id: string;
    title: string;
    poster: string | null;
    year: string | number;
    rating: string | number;
    actions: {
      onView: () => void;
      onEdit: () => void;
      onDelete: React.ReactNode;
    };
  }[];
}

const MovieTable: React.FC<MovieTableProps> = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="rounded-md border border-gray-800 p-8 text-center">
        <p className="text-gray-400">No se encontraron películas</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-900">
          <TableRow className="hover:bg-gray-900/90 border-gray-800">
            <TableHead className="text-gray-400">Título</TableHead>
            <TableHead className="text-gray-400">Año</TableHead>
            <TableHead className="text-gray-400 hidden md:table-cell">Calificación</TableHead>
            <TableHead className="text-gray-400 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movies.map((movie) => (
            <TableRow key={movie.id} className="hover:bg-gray-900/50 border-gray-800">
              <TableCell className="font-medium flex items-center gap-3">
                {movie.poster && (
                  <img 
                    src={movie.poster} 
                    alt={movie.title} 
                    className="h-12 w-8 rounded object-cover hidden sm:block" 
                  />
                )}
                <span>{movie.title}</span>
              </TableCell>
              <TableCell>{movie.year}</TableCell>
              <TableCell className="hidden md:table-cell">{movie.rating}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/movie/${movie.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <div>{movie.actions.onDelete}</div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MovieTable;
