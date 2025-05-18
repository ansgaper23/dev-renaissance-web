
import { supabase } from "@/integrations/supabase/client";

export const fetchMovies = async (searchTerm: string = '') => {
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
  
  return data;
};

export const fetchMovieById = async (id: string) => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
};

export const addMovie = async (movie: any) => {
  const { data, error } = await supabase
    .from('movies')
    .insert(movie)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0];
};

export const updateMovie = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('movies')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', id)
    .select();
    
  if (error) {
    throw new Error(error.message);
  }
  
  return data[0];
};

export const deleteMovie = async (id: string) => {
  const { error } = await supabase
    .from('movies')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  return true;
};
