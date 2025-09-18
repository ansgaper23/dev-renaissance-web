import { supabase } from "@/integrations/supabase/client";

export interface SeriesEpisode {
  episode_number: number;
  title: string;
  stream_servers?: Array<{
    name: string;
    url: string;
    quality?: string;
    language?: string;
  }>;
}

export interface SeriesSeason {
  season_number: number;
  episodes: SeriesEpisode[];
}

export interface Series {
  id: string;
  tmdb_id?: number | null;
  title: string;
  original_title?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  first_air_date?: string | null;
  genres?: string[] | null;
  rating?: number | null;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  status?: string | null;
  stream_servers?: Array<{
    name: string;
    url: string;
    quality?: string;
    language?: string;
  }> | null;
  seasons?: SeriesSeason[] | null;
  slug?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// For creating a new series, title is required
export interface SeriesCreate extends Omit<Partial<Series>, 'title'> {
  title: string; // Title is required
}

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

// Helper function to convert database row to Series
const convertToSeries = (row: any): Series => {
  return {
    ...row,
    stream_servers: Array.isArray(row.stream_servers) ? row.stream_servers : [],
    seasons: Array.isArray(row.seasons) ? row.seasons : []
  };
};

// Helper function to convert Series to database format
const convertToDbFormat = (series: Partial<Series>) => {
  const dbData: any = { ...series };
  
  // Generate slug if title is provided and slug is not set
  if (series.title && !series.slug) {
    dbData.slug = generateSlug(series.title);
  }
  
  // Convert complex objects to JSON-compatible format
  if (series.stream_servers) {
    dbData.stream_servers = JSON.parse(JSON.stringify(series.stream_servers));
  }
  
  if (series.seasons) {
    dbData.seasons = JSON.parse(JSON.stringify(series.seasons));
  }
  
  return dbData;
};

export const fetchSeries = async (searchTerm: string = ''): Promise<Series[]> => {
  let query = supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return (data || []).map(convertToSeries);
};

export const fetchSeriesByRating = async (limit: number = 20): Promise<Series[]> => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .not('rating', 'is', null)
    .gte('rating', 7) // Only show series with rating >= 7
    .order('rating', { ascending: false })
    .limit(limit);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return (data || []).map(convertToSeries);
};

export const fetchSeriesByAirDate = async (limit: number = 20): Promise<Series[]> => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .not('first_air_date', 'is', null)
    .order('first_air_date', { ascending: false })
    .limit(limit);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return (data || []).map(convertToSeries);
};

export const fetchSeriesById = async (id: string): Promise<Series> => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return convertToSeries(data);
};

export const fetchSeriesBySlug = async (slug: string): Promise<Series> => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return convertToSeries(data);
};

export const addSeries = async (series: SeriesCreate): Promise<Series> => {
  const dbData = convertToDbFormat(series);
  
  const { data, error } = await supabase
    .from('series')
    .insert(dbData)
    .select()
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return convertToSeries(data);
};

export const updateSeries = async (id: string, updates: Partial<Series>): Promise<Series> => {
  // Generate slug if title is being updated and no slug is provided
  if (updates.title && !updates.slug) {
    updates.slug = generateSlug(updates.title);
  }
  
  const dbData = convertToDbFormat({ ...updates, updated_at: new Date().toISOString() });
  
  const { data, error } = await supabase
    .from('series')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return convertToSeries(data);
};

export const deleteSeries = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('series')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};

export const getTotalSeriesCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('series')
    .select('*', { count: 'exact', head: true });
    
  if (error) {
    throw new Error(error.message);
  }
  
  return count || 0;
};

// TMDB Genre mapping for series
const TMDB_TV_GENRES: { [key: number]: string } = {
  10759: "Acción y Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  10762: "Infantil",
  9648: "Misterio",
  10763: "Noticias",
  10764: "Reality",
  10765: "Ciencia Ficción y Fantasía",
  10766: "Telenovela",
  10767: "Talk Show",
  10768: "Bélica y Política",
  37: "Western"
};

