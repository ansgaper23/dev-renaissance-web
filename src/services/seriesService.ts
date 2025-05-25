
import { supabase } from "@/integrations/supabase/client";

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
  
  return data as Series[];
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
  
  return data as Series;
};

export const addSeries = async (series: SeriesCreate): Promise<Series> => {
  const { data, error } = await supabase
    .from('series')
    .insert(series)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0] as Series;
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
  
  return data[0] as Series;
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
