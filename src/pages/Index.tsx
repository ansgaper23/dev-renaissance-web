
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
        title="Ver Películas, Series y Anime Online Gratis en HD"
        description={settings?.site_description || "Cuevana 3 es la web para ver películas, series y anime online gratis en HD en español. Estrenos, clásicos y contenido exclusivo sin registro. ¡Disfruta sin límites!"}
        keywords="cuevana 3, cuevana3, ver películas online gratis, series online gratis, anime online, streaming gratis HD, estrenos 2026, películas en español, sin registro, cuevana pro"
        type="website"
        siteName={settings?.site_name || "Cuevana 3"}
        logoUrl={settings?.logo_url}
        adsCode={settings?.ads_code}
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