// Función para buscar por IMDB ID para series
export const searchSeriesByIMDBId = async (imdbId: string): Promise<any> => {
  try {
    console.log("Searching for series IMDB ID:", imdbId);
    
    // Intentar usar Supabase functions primero
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const { data, error } = await supabase.functions.invoke('tmdb-search', {
        body: { imdb_id: imdbId, type: 'tv' }
      });
      
      if (!error && data) {
        console.log("TMDB search result for series via Supabase:", data);
        return {
          ...data,
          imdb_id: imdbId,
          type: 'tv'
        };
      }
    } catch (supabaseError) {
      console.log("Supabase function failed, trying direct API");
    }
    
    // Use secure TMDB search function for series
    const { data, error } = await supabase.functions.invoke('secure-tmdb-search', {
      body: { imdb_id: imdbId, type: 'tv' }
    });
    
    if (error) {
      console.error("Secure TMDB search error:", error);
      throw new Error('Error al buscar series en TMDB: ' + error.message);
    }
    
    if (!data) {
      throw new Error('No se encontraron series para este IMDB ID');
    }
    
    console.log("TMDB search result for series via secure function:", data);
    
    // Handle both find API response and direct series response
    if (data.tv_results && data.tv_results.length > 0) {
      const series = data.tv_results[0];
      return {
        ...series,
        imdb_id: imdbId,
        type: 'tv'
      };
    } else if (data.id) {
      // Direct series response
      return {
        ...data,
        imdb_id: imdbId,
        type: 'tv'
      };
    }
    
    throw new Error('No se encontraron series para este IMDB ID');
  } catch (error) {
    console.error("Error searching series by IMDB ID:", error);
    throw error;
  }
};

export const importSeriesFromTMDB = async (tmdbSeries: any, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Series> => {
  console.log("Importing series from TMDB:", tmdbSeries);
  console.log("Stream servers:", streamServers);
  
  // Map genre IDs to genre names for TV series
  const genreNames = tmdbSeries.genre_ids ? 
    tmdbSeries.genre_ids.map((id: number) => TMDB_TV_GENRES[id]).filter(Boolean) : [];

  const seriesData: SeriesCreate = {
    title: tmdbSeries.name || tmdbSeries.title,
    original_title: tmdbSeries.original_name || tmdbSeries.original_title,
    tmdb_id: tmdbSeries.id,
    poster_path: tmdbSeries.poster_path,
    backdrop_path: tmdbSeries.backdrop_path,
    overview: tmdbSeries.overview,
    first_air_date: tmdbSeries.first_air_date,
    rating: tmdbSeries.vote_average,
    number_of_seasons: tmdbSeries.number_of_seasons || null,
    number_of_episodes: tmdbSeries.number_of_episodes || null,
    status: tmdbSeries.status || null,
    genres: genreNames,
    stream_servers: streamServers.filter(server => server.url.trim() !== ''),
    seasons: []
  };

  return addSeries(seriesData);
};

// Import from IMDB ID para series
export const importSeriesFromIMDB = async (imdbId: string, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Series> => {
  console.log("Importing series from IMDB ID:", imdbId);
  
  // Buscar datos en TMDB usando IMDB ID
  const tmdbData = await searchSeriesByIMDBId(imdbId);
  
  if (!tmdbData || tmdbData.type !== 'tv') {
    throw new Error('No se encontró la serie en TMDB con este IMDB ID');
  }
  
  // Usar la función existente para importar desde TMDB
  return importSeriesFromTMDB(tmdbData, streamServers);
};

// Import from IMDB ID using OMDb
export const importSeriesFromIMDBWithOMDb = async (imdbId: string, streamServers: Array<{
  name: string;
  url: string;
  quality?: string;
  language?: string;
}>): Promise<Series> => {
  console.log("Importing series from IMDB ID using OMDb:", imdbId);
  
  const { searchSeriesByIMDBIdOMDb, convertOMDbToSeries } = await import('./omdbService');
  
  // Buscar datos en OMDb usando IMDB ID
  const omdbData = await searchSeriesByIMDBIdOMDb(imdbId);
  
  if (!omdbData || omdbData.Response === "False") {
    throw new Error('No se encontró la serie en OMDb con este IMDB ID');
  }
  
  // Convertir datos de OMDb al formato de Series
  const seriesData: SeriesCreate = {
    ...convertOMDbToSeries(omdbData),
    stream_servers: streamServers.filter(server => server.url.trim() !== '')
  };
  
  return addSeries(seriesData);
};
