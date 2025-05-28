
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
  created_at?: string | null;
  updated_at?: string | null;
}

// For creating a new series, title is required
export interface SeriesCreate extends Omit<Partial<Series>, 'title'> {
  title: string; // Title is required
}

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
  
  return (data || []).map(row => ({
    ...row,
    stream_servers: Array.isArray(row.stream_servers) ? row.stream_servers : [],
    seasons: Array.isArray(row.seasons) ? row.seasons : []
  })) as Series[];
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
  
  return {
    ...data,
    stream_servers: Array.isArray(data.stream_servers) ? data.stream_servers : [],
    seasons: Array.isArray(data.seasons) ? data.seasons : []
  } as Series;
};

export const addSeries = async (series: SeriesCreate): Promise<Series> => {
  const { data, error } = await supabase
    .from('series')
    .insert(series)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  const row = data[0];
  return {
    ...row,
    stream_servers: Array.isArray(row.stream_servers) ? row.stream_servers : [],
    seasons: Array.isArray(row.seasons) ? row.seasons : []
  } as Series;
};

export const updateSeries = async (id: string, updates: Partial<Series>): Promise<Series> => {
  const { data, error } = await supabase
    .from('series')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  const row = data[0];
  return {
    ...row,
    stream_servers: Array.isArray(row.stream_servers) ? row.stream_servers : [],
    seasons: Array.isArray(row.seasons) ? row.seasons : []
  } as Series;
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
