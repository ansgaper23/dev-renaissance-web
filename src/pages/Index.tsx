
import React from 'react';
import Navbar from '@/components/Navbar';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import MovieSectionConnector from '@/components/MovieSectionConnector';

const Index = () => {
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      {/* Featured Carousel */}
      <FeaturedCarousel />
      
      {/* Movie Sections with real data */}
      <div className="space-y-8 pb-12">
        <MovieSectionConnector 
          title="🔥 Últimas Agregadas" 
          limit={6}
          sortBy="created_at"
          viewAllLink="/latest"
        />
        
        <MovieSectionConnector 
          title="⭐ Mejor Calificadas" 
          limit={6}
          sortBy="rating"
          viewAllLink="/top-rated"
        />
        
        <MovieSectionConnector 
          title="📅 Estrenos Recientes" 
          limit={6}
          sortBy="release_date"
          viewAllLink="/recent"
        />
      </div>
    </div>
  );
};

export default Index;
