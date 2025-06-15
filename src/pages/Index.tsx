
import React from 'react';
import Navbar from '@/components/Navbar';
import SEOHead from '@/components/SEOHead';
import FeaturedCarousel from '@/components/FeaturedCarousel';
import MostViewedMoviesSection from '@/components/MostViewedMoviesSection';
import SeriesSectionConnector from '@/components/SeriesSectionConnector';
import MovieSectionConnector from '@/components/MovieSectionConnector';
import { useSettings } from '@/hooks/useSettings';
import Footer from '@/components/Footer';

const Index = () => {
  const { data: settings } = useSettings();

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white flex flex-col">
      <SEOHead 
        title="Ver Películas y Series Online Gratis en HD"
        description={settings?.site_description || "Disfruta de miles de películas y series online gratis en HD. Estrenos 2024, clásicos del cine y series populares. Sin registro, sin límites en Cuevana3."}
        keywords="cuevana3, películas online gratis, series online, ver peliculas gratis, streaming, cine online, estrenos 2024, películas HD, series HD"
        type="website"
        siteName={settings?.site_name || "Cuevana3"}
        logoUrl={settings?.logo_url}
        adsCode={settings?.ads_code}
      />
      <Navbar />
      
      {/* Featured Carousel */}
      <FeaturedCarousel />
      
      {/* Movie and Series Sections with real data */}
      <div className="space-y-8 pb-12">
        <MostViewedMoviesSection 
          title="📺 Películas más vistas" 
          limit={6}
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
      <Footer />
    </div>
  );
};

export default Index;
