
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

export interface SeriesCreate extends Omit<Partial<Series>, 'title'> {
  title: string;
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

export const addSeries = async (series: SeriesCreate): Promise<Series> => {
  console.log("Adding series to database:", series);
  
  const { data, error } = await supabase
    .from('series')
    .insert(series)
    .select()
    .single();
    
  if (error) {
    console.error("Error adding series:", error);
    throw new Error(error.message);
  }
  
  console.log("Series added successfully:", data);
  return data as Series;
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
