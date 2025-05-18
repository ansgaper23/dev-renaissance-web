
import React, { useState } from 'react';
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

// Mock data
const mockMovies = [
  {
    id: 1,
    title: "Dune",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    rating: 4.5,
    year: 2021,
    genre: "Ciencia ficción, Aventura",
    views: 12543
  },
  {
    id: 2,
    title: "The Batman",
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    rating: 4.3,
    year: 2022,
    genre: "Acción, Crimen",
    views: 9876
  },
  {
    id: 3,
    title: "Spider-Man: No Way Home",
    posterUrl: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    rating: 4.7,
    year: 2021,
    genre: "Acción, Aventura, Ciencia ficción",
    views: 18765
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    rating: 4.8,
    year: 2022,
    genre: "Acción, Drama",
    views: 15432
  },
  {
    id: 5,
    title: "The Godfather",
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    rating: 4.9,
    year: 1972,
    genre: "Crimen, Drama",
    views: 7612
  }
];

interface MovieTableProps {
  searchTerm: string;
}

const MovieTable: React.FC<MovieTableProps> = ({ searchTerm }) => {
  const [movies] = useState(mockMovies);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  
  // Filter movies based on search term
  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteClick = (id: number) => {
    setSelectedMovieId(id);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    toast({
      title: "Película eliminada",
      description: "La película ha sido eliminada correctamente",
    });
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <div className="rounded-md border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow className="hover:bg-gray-900/90 border-gray-800">
              <TableHead className="text-gray-400">Título</TableHead>
              <TableHead className="text-gray-400">Año</TableHead>
              <TableHead className="text-gray-400 hidden md:table-cell">Género</TableHead>
              <TableHead className="text-gray-400 hidden md:table-cell">Calificación</TableHead>
              <TableHead className="text-gray-400 hidden lg:table-cell">Vistas</TableHead>
              <TableHead className="text-gray-400 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie) => (
                <TableRow key={movie.id} className="hover:bg-gray-900/50 border-gray-800">
                  <TableCell className="font-medium flex items-center gap-3">
                    <img 
                      src={movie.posterUrl} 
                      alt={movie.title} 
                      className="h-12 w-8 rounded object-cover hidden sm:block" 
                    />
                    <span>{movie.title}</span>
                  </TableCell>
                  <TableCell>{movie.year}</TableCell>
                  <TableCell className="hidden md:table-cell">{movie.genre}</TableCell>
                  <TableCell className="hidden md:table-cell">{movie.rating}</TableCell>
                  <TableCell className="hidden lg:table-cell">{movie.views.toLocaleString()}</TableCell>
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(movie.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-gray-400">
                  No se encontraron películas con el término "{searchTerm}"
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p>¿Estás seguro de que deseas eliminar esta película? Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gray-700">Cancelar</Button>
            </DialogClose>
            <Button 
              className="bg-red-600 hover:bg-red-700" 
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MovieTable;
