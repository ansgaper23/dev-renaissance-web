
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '@/services/movieService';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MovieGrid from '@/components/MovieGrid';
import SEOHead from '@/components/SEOHead';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: movies = [], isLoading, error } = useQuery({
    queryKey: ['searchMovies', query],
    queryFn: () => fetchMovies(query),
    enabled: !!query,
  });

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <SEOHead 
        title={`Buscar: ${query} - Cuevana3`}
        description={`Resultados de búsqueda para "${query}"`}
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Resultados para: "{query}"
        </h1>
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">Error al buscar películas</p>
          </div>
        )}
        
        {!error && movies.length === 0 && !isLoading && query && (
          <div className="text-center py-12">
            <p className="text-cuevana-white/70">No se encontraron resultados para "{query}"</p>
          </div>
        )}
        
        <MovieGrid movies={movies} isLoading={isLoading} />
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;
