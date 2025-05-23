
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const featuredMovies = [
  {
    id: 1,
    title: "Avengers: Endgame",
    description: "Después de los devastadores eventos de 'Vengadores: Infinity War', el universo está en ruinas. Con la ayuda de los aliados que quedaron, los Vengadores se reúnen una vez más para intentar deshacer las acciones de Thanos y restaurar el equilibrio del universo.",
    backdropUrl: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    rating: 4.8,
    year: 2019,
    genre: "Acción, Aventura"
  },
  {
    id: 2,
    title: "Dune",
    description: "Paul Atreides, un joven brillante y talentoso nacido en un gran destino más allá de su entendimiento, debe viajar al planeta más peligroso del universo para asegurar el futuro de su familia y de su pueblo.",
    backdropUrl: "https://image.tmdb.org/t/p/original/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
    rating: 4.5,
    year: 2021,
    genre: "Ciencia ficción, Drama"
  },
  {
    id: 3,
    title: "Spider-Man: No Way Home",
    description: "Peter Parker es desenmascarado y ya no puede separar su vida normal de los enormes riesgos de ser un súper héroe. Cuando pide ayuda a Doctor Strange, los riesgos se vuelven aún más peligrosos.",
    backdropUrl: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    rating: 4.7,
    year: 2021,
    genre: "Acción, Aventura"
  }
];

const FeaturedCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const currentMovie = featuredMovies[currentSlide];

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={currentMovie.backdropUrl} 
          alt={currentMovie.title} 
          className="w-full h-full object-cover transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cuevana-bg/90 via-cuevana-bg/60 to-cuevana-bg/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-cuevana-bg via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-cuevana-white">
            {currentMovie.title}
          </h1>
          
          <div className="flex items-center mb-4 space-x-4">
            <span className="bg-cuevana-blue px-3 py-1 rounded text-sm font-semibold text-white">
              {currentMovie.rating} ★
            </span>
            <span className="text-cuevana-gold text-sm font-medium">{currentMovie.year}</span>
            <span className="text-cuevana-white/80 text-sm">{currentMovie.genre}</span>
          </div>
          
          <p className="text-cuevana-white/90 mb-8 text-lg leading-relaxed line-clamp-3">
            {currentMovie.description}
          </p>
          
          <div className="flex space-x-4">
            <Link to={`/movie/${currentMovie.id}`}>
              <Button className="bg-cuevana-blue hover:bg-cuevana-blue/90 text-white flex items-center gap-2 px-8 py-3 text-lg">
                <Play className="h-5 w-5" /> Ver Ahora
              </Button>
            </Link>
            <Link to={`/movie/${currentMovie.id}`}>
              <Button 
                variant="outline" 
                className="border-cuevana-white/30 text-cuevana-white hover:bg-cuevana-white/10 flex items-center gap-2 px-8 py-3 text-lg"
              >
                <Info className="h-5 w-5" /> Más Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-cuevana-bg/50 hover:bg-cuevana-bg/70 text-cuevana-white rounded-full p-3 transition-all"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-cuevana-bg/50 hover:bg-cuevana-bg/70 text-cuevana-white rounded-full p-3 transition-all"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-cuevana-blue' : 'bg-cuevana-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
