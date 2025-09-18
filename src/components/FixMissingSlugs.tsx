import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from '@/services/movieService';

const FixMissingSlugs = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<{ movies: number; series: number } | null>(null);
  const { toast } = useToast();

  const generateSeriesSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const fixMovieSlugs = async () => {
    // Get movies with missing or potentially incorrect slugs
    const { data: movies, error } = await supabase
      .from('movies')
      .select('id, title, release_date, slug');
    
    if (error) throw error;

    let fixedCount = 0;
    
    for (const movie of movies || []) {
      const year = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : undefined;
      const expectedSlug = generateSlug(movie.title, year);
      
      // Update if slug is missing or doesn't match expected format
      if (!movie.slug || movie.slug !== expectedSlug) {
        const { error: updateError } = await supabase
          .from('movies')
          .update({ slug: expectedSlug })
          .eq('id', movie.id);
          
        if (!updateError) {
          fixedCount++;
        }
      }
    }
    
    return fixedCount;
  };

  const fixSeriesSlugs = async () => {
    // Get series with missing or potentially incorrect slugs
    const { data: series, error } = await supabase
      .from('series')
      .select('id, title, slug');
    
    if (error) throw error;

    let fixedCount = 0;
    
    for (const serie of series || []) {
      const expectedSlug = generateSeriesSlug(serie.title);
      
      // Update if slug is missing or doesn't match expected format
      if (!serie.slug || serie.slug !== expectedSlug) {
        const { error: updateError } = await supabase
          .from('series')
          .update({ slug: expectedSlug })
          .eq('id', serie.id);
          
        if (!updateError) {
          fixedCount++;
        }
      }
    }
    
    return fixedCount;
  };

  const handleFixSlugs = async () => {
    setIsFixing(true);
    try {
      const [moviesFixed, seriesFixed] = await Promise.all([
        fixMovieSlugs(),
        fixSeriesSlugs()
      ]);
      
      setResults({ movies: moviesFixed, series: seriesFixed });
      
      toast({
        title: "Slugs corregidos exitosamente",
        description: `Se corrigieron ${moviesFixed} películas y ${seriesFixed} series`,
      });
    } catch (error) {
      console.error('Error fixing slugs:', error);
      toast({
        title: "Error",
        description: "Hubo un error al corregir los slugs",
        variant: "destructive",
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-cuevana-white mb-2">
          Corregir Slugs de URLs
        </h3>
        <p className="text-cuevana-white/70 text-sm mb-4">
          Esta herramienta corregirá los slugs de las URLs de películas y series para que sean consistentes con sus títulos.
        </p>
      </div>
      
      <Button 
        onClick={handleFixSlugs}
        disabled={isFixing}
        className="bg-cuevana-blue hover:bg-cuevana-blue/90"
      >
        {isFixing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Corrigiendo slugs...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Corregir Slugs
          </>
        )}
      </Button>
      
      {results && (
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mt-4">
          <h4 className="text-green-400 font-semibold mb-2">Resultados:</h4>
          <ul className="text-cuevana-white/80 space-y-1">
            <li>• Películas corregidas: {results.movies}</li>
            <li>• Series corregidas: {results.series}</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default FixMissingSlugs;