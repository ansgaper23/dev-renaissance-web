
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Star, Play } from 'lucide-react';

// Mock data for initial display
const mockMovies = [
  {
    id: 1,
    title: "Dune",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    rating: 4.5,
    year: 2021,
  },
  {
    id: 2,
    title: "The Batman",
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    rating: 4.3,
    year: 2022,
  },
  {
    id: 3,
    title: "Spider-Man: No Way Home",
    posterUrl: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    rating: 4.7,
    year: 2021,
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    rating: 4.8,
    year: 2022,
  },
  {
    id: 5,
    title: "The Godfather",
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    rating: 4.9,
    year: 1972,
  },
  {
    id: 6,
    title: "Inception",
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    rating: 4.8,
    year: 2010,
  },
  {
    id: 7,
    title: "The Shawshank Redemption",
    posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    rating: 4.9,
    year: 1994,
  },
  {
    id: 8,
    title: "Pulp Fiction",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    rating: 4.7,
    year: 1994,
  }
];

const MovieGrid = () => {
  const [movies] = useState(mockMovies);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

const MovieCard = ({ movie }: { movie: any }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/movie/${movie.id}`}>
        <Card className="overflow-hidden bg-cuevana-gray-100 border-cuevana-gray-200 transition-all duration-300 hover:scale-105">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            />
            {isHovered && (
              <div className="absolute inset-0 bg-cuevana-bg/70 flex items-center justify-center">
                <div className="bg-cuevana-blue rounded-full p-3 text-white">
                  <Play className="h-6 w-6" />
                </div>
              </div>
            )}
            
            {/* Rating badge */}
            <div className="absolute top-2 left-2 bg-cuevana-bg/80 text-cuevana-gold text-xs font-bold px-2 py-1 rounded flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" />
              {movie.rating}
            </div>
          </div>
          <CardContent className="p-2 pt-3 px-0">
            <h3 className="text-sm font-medium text-cuevana-white truncate">{movie.title}</h3>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-cuevana-white/70">{movie.year}</span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default MovieGrid;
