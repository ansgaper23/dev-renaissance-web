
import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: string;
  tmdb_id?: number | null;
  title: string;
  original_title?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  release_date?: string | null;
  genre_ids?: number[] | null;
  genres?: string[] | null;
  rating?: number | null;
  runtime?: number | null;
  trailer_url?: string | null;
  stream_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// For creating a new movie, title is required
export interface MovieCreate extends Omit<Partial<Movie>, 'title'> {
  title: string; // Title is required
}

export const fetchMovies = async (searchTerm: string = ''): Promise<Movie[]> => {
  let query = supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Movie[];
};

export const fetchMovieById = async (id: string): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data as Movie;
};

export const addMovie = async (movie: MovieCreate): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .insert(movie)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0] as Movie;
};

export const updateMovie = async (id: string, updates: Partial<Movie>): Promise<Movie> => {
  const { data, error } = await supabase
    .from('movies')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0] as Movie;
};

export const deleteMovie = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};
