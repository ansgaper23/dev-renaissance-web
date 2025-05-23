
import React from 'react';
import Navbar from '@/components/Navbar';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import MovieSection from '@/components/MovieSection';

// Mock data - en un app real vendría de la API
const latestMovies = [
  {
    id: 1,
    title: "Dune",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    rating: 4.5,
    year: 2021,
    genre: "Sci-Fi"
  },
  {
    id: 2,
    title: "The Batman",
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    rating: 4.3,
    year: 2022,
    genre: "Acción"
  },
  {
    id: 3,
    title: "Spider-Man: No Way Home",
    posterUrl: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    rating: 4.7,
    year: 2021,
    genre: "Acción"
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    posterUrl: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    rating: 4.8,
    year: 2022,
    genre: "Acción"
  },
  {
    id: 5,
    title: "The Godfather",
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    rating: 4.9,
    year: 1972,
    genre: "Drama"
  },
  {
    id: 6,
    title: "Inception",
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    rating: 4.8,
    year: 2010,
    genre: "Sci-Fi"
  }
];

const trendingMovies = [
  {
    id: 7,
    title: "The Shawshank Redemption",
    posterUrl: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    rating: 4.9,
    year: 1994,
    genre: "Drama"
  },
  {
    id: 8,
    title: "Pulp Fiction",
    posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    rating: 4.7,
    year: 1994,
    genre: "Drama"
  },
  {
    id: 9,
    title: "The Dark Knight",
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    rating: 4.9,
    year: 2008,
    genre: "Acción"
  },
  {
    id: 10,
    title: "Forrest Gump",
    posterUrl: "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
    rating: 4.6,
    year: 1994,
    genre: "Drama"
  },
  {
    id: 11,
    title: "Goodfellas",
    posterUrl: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    rating: 4.8,
    year: 1990,
    genre: "Drama"
  },
  {
    id: 12,
    title: "The Matrix",
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 4.7,
    year: 1999,
    genre: "Sci-Fi"
  }
];

const actionMovies = [
  {
    id: 13,
    title: "John Wick",
    posterUrl: "https://image.tmdb.org/t/p/w500/fZPSd91yGE9fCcCe6OoQr6E3Bev.jpg",
    rating: 4.4,
    year: 2014,
    genre: "Acción"
  },
  {
    id: 14,
    title: "Mad Max: Fury Road",
    posterUrl: "https://image.tmdb.org/t/p/w500/hA2ple9q4qnwxp3hKVNhroipsir.jpg",
    rating: 4.6,
    year: 2015,
    genre: "Acción"
  },
  {
    id: 15,
    title: "Mission: Impossible",
    posterUrl: "https://image.tmdb.org/t/p/w500/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg",
    rating: 4.3,
    year: 2018,
    genre: "Acción"
  },
  {
    id: 16,
    title: "Fast & Furious",
    posterUrl: "https://image.tmdb.org/t/p/w500/6ApDtO7xaWAfPqfi2IARXIzj8QS.jpg",
    rating: 4.1,
    year: 2021,
    genre: "Acción"
  },
  {
    id: 17,
    title: "Die Hard",
    posterUrl: "https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg",
    rating: 4.5,
    year: 1988,
    genre: "Acción"
  },
  {
    id: 18,
    title: "Terminator 2",
    posterUrl: "https://image.tmdb.org/t/p/w500/5M0j0B18abtBI5gi2RhfjjurTqb.jpg",
    rating: 4.7,
    year: 1991,
    genre: "Acción"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      {/* Featured Carousel */}
      <FeaturedCarousel />
      
      {/* Movie Sections */}
      <div className="space-y-8 pb-12">
        <MovieSection 
          title="🔥 Últimas Agregadas" 
          movies={latestMovies}
          viewAllLink="/latest"
        />
        
        <MovieSection 
          title="⭐ Tendencias" 
          movies={trendingMovies}
          viewAllLink="/trending"
        />
        
        <MovieSection 
          title="💥 Películas de Acción" 
          movies={actionMovies}
          viewAllLink="/genre/action"
        />
      </div>
    </div>
  );
};

export default Index;
