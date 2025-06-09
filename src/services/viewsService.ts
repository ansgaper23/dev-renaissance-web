
import { supabase } from "@/integrations/supabase/client";
import { Series } from "./seriesService";

// Función para registrar una vista de serie
export const recordSeriesView = async (seriesId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('series_views')
      .insert({
        series_id: seriesId,
        ip_address: null, // Por privacidad, no guardamos IP real
        user_agent: navigator.userAgent
      });

    if (error) {
      console.warn('Error recording series view:', error);
    }
  } catch (error) {
    console.warn('Error recording series view:', error);
  }
};

// Función para obtener series más vistas
export const fetchMostViewedSeries = async (): Promise<Series[]> => {
  const { data, error } = await supabase
    .from('most_viewed_series')
    .select('*')
    .limit(20);

  if (error) {
    console.warn('Error fetching most viewed series, falling back to recent:', error);
    // Fallback a series recientes si hay error
    const { data: fallbackData } = await supabase
      .from('series')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    return (fallbackData || []).map(series => ({
      ...series,
      stream_servers: Array.isArray(series.stream_servers) ? series.stream_servers : [],
      seasons: Array.isArray(series.seasons) ? series.seasons : []
    })) as Series[];
  }

  return (data || []).map(series => ({
    ...series,
    stream_servers: Array.isArray(series.stream_servers) ? series.stream_servers : [],
    seasons: Array.isArray(series.seasons) ? series.seasons : []
  })) as Series[];
};

// Función para obtener series relacionadas por género
export const fetchRelatedSeries = async (seriesId: string, genres: string[] = []): Promise<Series[]> => {
  try {
    let query = supabase
      .from('series')
      .select('*')
      .neq('id', seriesId) // Excluir la serie actual
      .limit(6);

    if (genres && genres.length > 0) {
      // Buscar series que tengan al menos un género en común
      query = query.overlaps('genres', genres);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      // Si no hay series relacionadas por género, buscar las más recientes
      const { data: fallbackData } = await supabase
        .from('series')
        .select('*')
        .neq('id', seriesId)
        .order('created_at', { ascending: false })
        .limit(6);
      
      return (fallbackData || []).map(series => ({
        ...series,
        stream_servers: Array.isArray(series.stream_servers) ? series.stream_servers : [],
        seasons: Array.isArray(series.seasons) ? series.seasons : []
      })) as Series[];
    }

    return data.map(series => ({
      ...series,
      stream_servers: Array.isArray(series.stream_servers) ? series.stream_servers : [],
      seasons: Array.isArray(series.seasons) ? series.seasons : []
    })) as Series[];
  } catch (error) {
    console.warn('Error fetching related series:', error);
    return [];
  }
};
