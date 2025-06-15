
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, RefreshCw } from 'lucide-react';

const FixMissingGenres = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFixGenres = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('fix-missing-genres');
      
      if (error) {
        console.error('Error fixing genres:', error);
        toast.error('Error al corregir géneros');
        return;
      }

      setResult(data);
      
      if (data.total.updated > 0) {
        toast.success(`Se actualizaron ${data.total.updated} elementos con géneros`);
      } else {
        toast.info('No se encontraron elementos sin géneros para actualizar');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al corregir géneros');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button 
          onClick={handleFixGenres}
          disabled={isLoading}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Corrigiendo géneros...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Corregir Géneros Faltantes
            </>
          )}
        </Button>
      </div>
      
      <p className="text-sm text-gray-600">
        Esta función busca películas y series que tienen TMDB ID pero no tienen géneros asignados, 
        y los actualiza automáticamente desde TMDB.
      </p>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Resultados:</h3>
          <div className="text-sm space-y-1">
            <p>✅ Películas actualizadas: {result.movies.count}</p>
            <p>✅ Series actualizadas: {result.series.count}</p>
            {result.errors.length > 0 && (
              <p>❌ Errores: {result.errors.length}</p>
            )}
          </div>
          
          {result.movies.updated.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-sm">Películas actualizadas:</h4>
              <ul className="text-xs text-gray-600">
                {result.movies.updated.slice(0, 5).map((movie: any) => (
                  <li key={movie.id}>• {movie.title} - {movie.genres.join(', ')}</li>
                ))}
                {result.movies.updated.length > 5 && (
                  <li>... y {result.movies.updated.length - 5} más</li>
                )}
              </ul>
            </div>
          )}
          
          {result.series.updated.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-sm">Series actualizadas:</h4>
              <ul className="text-xs text-gray-600">
                {result.series.updated.slice(0, 5).map((serie: any) => (
                  <li key={serie.id}>• {serie.title} - {serie.genres.join(', ')}</li>
                ))}
                {result.series.updated.length > 5 && (
                  <li>... y {result.series.updated.length - 5} más</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FixMissingGenres;
