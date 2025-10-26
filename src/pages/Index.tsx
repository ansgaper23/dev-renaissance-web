
import React, { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import SEOHead from '@/components/SEOHead';
import FeaturedCarouselUnified from '@/components/FeaturedCarouselUnified';
import LazySection from '@/components/LazySection';
import { useSettings } from '@/hooks/useSettings';
import { usePerformance } from '@/hooks/usePerformance';
import Footer from '@/components/Footer';
import TelegramButton from '@/components/TelegramButton';

// Lazy load non-critical sections for better INP
const MostViewedMoviesSection = lazy(() => import('@/components/MostViewedMoviesSection'));
const MostViewedSeriesSection = lazy(() => import('@/components/MostViewedSeriesSection'));
const SeriesSectionConnector = lazy(() => import('@/components/SeriesSectionConnector'));
const MovieSectionConnector = lazy(() => import('@/components/MovieSectionConnector'));

const Index = () => {
  const { data: settings } = useSettings();
  
  // Monitor performance metrics
  usePerformance();

  return (
    <div className="min-h-screen bg-cuevana-bg text-cuevana-white flex flex-col">
      <SEOHead 
        title="Ver Películas y Series Online Gratis en HD"
        description={settings?.site_description || "Disfruta de miles de películas y series online gratis en HD. Estrenos 2024, clásicos del cine y series populares. Sin registro, sin límites en Cuevana3."}
        keywords="cuevana3, películas online gratis, series online, ver peliculas gratis, streaming, cine online, estrenos 2024, películas HD, series HD"
        type="website"
        siteName={settings?.site_name || "Cuevana3"}
        logoUrl={settings?.logo_url}
      />
      <Navbar />
      
      {/* Featured Carousel */}
      <FeaturedCarouselUnified />
      
      {/* Movie and Series Sections with lazy loading for better INP */}
      <div className="space-y-8 pb-12">
        <LazySection>
          <MostViewedMoviesSection 
            title="📺 Películas más vistas" 
            limit={6}
            viewAllLink="/movies"
          />
        </LazySection>
        
        <LazySection>
          <MostViewedSeriesSection 
            title="📺 Series más vistas" 
            limit={6}
            viewAllLink="/series"
          />
        </LazySection>
        
        <LazySection>
          <MovieSectionConnector 
            title="⭐ Mejor Calificadas" 
            limit={6}
            sortBy="rating"
            viewAllLink="/top-rated"
          />
        </LazySection>
        
        <LazySection>
          <SeriesSectionConnector 
            title="🆕 Series Recientes" 
            limit={6}
            sortBy="created_at"
            viewAllLink="/series"
          />
        </LazySection>
        
        <LazySection>
          <MovieSectionConnector 
            title="📅 Estrenos Recientes" 
            limit={6}
            sortBy="release_date"
            viewAllLink="/recent"
          />
        </LazySection>
      </div>
      <TelegramButton />
      <Footer />
    </div>
  );
};

export default Index;
