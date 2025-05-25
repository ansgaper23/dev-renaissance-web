
import React from 'react';
import Navbar from '@/components/Navbar';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import MovieSectionConnector from '@/components/MovieSectionConnector';
import SeriesSectionConnector from '@/components/SeriesSectionConnector';

const Index = () => {
  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white">
      <Navbar />
      
      {/* Featured Carousel */}
      <FeaturedCarousel />
      
      {/* Movie and Series Sections with real data */}
      <div className="space-y-8 pb-12">
        <MovieSectionConnector 
          title="🔥 Películas Recientes" 
          limit={6}
          sortBy="created_at"
          viewAllLink="/movies"
        />
        
        <SeriesSectionConnector 
          title="📺 Series Populares" 
          limit={6}
          sortBy="rating"
          viewAllLink="/series"
        />
        
        <MovieSectionConnector 
          title="⭐ Mejor Calificadas" 
          limit={6}
          sortBy="rating"
          viewAllLink="/top-rated"
        />
        
        <SeriesSectionConnector 
          title="🆕 Series Recientes" 
          limit={6}
          sortBy="created_at"
          viewAllLink="/series"
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
